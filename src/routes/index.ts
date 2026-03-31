import express from "express";
import productRoutes from "./product.route";
import showtimeRoutes from "./showtime.route";
const router = express.Router();

router.use("/products", productRoutes);
router.use("/showtimes", showtimeRoutes);

export default router;
