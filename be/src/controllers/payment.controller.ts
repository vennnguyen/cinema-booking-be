import prisma from "@/config/prisma";
import { sendTicketEmail } from "@/helper/email.sender";
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

const vnPayCallBack = async (req: Request, res: Response) => {
    const { vnp_ResponseCode, vnp_TxnRef, vnp_TransactionNo, vnp_PayDate } = req.query;
    
    if (vnp_ResponseCode !== '00') {
        throw new Error('Thanh toán thất bại');
    }
    
    const orderId = vnp_TxnRef?.toString().split("_")[0];
    
    const findOrder = await prisma.order.findUnique({
        where: { orderId: Number(orderId) },
        include: {
            orderdetail: {
                include: {
                    ticket: {
                        include: {
                            showtimeseat: true
                        }
                    }
                }
            }
        }
    });
    
    if (!findOrder) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    // Lấy tất cả showTimeSeatId từ các ticket trong order
    const showTimeSeatIds = findOrder.orderdetail
        .filter(detail => detail.ticket !== null)
        .map(detail => detail.ticket!.showTimeSeatId);

    await prisma.$transaction([
        prisma.payment.create({
            data: {
                orderId: findOrder.orderId,
                method: "VNPAY",
                amount: findOrder.totalPrice,
                transactionId: vnp_TransactionNo?.toString(),
                paidAt: formatVNPayDate(vnp_PayDate as string),
                createdAt: new Date()
            }
        }),
        prisma.order.update({
            where: { orderId: Number(orderId) },
            data: { paymentStatus: "PAID" }
        }),
        // Cập nhật tất cả ghế sang BOOKED
        prisma.showtimeseat.updateMany({
            where: {
                showTimeSeatId: { in: showTimeSeatIds }
            },
            data: { status: "BOOKED" }
        })
    ]);
     // Lấy thông tin để gửi mail
  const fullOrder = await prisma.order.findUnique({
    where: { orderId: Number(orderId) },
    include: {
      user: true,
      orderdetail: {
        include: {
          ticket: {
            include: {
              showtimeseat: {
                include: {
                  seat: { include: { seattype: true } },
                  showtime: {
                    include: {
                      movie: true,
                      room: { include: { cinema: true, roomtype: true } },
                    },
                  },
                },
              },
            },
          },
          combo: true,
        },
      },
    },
  });

  if (fullOrder) {
    const show = fullOrder.orderdetail[0]?.ticket?.showtimeseat?.showtime;
    const ticketDetails = fullOrder.orderdetail
      .filter(d => d.ticket)
      .map(d => ({
        seat: `${d.ticket!.showtimeseat.seat.seatRow}${d.ticket!.showtimeseat.seat.seatColumn}`,
        ticketId: d.ticket!.ticketId,
      }));

    const combos = fullOrder.orderdetail
      .filter(d => d.combo)
      .map(d => ({
        name: d.combo!.comboName,
        quantity: d.quantity,
        price: Number(d.unitPrice),
      }));

    await sendTicketEmail(fullOrder.user.email, {
      userName: fullOrder.user.fullName,
      movieName: show?.movie.movieName ?? "",
      cinemaName: show?.room.cinema.cinemaName ?? "",
      roomName: show?.room.roomName ?? "",
      releaseDate: new Date(show?.releaseDate ?? "").toLocaleDateString("vi-VN"),
      startTime:show?.startTime
  ? new Date(show.startTime).toISOString().slice(11, 16)
  : "",
      seats: ticketDetails.map(t => t.seat),
      combos,
      totalPrice: Number(fullOrder.totalPrice),
      ticketIds: ticketDetails.map(t => t.ticketId)
    });
  }

    return res.redirect(
        `http://localhost:5173?vnp_ResponseCode=${vnp_ResponseCode}`
    );
};
export {createPayment,vnPayCallBack}




