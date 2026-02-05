import { AlertCircle, Code } from "lucide-react";
import { useState } from "react";

import { CodeViewer } from "../components/ui/CodeViewer";
import { ImageUpload } from "../components/ui/ImageUpload";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { convertFigmaJsonToReact } from "../lib/figmaJsonToReactGemini";

interface ConverterProps {
  image: File | null;
  setImage: (file: File | null) => void;
  result: string | null;
  setResult: (code: string | null) => void;
}

type ConvertMode = "image" | "figma";

export default function Converter({
  image,
  setImage,
  result,
  setResult,
}: ConverterProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ConvertMode>("image");

  const [figmaKey, setFigmaKey] = useState("");
  const [figmaJson, setFigmaJson] = useState<any | null>(null);

  const handleImageConvert = async () => {
    if (!image) return;

    const apiKey = localStorage.getItem("gemini_api_key")?.trim();
    if (!apiKey) {
      setError("Please set your Gemini API key first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(image);
      });

      const data = base64.split(",")[1];

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `
You are a senior frontend engineer converting a UI screenshot into a real, responsive React component using Tailwind CSS.

GOAL:
Generate clean, production-quality React + Tailwind code that visually matches the screenshot structure while behaving like a real website.

ABSOLUTE RULES:
- JSX ONLY
- export default function
- Tailwind CSS ONLY
- NO inline styles
- NO markdown
- NO comments
- NO explanations
- Valid HTML only
- SVG must contain only svg elements (path, g, rect, circle)

CRITICAL VISUAL TRUTH (MOST IMPORTANT):
- The screenshot is the source of truth
- DO NOT invent layout
- DO NOT guess columns or rows
- DO NOT normalize or "improve" spacing
- DO NOT reorder elements
- Visual grouping must be preserved exactly

LAYOUT INTERPRETATION RULES:
- If elements visually align in rows → use grid or flex-row
- If elements visually stack → use flex-col
- If cards visually form a grid → match that grid exactly
- If spacing is uneven → keep it uneven
- Do NOT force equal widths unless visually equal

RESPONSIVENESS RULES (HUMAN-LIKE):
- Desktop layout must visually match the screenshot
- DO NOT hardcode fixed container widths/heights
- Use w-full, max-w-*, mx-auto where appropriate
- Allow cards to wrap naturally on smaller screens
- Use responsive utilities ONLY when visually implied
- DO NOT invent mobile layouts

STRUCTURE RULES:
- DO NOT mirror internal design-tool layers
- Flatten unnecessary wrappers
- Use semantic HTML where obvious (section, header, main, button, ul, li, img)
- Cards should be single clean containers, not deeply nested divs

IMAGE RULES:
- Images must appear in the same position and grouping as the screenshot
- Preserve aspect ratio
- Use <img />
- Use object-cover for photos
- Use object-contain for logos
- Use rounded-full only for avatars
- If an image is missing or unclear, use a realistic placeholder:
  https://picsum.photos/400/300?random=1

STYLE RULES:
- Use realistic Tailwind colors
- Buttons must have clear background + readable text
- Cards must have rounded corners and subtle shadow
- Headings should be visually strong
- Text should reflow naturally

FINAL QUALITY BAR:
- The UI should look like a real, responsive production website
- Layout must visually match the screenshot
- Code should look hand-written by an experienced frontend engineer
- Clean, readable JSX

Now convert the image exactly as shown.
`,
                  },
                  {
                    inlineData: {
                      mimeType: image.type || "image/png",
                      data,
                    },
                  },
                ],
              },
            ],
          }),
        },
      );

      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) throw new Error("No code returned");

      setResult(text.replace(/```(jsx|tsx|js)?|```/g, "").trim());
    } catch (err: any) {
      setError(err.message || "Image conversion failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchFigma = async () => {
    if (!figmaKey) {
      setError("Please enter a Figma file key.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:4000/api/figma/file/${figmaKey}`,
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch Figma file");
      }

      setFigmaJson(data.figmaJson);
    } catch (err: any) {
      setError(err.message || "Failed to fetch Figma");
    } finally {
      setLoading(false);
    }
  };

  const handleConvertFigma = async () => {
    if (!figmaJson) {
      setError("Fetch Figma file first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const code = await convertFigmaJsonToReact(figmaJson);
      setResult(code);
    } catch (err: any) {
      setError(err.message || "Gemini conversion failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-bold">Design to Code</h2>
        <p className="text-muted-foreground">
          Convert UI images or Figma files into React + Tailwind
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={mode === "image" ? "default" : "outline"}
          onClick={() => setMode("image")}
        >
          Image
        </Button>

        <Button
          variant={mode === "figma" ? "default" : "outline"}
          onClick={() => {
            setMode("figma");
            setImage(null);
          }}
        >
          Figma
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {mode === "image" ? (
                <ImageUpload
                  selectedImage={image}
                  onImageSelect={(file) => setImage(file)}
                />
              ) : (
                <input
                  value={figmaKey}
                  onChange={(e) => setFigmaKey(e.target.value)}
                  placeholder="Paste Figma File Key"
                  className="w-full border rounded-md px-3 py-2"
                />
              )}
            </CardContent>
          </Card>

          {mode === "image" ? (
            <Button onClick={handleImageConvert} disabled={loading || !image}>
              Convert Image
            </Button>
          ) : (
            <>
              <Button
                onClick={handleFetchFigma}
                disabled={loading || !figmaKey}
              >
                Refresh Figma File
              </Button>

              <Button
                variant="outline"
                onClick={handleConvertFigma}
                disabled={!figmaJson || loading}
              >
                Convert to React
              </Button>
            </>
          )}

          <Button
            variant="outline"
            onClick={() => {
              setImage(null);
              setFigmaJson(null);
              setResult(null);
              setError(null);
            }}
          >
            Clear
          </Button>

          {error && (
            <div className="flex gap-2 text-sm text-destructive">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        <div>
          {result ? (
            <CodeViewer code={result} />
          ) : (
            <div className="min-h-[400px] border border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
              <Code size={40} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
