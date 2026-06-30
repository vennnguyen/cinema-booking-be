import { getSeatByTheaterController } from "controllers/seat.controller";
import express from "express";

const router = express.Router();

router.get("/", getSeatByTheaterController);

export default router;
