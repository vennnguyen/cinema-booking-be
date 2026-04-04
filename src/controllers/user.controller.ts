
import { Request, Response } from "express";
const getMeController = async (req: Request, res: Response) => {
    try {
        const user = req.user
        return res.status(200).json({user})
    } catch (error) {
        console.error("Lỗi khi gọi auth me", error);
    return res.status(500);
    }
}
export {getMeController}