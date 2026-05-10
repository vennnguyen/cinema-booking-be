
import prisma from "@/config/prisma";
import { getIO } from "../socket";

export const startReleaseExpiredSeatsJob = () => {
  setInterval(async () => {
    try {
      const expired = await prisma.showtimeseat.findMany({
        where: {
          status: "HOLDING",
          heldUntil: { lte: new Date() },
        },
        select: { seatId: true, showId: true },
      });

      if (expired.length === 0) return;

      const byShow = expired.reduce(
        (acc, s) => {
          if (!acc[s.showId]) acc[s.showId] = [];
          acc[s.showId].push(s.seatId);
          return acc;
        },
        {} as Record<number, number[]>,
      );

      for (const [showId, seatIds] of Object.entries(byShow)) {
        await prisma.showtimeseat.updateMany({
          where: { seatId: { in: seatIds }, status: "HOLDING" },
          data: { status: "AVAILABLE", heldUntil: null },
        });

        const updatedSeats = await prisma.showtimeseat.findMany({
          where: { showId: Number(showId) },
          select: { seatId: true, status: true },
        });

        getIO().to(`show_${showId}`).emit("seat_updated", updatedSeats);
        console.log(`Released ${seatIds.length} expired seats in show ${showId}`);
      }
    } catch (err) {
      console.error("releaseExpiredSeats job error:", err);
    }
  }, 30 * 1000);
};