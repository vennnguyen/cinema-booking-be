import prisma from "config/prisma";

const getProductService = async () => {
  const data = await prisma.movie.findMany();
  return data;
};
export { getProductService };
