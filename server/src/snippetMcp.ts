import express, { Request, Response } from "express";

const router = express.Router();

const TOOLS = [
  {
    name: "analyze_css",
    description: "Analyze Figma CSS structure",
  },
  {
    name: "generate_component",
    description: "Generate React component",
  },
  {
    name: "refine_component",
    description: "Refine existing component",
  },
];

function sendEvent(res: Response, type: string, data: Record<string, any>) {
  res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  if (typeof (res as any).flush === "function") (res as any).flush();
}

async function callGemini(prompt: string, geminiKey: string): Promise<string> {
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    },
  );

  const json: any = await resp.json();
  if (!resp.ok) throw new Error(json?.error?.message || "Gemini API failed");

  const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return raw
    .replace(/```[\w]*\n?/g, "")
    .replace(/^import\s+.*?$/gm, "")
    .replace(/^export\s+default\s+/gm, "")
    .replace(/^export\s+/gm, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .trim();
}

async function analyzeCSS(css: string, res: Response) {
  sendEvent(res, "status", {
    message: "🔍 Analyzing CSS...",
  });

  const lines: string[] = [];

  if (css.includes("display: flex")) {
    lines.push("Layout: Flex");
  }

  const colors = [...new Set(css.match(/#[0-9a-fA-F]{3,8}/g) || [])];
  if (colors.length) lines.push(`Colors: ${colors.join(", ")}`);

  return lines.join("\n") || "Basic layout";
}

async function generateComponent(
  css: string,
  analysis: string,
  instruction: string,
  geminiKey: string,
  res: Response,
) {
  sendEvent(res, "status", {
    message: "⚙️ Generating component...",
  });

  const prompt = `
You are a senior frontend developer.

${instruction ? `Instruction: ${instruction}` : ""}

Analysis:
${analysis}

Convert CSS to React Tailwind.

Rules:
- No comments
- No imports
- Return JSX function only

CSS:
${css}
`;

  return callGemini(prompt, geminiKey);
}

async function refineComponent(
  code: string,
  instruction: string,
  geminiKey: string,
  res: Response,
) {
  sendEvent(res, "status", {
    message: `✨ Refining: ${instruction}`,
  });

  const prompt = `
Modify this React component:

Instruction: ${instruction}

Code:
${code}

Rules:
- Keep structure
- Only modify needed parts
- Return full component
`;

  return callGemini(prompt, geminiKey);
}

router.post("/run", async (req: Request, res: Response) => {
  const { css, instruction, existingCode, geminiApiKey } = req.body;

  if (!css && !existingCode) {
    return res.status(400).json({ error: "css or existingCode required" });
  }

  if (!geminiApiKey) {
    return res.status(400).json({ error: "geminiApiKey required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  try {
    sendEvent(res, "status", {
      message: "⚡ MCP (Gemini mode)",
    });

    let finalCode = "";

    if (existingCode) {
      finalCode = await refineComponent(
        existingCode,
        instruction,
        geminiApiKey,
        res,
      );
    } else {
      const analysis = await analyzeCSS(css, res);

      finalCode = await generateComponent(
        css,
        analysis,
        instruction,
        geminiApiKey,
        res,
      );

      if (instruction) {
        finalCode = await refineComponent(
          finalCode,
          instruction,
          geminiApiKey,
          res,
        );
      }
    }

    sendEvent(res, "done", { code: finalCode });
  } catch (err: any) {
    console.error("[MCP ERROR]", err.message);

    sendEvent(res, "error", {
      message: err.message || "MCP failed",
    });
  } finally {
    res.end();
  }
});

export default router;
