import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { testConnection } from "./config/database";
import { syncDatabase } from "./models";
import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";

dotenv.config();
const app = express();

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

// Add this root route handler
app.get("/", (req, res) => {
  res.json({ message: "Server is running successfully!" });
});

// Initialize database
const initDatabase = async () => {
  await testConnection();
  await syncDatabase();
};

initDatabase();

// Routes
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
