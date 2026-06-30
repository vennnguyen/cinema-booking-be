import { PrismaClient } from "@prisma/client";
import "dotenv/config";
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// export const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     log:
//       process.env.NODE_ENV === "development"
//         ? ["query", "error", "warn"]
//         : ["error"],
//   });
// console.log("DB URL:", process.env.DATABASE_URL);

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const prisma = new PrismaClient();

export default prisma;
