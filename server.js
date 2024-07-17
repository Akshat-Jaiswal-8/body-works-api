import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import bodyPartsRoutes from "./routes/bodyPartsRoutes.js";
import targetMusclesRoutes from "./routes/targetMusclesRoutes.js";
import equipmentsRoutes from "./routes/equipmentsRoutes.js";
import routinesRoutes from "./routes/routinesRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/api/v1/assets",
  express.static(path.join(__dirname, "public/assets")),
);

app.use("/api/v1/exercise", exerciseRoutes);
app.use("/api/v1/bodyParts", bodyPartsRoutes);
app.use("/api/v1/targetMuscles", targetMusclesRoutes);
app.use("/api/v1/equipments", equipmentsRoutes);
app.use("/api/v1/routines", routinesRoutes);

app.use("/", (req, res) => {
  res.send({
    message: "welcome to body works api",
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
