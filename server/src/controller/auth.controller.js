import userModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { createAccessToken, readRefreshToken } from "../utils/auth.utils.js";
import { createRefreshToken } from "../utils/auth.utils.js";

export async function register(req, res) {
  const { email, name, password } = req.body;

  const isUserAlreadyExists = await userModel.findOne({
    email,
  });

  if (isUserAlreadyExists) {
    return res.status(400).json({
      message: "User already exits with this email address",
      errors: [
        {
          field: "email",
          message: "User already exists with this eamil address",
        },
      ],
    });
  }

  const user = await userModel.create({
    email,
    name,
    passwordHash: await bcrypt.hash(password, 12),
  });

  const accessToken = createAccessToken({
    userId: user._id,
    role: user.role,
  });

  const refreshToken = createRefreshToken({
    userId: user._id,
    role: user.role,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
  });

  await userModel.findByIdAndUpdate(user._id, {
    refreshToken,
  });

  res.status(201).json({
    message: "User Registered Successfully",
    data: {
      email: user.email,
      name: user.name,
      id: user._id,
    },
    accessToken,
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({
    email,
  });

  if (!user) {
    return res.status(400).json({
      message: "Invalid Email or Password",
    });
  }

  const isPasswordValid = bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }

  const accessToken = createAccessToken({
    userId: user._id,
    role: user.role,
  });

  const refreshToken = createRefreshToken({
    userId: user._id,
    role: user.role,
  });

  await userModel.findOneAndUpdate(
    {
      email,
    },
    {
      refreshToken,
    },
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
  });

  res.status(200).json({
    message: "User loggedIn successfully",
    data: {
      user: {
        id: user._id,
        email:user.email,
        name:user.name
      },
      accessToken 
    },
  });
}

export async function refresh(req, res) {
    const refreshToken = req.cookies.refreshToken

    if(!refreshToken){
        return res.status(400).json({
            message:"Refresh token is required"
        })
    }

    try {

        const decoded = readRefreshToken(refreshToken)

        const { userId, role } = decoded

        const user = await userModel.findById(userId)

        if(refreshToken != user.refreshToken){
            await userModel.findByIdAndDelete(user._id, {
                refreshToken: null
            })

            return res.status(401).json({
                message:"Refresh token mismatch"
            })
        }

        const accessToken = createAccessToken({
            userId, role
        })

        const newRefreshToken = createRefreshToken({
            userId, role
        })

        await userModel.findByIdAndUpdate(user._id, {
            refreshToken: newRefreshToken
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly:true
        })

        res.status(201).json({
            message:"Tokens rotated successfully",
            data:{
                user:{
                    email: user.email,
                    name: user.name,
                    id: user._id
                },
                accessToken
            }
        })
        
    } catch (error) {
        return res.status(401).json({
            message:"Invalid refresh token"
        })
    }
}

export async function getMe(req, res) {

    const { userId, role } = req.user

    const user = await userModel.findById(userId)

    res.status(200).json({
        message:"User data fetched successfully",
        data:{
            user:{
                email: user.email,
                name: user.name,
                id:user._id
            }
        }
    })
}