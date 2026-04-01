import prisma from "config/prisma";

const getBookingService = async (id: number) => {
  const showDetail = await prisma.showtime.findUnique({
    where: {
      showId: id,
    },
    include: {
      movie: {
        include: {
          movietype: true,
        },
      },
      room: {
        include: {
          roomtype: true,
          cinema: true,
        },
      },
      showtimeseat: {
        include: {
          seat: {
            include: {
              seattype: true,
            },
          },
        },
        orderBy: [
          { seat: { seatRow: "asc" } },
          { seat: { seatColumn: "asc" } },
        ],
      },
    },
  });
  return showDetail;
};
export { getBookingService };
