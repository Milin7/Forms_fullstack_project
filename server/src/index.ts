import dotenv from "dotenv";
import express from "express";
import type { Express, Request, Response } from "express";
import cors from "cors";

dotenv.config();
const app: Express = express();

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://forms-fullstack-project.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

// Test route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server is running yes nop asf" });
});

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
