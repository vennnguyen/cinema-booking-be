import prisma from "config/prisma";

const getProductService = async () => {
  const data = await prisma.movie.findMany({
    include: {
      movietype: {
        select: {
          movieTypeName: true,
        },
      },
    },
  });
  return data;
};
const getProductBySlugService = async (slug: string) => {
  const data = await prisma.movie.findFirst({
    where: {
      slug,
    },
    include: {
      movietype: {
        select: {
          movieTypeName: true,
        },
      },
    },
  });
  return data;
};
export { getProductService, getProductBySlugService };
