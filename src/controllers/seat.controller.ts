import { Request, Response } from "express";
import { getSeatByTheaterService } from "services/seat.service";

const getSeatByTheaterController = async (req: Request, res: Response) => {
  try {
    const idParam = req.query.id;

    const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const data = await getSeatByTheaterService(id);
    if (data) {
      return res.status(200).json({ data });
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách chỗ ngồi", error);
    return res.status(500);
  }
};
export { getSeatByTheaterController };
