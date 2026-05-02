import prisma from "config/prisma";
interface ComboInput {
  comboId: number;
  quantity: number;
}

interface SeatInput {
  seatId: number;
  seatTypeId: number;
}
const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
};
const createOrderService = async (userId:number, showId: number, combos: ComboInput[],seats: SeatInput[]) => {
    const user = await prisma.user.findUnique({
    where: { userId }
  });

  if (!user) throw new Error("User không tồn tại");
  if (!user.dateOfBirth) throw new Error("User chưa cập nhật ngày sinh");

  const age = calculateAge(user.dateOfBirth);
  const ticketTypeId = (age > 22 && age < 60) ? 1 : 2;
  const showtime = await prisma.showtime.findUnique({
    where: { showId },
    include: { room: true }
  });

  if (!showtime) throw new Error("Showtime không tồn tại");

  const roomTypeId = showtime.room.roomTypeId;

  // 2. Kiểm tra các ghế còn AVAILABLE không
  const showtimeSeats = await prisma.showtimeseat.findMany({
    where: {
      showId,
      seatId: { in: seats.map(s => s.seatId) },
    }
  });

  // Ghế chưa có record trong showtimeseat = chưa được tạo (lỗi data)
  if (showtimeSeats.length !== seats.length) {
    throw new Error("Một số ghế không tồn tại trong suất chiếu này");
  }

  const unavailable = showtimeSeats.filter(s => s.status !== "AVAILABLE");
  if (unavailable.length > 0) {
    throw new Error(`Ghế đã được đặt hoặc đang giữ: ${unavailable.map(s => s.seatId).join(", ")}`);
  }

  // 3. Tính giá vé theo từng ghế
  let totalTicketPrice = 0;
  const ticketPrices: { seatId: number; priceTicketId: number; price: number; showTimeSeatId: number }[] = [];

  for (const seat of seats) {
    const priceTicket = await prisma.priceticket.findFirst({
      where: {
        roomTypeId,
        seatTypeId: seat.seatTypeId,
        ticketTypeId,
        status: true
      }
    });

    if (!priceTicket) {
      throw new Error(`Không tìm thấy giá vé cho ghế seatId=${seat.seatId}`);
    }

    const showtimeSeat = showtimeSeats.find(s => s.seatId === seat.seatId)!;

    totalTicketPrice += Number(priceTicket.price);
    ticketPrices.push({
      seatId: seat.seatId,
      priceTicketId: priceTicket.priceTicketId,
      price: Number(priceTicket.price),
      showTimeSeatId: showtimeSeat.showTimeSeatId
    });
  }

  // 4. Tính giá combo
  let totalComboPrice = 0;
  const comboDetails: { comboId: number; quantity: number; unitPrice: number }[] = [];

  for (const combo of combos) {
    const comboData = await prisma.combo.findUnique({
      where: { comboId: combo.comboId }
    });

    if (!comboData || !comboData.status) {
      throw new Error(`Combo ${combo.comboId} không tồn tại hoặc không hoạt động`);
    }

    const subtotal = Number(comboData.price) * combo.quantity;
    totalComboPrice += subtotal;
    comboDetails.push({
      comboId: combo.comboId,
      quantity: combo.quantity,
      unitPrice: Number(comboData.price)
    });
  }

  const totalPrice = totalTicketPrice + totalComboPrice;

  // 5. Transaction: tạo order + giữ ghế + tạo ticket + orderdetail
  const order = await prisma.$transaction(async (tx) => {
    // Tạo order
    const newOrder = await tx.order.create({
      data: {
        userId,
        totalPrice,
        paymentStatus: "PENDING"
      }
    });

    // Giữ ghế (HOLDING) + tạo ticket + orderdetail cho từng ghế
    for (const tp of ticketPrices) {
      // Giữ ghế
      await tx.showtimeseat.update({
        where: { showTimeSeatId: tp.showTimeSeatId },
        data: {
          status: "HOLDING",
          heldUntil: new Date(Date.now() + 10 * 60 * 1000) // giữ 10 phút
        }
      });

      // Tạo ticket
      const ticket = await tx.ticket.create({
        data: {
          showTimeSeatId: tp.showTimeSeatId,
          priceTicketId: tp.priceTicketId,
        }
      });

      // Tạo orderdetail cho vé
      await tx.orderdetail.create({
        data: {
          orderId: newOrder.orderId,
          ticketId: ticket.ticketId,
          quantity: 1,
          unitPrice: tp.price
        }
      });
    }

    // Tạo orderdetail cho combo
    for (const cd of comboDetails) {
      await tx.orderdetail.create({
        data: {
          orderId: newOrder.orderId,
          comboId: cd.comboId,
          quantity: cd.quantity,
          unitPrice: cd.unitPrice
        }
      });
    }

    return newOrder;
  });

  return order;
}
export {createOrderService}