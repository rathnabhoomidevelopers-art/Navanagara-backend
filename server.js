require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./database");
const memberLoginRoutes = require("./routes/memberLoginRoutes");

// ...

// Import routes
const adminRoutes = require("./routes/adminRoutes");
const memberRoutes = require("./routes/memberRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const siteBookingRoutes = require("./routes/siteBookingRoutes");
const receiptRoutes = require("./routes/receiptRoutes");
const superAdminRoutes = require("./routes/SuperadminRoutes");

const app = express();
connectDB();

// Allowed origins: CORS_ORIGINS env (comma-separated) + known defaults
const allowedOrigins = [
  "https://navanagarahousebuildingsociety.com",
  "https://www.navanagarahousebuildingsociety.com",
  "http://localhost:3000",
  ...(process.env.CORS_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) // Vercel preview deployments
      ) {
        return callback(null, true);
      }
      console.warn(`❌ CORS blocked: ${origin}`);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use("/", memberLoginRoutes);
app.use("/", adminRoutes);
app.use("/", memberRoutes);
app.use("/", paymentRoutes);
app.use("/", siteBookingRoutes);
app.use("/", receiptRoutes);
app.use("/", superAdminRoutes);

app.get("/test", (req, res) => {
  res.json({
    message: "Backend is running!",
    emailConfigured: !!process.env.BREVO_API_KEY,
    senderEmail: process.env.SENDER_EMAIL || "NOT CONFIGURED",
    companyEmail: process.env.COMPANY_EMAIL || "NOT CONFIGURED",
    port: process.env.PORT || 3001,
  });
});

app.use((req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.path}`);
  res
    .status(404)
    .json({ success: false, message: `Route ${req.path} not found` });
});

app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(
    `📧 Brevo API Key: ${process.env.BREVO_API_KEY ? "✅ Configured" : "❌ NOT CONFIGURED"}`,
  );
  console.log(
    `📧 Sender Email: ${process.env.SENDER_EMAIL || "❌ NOT CONFIGURED"}`,
  );
  console.log(
    `📧 Company Email: ${process.env.COMPANY_EMAIL || "❌ NOT CONFIGURED"}`,
  );
  console.log(
    `💾 Database: ${process.env.MONGODB_URI ? "URI configured" : "❌ MONGODB_URI NOT SET"}`,
  );
});
