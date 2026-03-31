import { Request, Response } from "express";
import { getShowTimeBySlugService } from "services/showtime.service";
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
export { getShowTimeBySlugController };
