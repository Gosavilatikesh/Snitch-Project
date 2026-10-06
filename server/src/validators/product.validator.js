import { body, validationResult } from "express-validator";

export const createProductValidator = [
  body("title")
    .exists().withMessage("Title is required").bail()
    .isString().withMessage("Title ,ust be a string").bail()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("Title length must be between 2 to 100 characters").bail()
    .isAlpha("en-US", { ignore: " -" })
    .withMessage("Title can only have english small case and capital case character",),

  body("description")
    .exists().withMessage("Description is required").bail()
    .isString().withMessage("Descrpition must be string").bail()
    .trim()
    .isLength({ min: 20, max: 500 }).withMessage("Description length must be between 20 to 500 characters"),

  body("price.amount")
    .exists().withMessage("Price amount is required").bail()
    .isFloat({ min: 0 }).withMessage("Price must be a floating number and muct be greater than 0"),

  body("price.currency")   
    .exists().withMessage("Currency is required").bail() 
    .isString().withMessage("Currency must be a string value")
    .isIn(["INR", "USD"]).withMessage("Only INR and USD is allowed"),

  body("sizes")   
    .exists().withMessage("Sizes is required").bail()
    .isArray().withMessage("Sizes must be an array of object"),

  body("sizes.*.size")
    .exists().withMessage("Size must be present in evry entry in sizes array").bail()
    .isString().withMessage("Size must be a string value").bail()
    .trim()
    .isIn(["XS","S","M","L","XL","XXL"]).withMessage("Size can be one of these - XS, S, M, L, XL, XXL."),

  body("sizes.*.stock")
    .exists().withMessage("Sizes stock must be present in every entry of the sizes array").bail()
    .isIn({ min: 0 }).withMessage("Stock must be a integer value").bail(),
    
    (req,res,next) => {
        const errors = validationResult(req)

        if(!errors.isEmpty()){
            return res.status(400).json({
                message:"Invalid request",
                errors: errors.array()
            })
        }

        next()
    }
];
