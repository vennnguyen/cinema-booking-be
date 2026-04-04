
import { getMeController } from "@/controllers/user.controller";
import express from "express";

const router = express.Router();

router.get("/", getMeController);

export default router;
