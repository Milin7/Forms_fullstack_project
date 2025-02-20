import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { testConnection } from "./config/database.js";
import { syncDatabase } from "./models";
import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import templateRoutes from "./routes/templates";

dotenv.config();
const app = express();

// CORS configuration
const allowedOrigins = (
  process.env.NODE_ENV === "development"
    ? ["http://localhost:5173"]
    : [process.env.PRODUCTION_URL]
).filter((origin): origin is string => !!origin);

app.use(
  cors({
    origin: allowedOrigins,
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
app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
