import { createOrderService } from "@/services/order.service";
import { Request, Response } from "express";


const createOrderController = async (req: Request, res: Response) => {
  try {
    const {userId, totalPrice} = req.body
    const order = await createOrderService(userId, totalPrice)
    if(!order) return res.status(401).json({message: "Tạo đơn hàng không thành công"})
    return res.status(201).json({
  message:"Tạo đơn hàng thành công",
  data: order
  })
  } catch (error) {
     console.error("Lỗi khi tạo đơn hàng", error);
    return res.status(500);
  }
};
export { createOrderController };
