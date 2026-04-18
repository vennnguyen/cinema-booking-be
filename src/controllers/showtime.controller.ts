import { Request, Response } from "express";
import { getDatesByMovieCinemaService, getShowTimeBySlugService, getShowtimesService } from "services/showtime.service";
const getShowTimeBySlugController = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const data = await getShowTimeBySlugService(slug as string);
    if (data) {
      return res.status(200).json({ data });
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách chiếu phim", error);
    return res.status(500);
  }
};
const getDatesByMovieCinemaController = async (req: Request, res: Response) => {
  try {
    const { movieId, cinemaId } = req.query;
    const data = await getDatesByMovieCinemaService(Number(movieId), Number(cinemaId));
    if (data) return res.status(200).json({ data });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách ngày chiếu", error);
    return res.status(500);
  }
};
const getShowtimesController = async (req: Request, res: Response) => {
  try {
    const { movieId, cinemaId, date } = req.query;
    const data = await getShowtimesService(Number(movieId), Number(cinemaId), String(date));
    if (data) return res.status(200).json({ data });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách giờ chiếu", error);
    return res.status(500);
  }
};
export { getShowTimeBySlugController,getDatesByMovieCinemaController,getShowtimesController };
