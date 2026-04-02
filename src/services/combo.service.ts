import prisma from "config/prisma";

const getComboService = async () => {
  const data = await prisma.combo.findMany({});
  return data;
};
export { getComboService };
