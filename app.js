require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const authRoutes = require("./routes/auth");
const integrationRoutes = require("./routes/integrations");
const dataRoutes = require("./routes/data");
const organizationRoutes = require("./routes/organization");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("dev"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/integrations", integrationRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/organizations", organizationRoutes);

// Health check
app.get("/api/health", (req, res) =>
  res.json({ ok: true, timestamp: new Date().toISOString(), version: "1.0.0" })
);

// Status endpoint
app.get("/api/status", (req, res) =>
  res.json({
    status: "running",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.path,
    method: req.method,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(
    `sFrontend URL: ${process.env.FRONTEND_URL || "http://localhost:4200"}`
  );
  console.log(`MongoDB: ${process.env.MONGO_URI}`);
});
