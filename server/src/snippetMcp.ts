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

async function callGemini(
  prompt: string,
  geminiKey: string,
  imageBase64?: string | null,
): Promise<string> {
  const parts: any[] = [{ text: prompt }];

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: imageBase64,
      },
    });
  }

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
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

async function analyzeCSS(css: string) {

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
) {

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
) {

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

async function generateFigmaComponent(
  figmaJson: any,
  figmaImageBase64: string | null,
  instruction: string,
  geminiKey: string,
) {

  const prompt = `
You are a senior frontend engineer converting Figma designs to clean React code.

${instruction ? `Instruction: ${instruction}` : ""}

GOAL:
Generate clean, semantic, production-quality React + Tailwind code that visually matches the design.

ABSOLUTE RULES:
- JSX ONLY
- export default function
- Tailwind CSS only
- NO inline styles
- NO comments
- NO markdown
- NO invalid HTML

CRITICAL VISUAL TRUTH (MOST IMPORTANT):
- The screenshot is the source of truth for LAYOUT
- Use the JSON for accurate COLORS, SIZES, and PADDING
- DO NOT invent layout or ignore elements present in the screenshot
- Visual grouping must be preserved exactly
- If elements visually align in rows → use flex-row or grid
- If elements stack → use flex-col
- Do NOT guess columns or rows, follow the visual image exactly!

RESPONSIVENESS & STRUCTURE RULES:
- Desktop layout must visually match the screenshot exactly.
- Flatten unnecessary Figma wrappers. DO NOT mirror Figma’s internal node tree blindly.
- Use semantic HTML: section, header, main, div, button.

IMAGE GUIDELINES:
- If you see a photo or illustration in the screenshot, generate an <img /> tag!
- YES, use random placeholder images from https://picsum.photos/{width}/{height}?random=1 (extract width/height from JSON)
- VERY IMPORTANT: Images must NOT overflow! Always wrap images in a container with 'overflow-hidden' if they are bounded.
- Apply 'w-full h-full object-cover' to images so they scale properly inside their containers.
- DO NOT leave image containers empty. If there is an image in the design, there must be an img tag in the code.

STYLE RULES:
- Convert json colors to Tailwind utilities (bg-[#...], text-[#...])
- Convert json radius to rounded-*
- Text should reflow naturally but headers should match sizes.

Figma JSON:
${JSON.stringify(figmaJson, null, 2)}
`;

  return callGemini(prompt, geminiKey, figmaImageBase64);
}

router.post("/run", async (req: Request, res: Response) => {
  const { css, figmaJson, figmaImageBase64, instruction, existingCode, geminiApiKey } = req.body;

  if (!css && !existingCode && !figmaJson) {
    return res.status(400).json({ error: "css, figmaJson, or existingCode required" });
  }

  if (!geminiApiKey) {
    return res.status(400).json({ error: "geminiApiKey required" });
  }

  try {
    let finalCode = "";

    if (existingCode) {
      finalCode = await refineComponent(existingCode, instruction, geminiApiKey);
    } else if (figmaJson) {
      finalCode = await generateFigmaComponent(
        figmaJson,
        figmaImageBase64,
        instruction,
        geminiApiKey
      );
      if (instruction) {
         finalCode = await refineComponent(finalCode, instruction, geminiApiKey);
      }
    } else {
      const analysis = await analyzeCSS(css);

      finalCode = await generateComponent(
        css,
        analysis,
        instruction,
        geminiApiKey
      );

      if (instruction) {
        finalCode = await refineComponent(
          finalCode,
          instruction,
          geminiApiKey
        );
      }
    }

    return res.json({ code: finalCode });
  } catch (err: any) {
    console.error("[MCP ERROR]", err.message);
    return res.status(500).json({ error: err.message || "MCP failed" });
  }
});

export default router;
