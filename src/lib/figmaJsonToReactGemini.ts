export async function convertFigmaJsonToReact(figmaJson: any) {
  const apiKey = localStorage.getItem("gemini_api_key")?.trim();

  if (!apiKey) {
    throw new Error("Gemini API key not found");
  }

  const prompt = `
You are a senior frontend engineer converting Figma designs to clean React code.

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

STRUCTURE RULES (VERY IMPORTANT):
- DO NOT mirror Figma’s internal node tree
- DO NOT create wrapper divs unless they affect layout or styling
- NEVER place div/span inside svg
- SVG must contain only <svg>, <g>, <path>, <circle>, <rect>, etc.
- Flatten unnecessary frames
- Prefer semantic HTML: section, header, button, ul, li, img

LAYOUT RULES:
- Use flexbox based on layout.mode
- Use gap instead of margins
- DO NOT apply width/height unless:
  - It is an image
  - It is the root container

IMAGE RULES (CRITICAL):
- If node.isImage === true, ALWAYS generate an <img /> tag
- Use the image dimensions from width and height
- Use a random placeholder image URL in this format:
  https://picsum.photos/{width}/{height}?random=1
- Apply object-cover
- Apply rounded radius if radius exists
- DO NOT leave image containers empty

STYLE RULES:
- Convert colors to nearest Tailwind utility (bg-*, text-*)
- Convert border radius to rounded-*
- Convert fontSize and fontWeight correctly
- Buttons must have visible background and text color

OUTPUT:
- Clean, readable JSX
- Human-written quality code

Figma JSON:
${JSON.stringify(figmaJson, null, 2)}
`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || "Gemini request failed");
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No React code returned from Gemini");
  }

  return text.replace(/```(jsx|tsx|js)?|```/g, "").trim();
}
