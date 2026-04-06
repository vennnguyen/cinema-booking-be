
import { createPayment, vnPayCallBack } from "@/controllers/payment.controller";
import express from "express";

const router = express.Router();

router.post("/create-payment", createPayment);
router.get("/vnpay-callback", vnPayCallBack)


export default router;
