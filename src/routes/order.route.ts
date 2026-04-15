
import { createOrderController } from "@/controllers/order.controller";
import express from "express";

const router = express.Router();

router.post("/", createOrderController);


export default router;