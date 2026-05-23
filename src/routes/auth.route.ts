
import { refreshTokenController, signInController, signOutController, signUpController } from "controllers/auth.controller";
import express from "express";

const router = express.Router();

router.post("/sign-up", signUpController);
router.post("/sign-in", signInController);
router.post("/sign-out", signOutController);
router.post("/refresh", refreshTokenController)

// router.post("/send-otp", sendOTP);      
// router.post("/verify-otp", verifyOTPController);





export default router;