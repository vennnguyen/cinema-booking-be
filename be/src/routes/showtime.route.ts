import { getShowTimeBySlugController } from "controllers/showtime.controller";
import express from "express";

const router = express.Router();

router.get("/:slug", getShowTimeBySlugController);

export default router;
