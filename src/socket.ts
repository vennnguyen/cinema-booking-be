import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import prisma from "./config/prisma";


let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Bước 1: Client join vào room của suất chiếu
    socket.on("join_show", (showId: number) => {
      socket.join(`show_${showId}`);
      console.log(`Socket ${socket.id} joined show_${showId}`);
    });

    // Bước 2: Client giữ ghế
    socket.on("hold_seat", async ({ showId, seatIds }) => {
      await prisma.showtimeseat.updateMany({
        where: {
          showId,
          seatId: { in: seatIds },
          status: "AVAILABLE",
        },
        data: {
          status: "HOLDING",
          heldUntil: new Date(Date.now() + 5 * 60 * 1000),
        },
      });

      // Broadcast ghế mới nhất cho tất cả trong room
      const updatedSeats = await prisma.showtimeseat.findMany({
        where: { showId },
        select: { seatId: true, status: true },
      });

      io.to(`show_${showId}`).emit("seat_updated", updatedSeats);
    });

    // Bước 3: Client bỏ chọn ghế
    socket.on("release_seat", async ({ showId, seatIds }) => {
      await prisma.showtimeseat.updateMany({
        where: {
          showId,
          seatId: { in: seatIds },
          status: "HOLDING",
        },
        data: {
          status: "AVAILABLE",
          heldUntil: null,
        },
      });

      const updatedSeats = await prisma.showtimeseat.findMany({
        where: { showId },
        select: { seatId: true, status: true },
      });

      io.to(`show_${showId}`).emit("seat_updated", updatedSeats);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => io;