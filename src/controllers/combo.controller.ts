import { Request, Response } from "express";
import { getComboService } from "services/combo.service";

const getComboController = async (req: Request, res: Response) => {
  try {
    const data = await getComboService();
    if (data) {
      return res.status(200).json({ data });
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phim", error);
    return res.status(500);
  }
};
export { getComboController };
