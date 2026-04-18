import express from "express";
import productRoutes from "./product.route";
import showtimeRoutes from "./showtime.route";
import bookingRoutes from "./booking.route";
import seatRoutes from "./seat.route";
import comboRoutes from "./combo.route";
import theaterRoutes from "./theater.route";
import quickBookingRoutes from "./quickbooking.route";
import userRoutes from "./user.route";
import { protectedRoute } from "@/middlewares/auth.middleware";
import paymentRoutes from "./payment.route";
import orderRoutes from "./order.route";
const router = express.Router();

router.use("/products", productRoutes);
router.use("/showtimes", showtimeRoutes);
router.use("/theaters", theaterRoutes);
router.use("/quick-booking", quickBookingRoutes);
router.use("/combo", comboRoutes);
// protected routes
router.use("/booking", protectedRoute, bookingRoutes);
router.use("/seat", protectedRoute, seatRoutes);
router.use("/order", orderRoutes)

router.use("/me", protectedRoute,userRoutes)
router.use("/payment", paymentRoutes)

export default router;
