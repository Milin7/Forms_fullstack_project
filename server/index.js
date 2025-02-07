require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Local development URL
      "https://backend-forms-fullstack.onrender.com/", // Vercel domain
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
