
import { getUser } from "@/services/user.service";
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

const getAllUsersController = async (req: Request, res: Response) => {
    try {
        const users = await getUser()
        return res.status(200).json({users})
    } catch (error) {
        console.error("Lỗi khi gọi getAllUsers", error);
        return res.status(500).json({ message: "Lỗi máy chủ" });
    }
}
export {getMeController, getAllUsersController}