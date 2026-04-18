import prisma from "@/config/prisma"

const getTheaterService = async() => {
    const data = await prisma.cinema.findMany()
    return data
}
const getCinemasByMovieService = async (movieId: number) => {
  return await prisma.cinema.findMany({
    where: {
      status: true,
      room: {
        some: {
          showtime: {
            some: { movieId, status: true }
          }
        }
      }
    },
    select: { cinemaId: true, cinemaName: true }
  });
};
export {getTheaterService,getCinemasByMovieService}