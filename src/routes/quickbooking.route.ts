import { getDatesByMovieCinemaController, getShowtimesController } from "@/controllers/showtime.controller";
import { getCinemasByMovieController } from "@/controllers/theater.controller";
import express from "express";


const router = express.Router();

router.get("/cinemas", getCinemasByMovieController);   
router.get("/dates", getDatesByMovieCinemaController); 
router.get("/showtimes", getShowtimesController);     

export default router;