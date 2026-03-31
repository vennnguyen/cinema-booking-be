import { Request, Response } from "express";
import {
  getProductBySlugService,
  getProductService,
} from "services/product.service";

const getProductController = async (req: Request, res: Response) => {
  try {
    const data = await getProductService();
    if (data) {
      return res.status(200).json({ data });
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phim", error);
    return res.status(500);
  }
};
const getProductBySlugController = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const data = await getProductBySlugService(slug as string);
    if (data) {
      return res.status(200).json({ data });
    }
  } catch (error) {
    console.error("Lỗi khi lấy phim theo slug", error);
    return res.status(500);
  }
};

export { getProductController, getProductBySlugController };
