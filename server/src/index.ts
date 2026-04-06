import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import figmaRouter from "./figma";
import snippetMcpRouter from "./snippetMcp";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/figma", figmaRouter);
app.use("/api/snippet-mcp", snippetMcpRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`  Figma API  → http://localhost:${PORT}/api/figma`);
  console.log(`  Snippet MCP → http://localhost:${PORT}/api/snippet-mcp/run`);
});
