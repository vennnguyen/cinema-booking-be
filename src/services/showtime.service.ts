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
export { getShowTimeBySlugService };
