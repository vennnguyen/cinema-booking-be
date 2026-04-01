import prisma from "config/prisma";

const getSeatByTheaterService = async (roomId: number) => {
  const seats = await prisma.seat.findMany({
    where: { roomId, status: true },
    include: {
      seattype: true,
    },
    orderBy: [{ seatRow: "asc" }, { seatColumn: "asc" }],
  });

  if (!seats.length) return [];

  // Lấy roomTypeId từ room
  const room = await prisma.room.findUnique({
    where: { roomId },
    select: { roomTypeId: true },
  });

  // Lấy tất cả giá theo roomTypeId
  const prices = await prisma.priceticket.findMany({
    where: {
      roomTypeId: room?.roomTypeId,
      status: true,
    },
    include: {
      tickettype: true,
    },
  });

  // Map giá vào từng ghế theo seatTypeId
  const seatsWithPrice = seats.map((seat) => {
    const matchedPrices = prices.filter(
      (p) => p.seatTypeId === seat.seatTypeId,
    );
    return {
      ...seat,
      prices: matchedPrices.map((p) => ({
        priceTicketId: p.priceTicketId,
        ticketTypeId: p.ticketTypeId,
        ticketTypeName: p.tickettype.ticketTypeName,
        price: p.price,
      })),
    };
  });

  return seatsWithPrice;
};

export { getSeatByTheaterService };
