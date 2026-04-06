import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import figmaRouter from "./figma";
import snippetMcpRouter from "./snippetMcp";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/api/figma", figmaRouter);
app.use("/api/snippet-mcp", snippetMcpRouter);

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`  Figma API  → http://localhost:${PORT}/api/figma`);
  console.log(`  Snippet MCP → http://localhost:${PORT}/api/snippet-mcp/run`);
});

server.on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is busy, another server is already running!`);
  } else {
    console.error("Server Error:", err);
  }
});
