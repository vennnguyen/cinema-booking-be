import { getComboController } from "controllers/combo.controller";
import express from "express";

const router = express.Router();

router.get("/", getComboController);

export default router;
