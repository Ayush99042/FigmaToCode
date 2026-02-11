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
You are a Senior Frontend Architect. Convert this flat Figma CSS into a highly organized, semantically nested React component using Tailwind CSS.

### ARCHITECTURAL MISSION:
Reconstruct the original Figma hierarchy. Group related elements into logical sections (e.g., Header Section, Grid Section, Dividers) and label them with JSX comments.

### STRUCTURAL RULES:
1. **Semantic Nesting**: 
   - Use spatial reasoning (top/left/width/height) to nest children inside their logical parent containers.
   - Use 'relative' on section wrappers and 'absolute' for internal positioning only when necessary.
2. **Auto-Layout Mapping**: 
   - Convert 'display: flex' to Tailwind 'flex'.
   - Map 'gap' to 'gap-[Xpx]' and 'flex-direction' to 'flex-col' or 'flex-row'.
3. **Refined Typography**: 
   - Use arbitrary values: text-[Xpx], leading-[Xpx], font-[weight].
   - Use exact hex codes: text-[#FFFFFF].
4. **Decorative Elements**: 
   - Handle dividers and background gradients as specific <div> elements with absolute positioning and z-indexing.
   - Use Tailwind background gradients: bg-[linear-gradient(135deg,#665DCD_0%,#5FA4E6_44.76%,#D2AB67_100%)].

### CODING STYLE (MANDATORY):
- **No Comments**: Do NOT include any JSX comments, code labels, or explanations within the code.
- **Closing Tags**: Every <div> and <p> must be perfectly balanced and closed.
- **Clean JSX**: Return ONLY the raw JSX code. Do not use markdown blocks (\`\`\`), no explanations, no 'export default'.

${css}
`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
        },
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

  return text
    .replace(/```(jsx|tsx|js)?|```/g, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\/.*/g, "")
    .trim();
}
