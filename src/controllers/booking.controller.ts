import { Request, Response } from "express";
import { getBookingService } from "services/booking.service";
// import { getShowTimeBySlugService } from "services/showtime.service";
const getBookingController = async (req: Request, res: Response) => {
  try {
    const idParam = req.query.id;

    const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const data = await getBookingService(id);
    if (data) {
      return res.status(200).json({ data });
    }
  } catch (error) {
    console.error("Lỗi khi lấy thông tin chiếu phim", error);
    return res.status(500);
  }
};
export { getBookingController };
