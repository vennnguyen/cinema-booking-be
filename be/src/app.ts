import express, { Request, Response } from "express";
import "dotenv/config";
import routes from "./routes";
import cors from "cors";
import cookieParser from 'cookie-parser'
import { createServer } from "http"; 
import { initSocket } from "./socket";      
import authRoutes from 'routes/auth.route'
import { startReleaseExpiredSeatsJob } from "./jobs/releaseExpiredSeats";
const app = express();
const PORT = process.env.PORT || 8080;
const httpServer = createServer(app);
initSocket(httpServer);
//Lỗi CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
// config static file
app.use(express.static("public"));

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.use("/api/auth", authRoutes); 
// app.use(protectedRoute)
// routes

app.use("/api", routes);
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  startReleaseExpiredSeatsJob();
});
