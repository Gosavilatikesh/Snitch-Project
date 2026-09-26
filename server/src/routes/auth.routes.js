import { Router } from "express";
import { registerValidator } from "../validators/auth.validator.js"
import { register } from "../controller/auth.controller.js";

const router = Router()

router.post("/register", registerValidator, register)

export default router