import { getTheaterController } from "@/controllers/theater.controller";
import express from "express";

const router = express.Router();

router.get("/", getTheaterController);

export default router;
