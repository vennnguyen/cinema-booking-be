import { Request, Response } from "express";
import { getProductService } from "services/product.service";

const getProductController = async (req: Request, res: Response) => {
  try {
    const data = await getProductService();
    if (data) {
      return res.status(200).json({ data });
    }
  } catch (error) {
    console.error("Lỗi khi gọi api", error);
    return res.status(500);
  }
};

export { getProductController };
