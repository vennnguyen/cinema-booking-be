
import { getAllUsersController, getMeController } from "@/controllers/user.controller";
import express from "express";

const router = express.Router();

router.get("/me", getMeController);
router.get("/", getAllUsersController);

export default router;
