import { getBookingController } from "controllers/booking.controller";
import express from "express";

const router = express.Router();

router.get("/", getBookingController);
// router.get("/:slug", getProductBySlugController);

export default router;