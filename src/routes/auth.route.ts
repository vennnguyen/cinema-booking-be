
import { refreshTokenController, signInController, signOutController, signUpController } from "controllers/auth.controller";
import express from "express";

const router = express.Router();

router.post("/sign-up", signUpController);
router.post("/sign-in", signInController);
router.post("/sign-out", signOutController);
router.post("/refresh", refreshTokenController)




export default router;