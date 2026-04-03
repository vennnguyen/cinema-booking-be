
import { signInController, signUpController } from "controllers/auth.controller";
import express from "express";

const router = express.Router();

router.post("/sign-up", signUpController);
router.post("/sign-in", signInController);


export default router;