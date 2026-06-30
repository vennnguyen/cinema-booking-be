import prisma from "config/prisma";

const getShowTimeBySlugService = async (slug: string) => {
  const movie = await prisma.movie.findFirst({
    where: { slug },
  });

  if (!movie) return null;
  const data = await prisma.showtime.findMany({
    where: {
      movieId: movie.movieId,
      //   status: 1,
    },
    include: {
      room: {
        include: {
          roomtype: true,
          cinema: true,
        },
      },
    },
    orderBy: [{ releaseDate: "asc" }, { startTime: "asc" }],
  });

  return data;
};
 const getDatesByMovieCinemaService = async (movieId: number, cinemaId: number) => {
  const rows = await prisma.showtime.findMany({
    where: {
      movieId,
      status: true,
      room: { cinemaId }
    },
    select: { releaseDate: true },
    distinct: ["releaseDate"],
    orderBy: { releaseDate: "asc" }
  });
  return rows.map((r) => r.releaseDate);
};

 const getShowtimesService = async (movieId: number, cinemaId: number, date: string) => {
  return await prisma.showtime.findMany({
    where: {
      movieId,
      status: true,
      releaseDate: new Date(date),
      room: { cinemaId }
    },
    select: { showId: true, startTime: true },
    orderBy: { startTime: "asc" }
  });
};
export { getShowTimeBySlugService,getShowtimesService,getDatesByMovieCinemaService };
