import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import contentRoutes from "./routes/content.js";
import adminRoutes from "./routes/admin.js";
import paymentRoutes from "./routes/payment.js";

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL =
  process.env.CLIENT_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://ltprep.onrender.com"
    : "http://localhost:5173");

app.use(express.json({ limit: "2mb" }));
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api", contentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Study Portal API running 🚀" });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `✅ Server running on ${
          process.env.NODE_ENV === "production"
            ? "https://ltprep.onrender.com"
            : `http://localhost:${PORT}`
        }`
      );
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  });
