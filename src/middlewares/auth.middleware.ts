import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction
 } from "express";
import "dotenv/config"
import { findUserById } from '@/services/auth.service';

interface JwtPayload {
  userId: number
}
export const protectedRoute = (req:Request, res:Response, next: NextFunction) => {
    try {
        //lấy token từ header
        const authHeader = req.headers['authorization']
        const token  = authHeader && authHeader.split(" ")[1] // Bearer <token>
        //xác nhận token hợp lệ
        if(!token) return res.status(401).json({message: "Không tìm thấy access token"})
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, async(error, decodedUser) => {
            if(error){
                console.error(error)
                 return res.status(403).json({message: "Access token hết hạn hoặc không đúng"})
            }
            const payload = decodedUser as JwtPayload
            //tìm user
            const user = await findUserById(payload.userId)
            if(!user) return res.status(404).json({message: "Người dùng không tồn tại"})


            //trả user vào req
            req.user = user
           next()
    })

        
        
    } catch (error) {
        console.error("Lỗi khi xác minh JWT trong middleware", error)
        return res.status(500).json({message:"Lỗi hệ thống"})
    }
}