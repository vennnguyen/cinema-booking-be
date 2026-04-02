import express from "express";
import productRoutes from "./product.route";
import showtimeRoutes from "./showtime.route";
import bookingRoutes from "./booking.route";
import seatRoutes from "./seat.route";
import comboRoutes from "./combo.route";
const router = express.Router();

router.use("/products", productRoutes);
router.use("/showtimes", showtimeRoutes);
router.use("/booking", bookingRoutes);
router.use("/seat", seatRoutes);
router.use("/combo", comboRoutes);

export default router;
