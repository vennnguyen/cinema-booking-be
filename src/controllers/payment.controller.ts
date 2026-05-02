import prisma from "@/config/prisma";
import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat, HashAlgorithm } from "vnpay";
const formatVNPayDate = (dateStr: string) => {
    return new Date(
        dateStr.replace(
            /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
            "$1-$2-$3T$4:$5:$6"
        )
    );
};


const createPayment = async (req: Request, res: Response) => {
    const order = await prisma.order.findFirst({
  orderBy: {
    orderId: "desc"
  },
  include: {
    user: true
  }
});

if (!order) {
  return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
}
  const vnpay = new VNPay({
    tmnCode: '13H9HAMI',
    secureSecret: 'V61ZAECBFQDFG6C7KQAY7FDYN20IVKC0',
    vnpayHost: "https://sandbox.vnpayment.vn",
    testMode: true, // tùy chọn
    hashAlgorithm: HashAlgorithm.SHA512, // tùy chọn
    loggerFn: ignoreLogger, // tùy chọn
  });
  const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const vnpayResponse = vnpay.buildPaymentUrl({
                vnp_Amount: Number(order.totalPrice),
                vnp_IpAddr: '127.0.0.1', //
                vnp_TxnRef: `${order.orderId}_${randomUUID()}`,
                vnp_OrderInfo: `Thanh toan don hang ${order.orderId}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: `http://localhost:8080/api/payment/vnpay-callback`,
                vnp_Locale: VnpLocale.VN,
                vnp_CreateDate: dateFormat(new Date()),
                vnp_ExpireDate: dateFormat(tomorrow),
            });
            return res.status(201).json({
    message: "Tạo đơn hàng thành công",
    paymentUrl: vnpayResponse,  
  });
};

const vnPayCallBack = async(req: Request, res: Response) => {
    const {vnp_ResponseCode, vnp_TxnRef, vnp_TransactionNo, vnp_PayDate} = req.query
    if(vnp_ResponseCode !== '00') {
        throw new Error('Thanh toán thất bại')
    }
    const orderId = vnp_TxnRef?.toString().split("_")[0];
    const findOderId = await prisma.order.findUnique({
        where: {
            orderId: Number(orderId)
        }
    })
    if(!findOderId) return res.status(404).json({message: "Không tìm thấy giỏ hàng"})
        const newPayment = await prisma.payment.create({
    data:{
        orderId: findOderId.orderId,
        method:"VNPAY",
        amount:findOderId.totalPrice,
        transactionId: vnp_TransactionNo?.toString(),
        paidAt: formatVNPayDate(vnp_PayDate as string),
        createdAt: new Date()

    }})
    const updateOrder = await prisma.order.update({
        where: {
            orderId: Number(orderId)
        },
        data: {
            paymentStatus:"PAID"
        }
    })
    return res.redirect(
  `http://localhost:5173?vnp_ResponseCode=${vnp_ResponseCode}`
);
}
export {createPayment,vnPayCallBack}