import { getCinemasByMovieService, getTheaterService } from "@/services/theater.service";
import { Request, Response } from "express";
import { getShowTimeBySlugService } from "services/showtime.service";
const getTheaterController = async (req: Request, res: Response) => {
  try {
    
    const data = await getTheaterService();
    if (data) {
      return res.status(200).json({ data });
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách rạp chiếu", error);
    return res.status(500);
  }
};
 const getCinemasByMovieController = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.query;
    const data = await getCinemasByMovieService(Number(movieId));
    if (data) return res.status(200).json({ data });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách rạp", error);
    return res.status(500);
  }
};
export { getTheaterController,getCinemasByMovieController };