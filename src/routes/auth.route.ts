
import { signUpController } from "controllers/auth.controller";
import express from "express";

const router = express.Router();

router.post("/signup", signUpController);


export default router;