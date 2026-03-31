import express from "express";
import {
  getProductBySlugController,
  getProductController,
} from "controllers/product.controller";

const router = express.Router();

router.get("/", getProductController);
router.get("/:slug", getProductBySlugController);

export default router;
