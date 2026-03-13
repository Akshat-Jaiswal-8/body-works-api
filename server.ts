import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { fileURLToPath } from "url";
import compression from "compression";
import morgan from "morgan";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import bodyPartsRoutes from "./routes/bodyPartsRoutes.js";
import targetMusclesRoutes from "./routes/targetMusclesRoutes.js";
import equipmentsRoutes from "./routes/equipmentsRoutes.js";
import routinesRoutes from "./routes/routinesRoutes.js";

dotenv.config();

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20000,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: {
    error: "Rate limit exceeded for this endpoint.",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.ALLOWED_ORIGINS?.split(",") || false
        : true,
    credentials: false,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(compression());

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

app.use(generalLimiter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/assets",
  express.static(path.join(__dirname, "public/assets"), {
    maxAge: "1d",
    etag: false,
    setHeaders: (res, filePath) => {
      res.setHeader("Cache-Control", "public, max-age=86400");
    },
  })
);

app.use("/api/v1/exercises", generalLimiter, exerciseRoutes);
app.use("/api/v1/bodyParts", generalLimiter, bodyPartsRoutes);
app.use("/api/v1/targetMuscles", generalLimiter, targetMusclesRoutes);
app.use("/api/v1/equipments", generalLimiter, equipmentsRoutes);
app.use("/api/v1/routines", strictLimiter, routinesRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

app.use("/", (req, res) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
  res.json({
    message:
      "Welcome to body works api! Review all the endpoints here: https://github.com/Akshat-Jaiswal-8/body-works-api.git",
    version: "1.0.0",
    status: "active",
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: "The requested resource does not exist",
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  if (process.env.NODE_ENV === "production") {
    res.status(500).json({
      error: "Internal server error",
      message: "Something went wrong",
    });
  } else {
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
      stack: err.stack,
    });
  }
});

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
