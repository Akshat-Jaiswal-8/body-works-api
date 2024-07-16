import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

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

app.use("/", (req, res) => {
  res.send({
    message: "welcome to body works api",
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
