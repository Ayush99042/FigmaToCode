import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import figmaRouter from "./figma";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/figma", figmaRouter);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Server start : ", PORT);
});
