import { Request, Response } from "express";
import bcrypt from 'bcrypt'
import { deleteSession, findSession, findUserByEmail, isEmailExist, postRefreshToken, postUser } from "services/auth.service";
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import "dotenv/config";
import { log } from "console";
import { BADHINTS } from "dns/promises";
const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000 //14 ngày

const signUpController = async (req: Request, res: Response) => {
   try {
     const {email, password, fullName, phone, birthDay} = req.body

     if(!email || !password || !fullName || !phone || !birthDay ) {
        return res.status(401).json({message: "Không thể thiếu email, password, fullName, phone, birthDay"})
     }
     const duplicate = await isEmailExist(email)
     if(duplicate) {
      return res.status(409).json({message: "Email đã tồn tại"}) 
     }
        //mã hóa password
    const hashedPassword = await bcrypt.hash(password, 10) // 10 là salt
    await postUser(email, hashedPassword, fullName, phone, birthDay)

    return res.status(201).json({ message: "Đăng ký thành công" });
   } catch (error) {
     console.error("Lỗi khi đăng kí", error);
    return res.status(500).json({ message: "Lỗi server" });
   }
}

const signInController =  async (req: Request, res: Response) => {
   try {
      const {username, password} = req.body
      if(!username || !password) {
         return res.status(400).json({message: "Thiếu email hoặc password"})
      }

      const user = await findUserByEmail(username)
      if(!user) return res.status(401).json({messaege: "Email hoặc mật khẩu không đúng"})

      const passwordCorrect = await bcrypt.compare(password, user.password)
      if(!passwordCorrect) return res.status(401).json({messaege: "Email hoặc mật khẩu không đúng"})

      const accessToken = jwt.sign({userId: user.userId}, process.env.ACCESS_TOKEN_SECRET as string, {expiresIn : ACCESS_TOKEN_TTL})

      const refreshToken = crypto.randomBytes(64).toString('hex')

      await postRefreshToken(user.userId, refreshToken, REFRESH_TOKEN_TTL)
      res.cookie('refreshToken', refreshToken, {
         httpOnly:true,
         secure:true,
         sameSite:"none",
         maxAge:REFRESH_TOKEN_TTL
      })

      return res.status(200).json({message: `User ${user.fullName} đã đăng nhập`, accessToken})
   } catch (error) {
      console.error("Lỗi khi đăng nhập", error);
    return res.status(500).json({ message: "Lỗi server" });
   }

}

const signOutController =  async (req: Request, res: Response) => {
   try {
      // láy refreshToken trong cookie
      const token = req.cookies?.refreshToken
      if(token){
         await deleteSession(token)
         res.clearCookie("refreshToken")
      }
      return res.status(204)
   } catch (error) {
       console.error("Lỗi khi đăng xuát", error);
    return res.status(500).json({ message: "Lỗi server" });
   }
}
const refreshTokenController = async (req: Request, res: Response) => {
  try {
    // lấy refresh token từ cookies
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Lỗi không có token" });
    }
    // so với refresh token trong db
    const session = await findSession(token);
    if (!session) {
      return res
        .status(403)
        .json({ message: "Token không hợp lệ hoặc hết hạn" });
    }
    // kiểm tra hạn sd
    if (session.expiresAt < new Date()) {
      return res.status(403).json({ message: "Token hết hạn" });
    }
    //tạo access mới
    const accessToken = jwt.sign(
      { userId: session.userId },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: ACCESS_TOKEN_TTL,
      },
    );
    //trả về client
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Lỗi khi gọi refresh token ", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
export {signUpController, signInController,signOutController,refreshTokenController}