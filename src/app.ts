import express, { Request, Response } from "express";
import "dotenv/config";
import routes from "./routes";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 8080;
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

// routes
app.use("/api", routes);
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
