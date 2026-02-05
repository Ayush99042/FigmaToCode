export async function convertCssSnippetToReact(
  css: string,
  image?: File | null,
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

  const prompt = `
You are a frontend code generator.

INPUTS:
- CSS extracted from Figma (PRIMARY SOURCE OF TRUTH)
- Optional PNG image of the same element (REFERENCE ONLY)

CRITICAL PRIORITY RULES (DO NOT VIOLATE):
1. The provided CSS is the SOURCE OF TRUTH.
2. Generate JSX that matches the CSS EXACTLY.
3. Preserve ALL layout values from CSS:
   - position (absolute / relative)
   - width / height
   - left / top
   - padding / gap
4. DO NOT normalize, refactor, simplify, or improve the layout.
5. DO NOT convert absolute layouts into flex/grid.
6. If the IMAGE conflicts with the CSS, ALWAYS follow the CSS.
7. The image is ONLY for visual verification, not layout decisions.

TASK:
Convert the given CSS into equivalent JSX using Tailwind CSS.

ABSOLUTE RULES:
- JSX ONLY
- NO export default
- NO App component
- NO explanations
- NO markdown
- Tailwind CSS ONLY
- One self-contained JSX snippet
- Preserve hierarchy implied by the CSS blocks

VALID OUTPUT EXAMPLES:
- <div className="absolute left-[45px] top-[70px] w-[1045px] h-[228px]">...</div>

INVALID OUTPUT:
- Full pages
- Multiple components
- Layout normalization
- mx-auto, justify-center, grid unless explicitly in CSS

CSS:
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
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("No code returned");

  return text.replace(/```(jsx|tsx|js)?|```/g, "").trim();
}
