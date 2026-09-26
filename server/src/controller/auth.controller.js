import userModel from "../models/user.model.js";
import bcryptjs from "bcryptjs"
import { createAccessToken } from "../utils/auth.utils.js";
import { createRefreshToken } from "../utils/auth.utils.js";

export async function register (req, res) {
    const { email, name, password } = req.body

    const isUserAlreadyExists = await userModel.findOne({
        email
    })

    if(isUserAlreadyExists){
        return res.status(400).json({
            message:"User already exits with this email address",
            errors:[
                {
                    field:"email",
                    message:"User already exists with this eamil address"
                }
            ]
        })
    }

    const user = await userModel.create({
        email,
        name,
        passwordHash:await bcrypt.hash(password, 12)
    })

    const accessToken = createAccessToken({
        userId: user._id,
        role: user.role
    })

    const refreshToken = createRefreshToken({
        userId: user._id,
        role: user.role
    })
}