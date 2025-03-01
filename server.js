import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { fileURLToPath } from "url";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import bodyPartsRoutes from "./routes/bodyPartsRoutes.js";
import targetMusclesRoutes from "./routes/targetMusclesRoutes.js";
import equipmentsRoutes from "./routes/equipmentsRoutes.js";
import routinesRoutes from "./routes/routinesRoutes.js";

dotenv.config();

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 1000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const app = express();

app.use(limiter);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const url = process.env.BASE_URL;

app.use("/assets", express.static(path.join(__dirname, "public/assets")));

app.use("/api/v1/exercises", exerciseRoutes);
app.use("/api/v1/bodyParts", bodyPartsRoutes);
app.use("/api/v1/targetMuscles", targetMusclesRoutes);
app.use("/api/v1/equipments", equipmentsRoutes);
app.use("/api/v1/routines", routinesRoutes);

app.use("/", (req, res) => {
  res.send({
    message:
      "Welcome to body works api! Review all the endpoints here : https://github.com/Akshat-Jaiswal-8/body-works-api.git",
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
