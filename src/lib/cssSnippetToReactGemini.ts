export async function convertCssSnippetToReact(
  css: string,
  image?: File | null,
  instruction?: string,
) {
  const apiKey = localStorage.getItem("gemini_api_key")?.trim();
  if (!apiKey) throw new Error("Gemini API key not found");

  let imagePart = null;

  if (image) {
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(image);
    });

    imagePart = {
      inlineData: {
        mimeType: image.type,
        data: base64.split(",")[1],
      },
    };
  }
  const dynamicInstruction = instruction
    ? `### USER INSTRUCTION:
${instruction}

Apply this instruction strictly.
`
    : "";

  const prompt = `
You are a Senior Frontend Architect.

${dynamicInstruction}

### TASK:
Convert the provided Figma CSS (and optional image) into a clean, self-contained React + Tailwind component.

### OUTPUT FORMAT (MANDATORY):
- Output ONLY raw JSX — no markdown fences, no explanations.
- Start with: function GeneratedComponent() {
- End with:   }
- Do NOT include any import statements.
- Do NOT include "export default".
- Do NOT include any comments.

### STYLING RULES:
- Use only Tailwind CSS utility classes.
- Use arbitrary values for exact sizes: w-[290px], text-[36px], etc.
- Maintain the exact layout, spacing, and typography from the Figma CSS.

### SMART BEHAVIOR:
- If instruction includes "responsive" → add responsive breakpoint classes
- If "dark mode" → use dark: variants
- If "optimize" → simplify and reduce nesting
- If "grid" → prefer CSS grid over flex where appropriate

### CSS:
${css}
`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: imagePart
              ? [{ text: prompt }, imagePart]
              : [{ text: prompt }],
          },
        ],
      }),
    },
  );

  const json = await res.json();

  console.log("Gemini Response:", json);

  if (!res.ok) {
    throw new Error(json?.error?.message || "Gemini API request failed");
  }

  if (json?.error) {
    throw new Error(json.error.message);
  }

  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error(
      "Model returned no code. Possibly rate limit or quota exceeded.",
    );
  }

  return text
    // Strip markdown code fences
    .replace(/```[\w]*\n?/g, "")
    // Strip import lines
    .replace(/^import\s+.*?from\s+['"][^'"]+['"]\s*;?\s*$/gm, "")
    // Strip export statements
    .replace(/^export\s+default\s+/gm, "")
    .replace(/^export\s+/gm, "")
    // Strip JSX block comments
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .trim();
}
