import prisma from "config/prisma";

const getSeatByShowService = async (showId: number) => {
  // Lấy showtime để biết roomId
  const showtime = await prisma.showtime.findUnique({
    where: { showId },
    select: { roomId: true, room: { select: { roomTypeId: true } } },
  });

  if (!showtime) return [];

  // Lấy tất cả showtimeseat theo showId, join seat + seattype
  const showtimeSeats = await prisma.showtimeseat.findMany({
    where: { showId },
    include: {
      seat: {
        include: { seattype: true },
      },
    },
    orderBy: [
      { seat: { seatRow: "asc" } },
      { seat: { seatColumn: "asc" } },
    ],
  });

  if (!showtimeSeats.length) return [];

  // Lấy tất cả giá theo roomTypeId
  const prices = await prisma.priceticket.findMany({
    where: {
      roomTypeId: showtime.room.roomTypeId,
      status: true,
    },
    include: { tickettype: true },
  });

  // Map dữ liệu trả về
  return showtimeSeats.map((sts) => {
    const matchedPrices = prices.filter(
      (p) => p.seatTypeId === sts.seat.seatTypeId,
    );
    return {
      showTimeSeatId: sts.showTimeSeatId,
      seatId: sts.seatId,
      seatRow: sts.seat.seatRow,
      seatColumn: sts.seat.seatColumn,
      seatTypeId: sts.seat.seatTypeId,
      seatTypeName: sts.seat.seattype.seatTypeName,
      status: sts.status,         // AVAILABLE / HOLDING / BOOKED
      heldUntil: sts.heldUntil,
      prices: matchedPrices.map((p) => ({
        priceTicketId: p.priceTicketId,
        ticketTypeId: p.ticketTypeId,
        ticketTypeName: p.tickettype.ticketTypeName,
        price: p.price,
      })),
    };
  });
};

export { getSeatByShowService };