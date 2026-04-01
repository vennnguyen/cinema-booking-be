import prisma from "config/prisma";

const getSeatByTheaterService = async (id: number) => {
  const seats = await prisma.seat.findMany({
    where: {
      roomId: id,
    },
  });
  return seats;
};
export { getSeatByTheaterService };
