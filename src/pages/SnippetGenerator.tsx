import { AlertCircle, Code } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { CodeViewer } from "../components/ui/CodeViewer";
import { ImageUpload } from "../components/ui/ImageUpload";
import { convertCssSnippetToReact } from "../lib/cssSnippetToReactGemini";

interface SnippetGeneratorProps {
  css: string;
  setCss: (v: string) => void;
  image: File | null;
  setImage: (f: File | null) => void;
  result: string | null;
  setResult: (v: string | null) => void;
}

export default function SnippetGenerator({
  css,
  setCss,
  image,
  setImage,
  result,
  setResult,
}: SnippetGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClear = () => {
    setCss("");
    setImage(null);
    setResult(null);
    setError(null);
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const code = await convertCssSnippetToReact(css, image);
      setResult(code);
    } catch (e: any) {
      setError(e.message || "Snippet generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-bold">Figma Snippet → React</h2>
        <p>Generate React code from a selected Figma portion (CSS + image)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <textarea
                value={css}
                onChange={(e) => setCss(e.target.value)}
                placeholder="Paste CSS copied from Figma (Copy as CSS)"
                className="w-full h-48 font-mono text-sm border rounded-md p-3"
              />

              <ImageUpload
                selectedImage={image}
                onImageSelect={(file) => setImage(file)}
              />
            </CardContent>
          </Card>

          <Button onClick={handleGenerate} disabled={loading || !css.trim()}>
            Generate Snippet
          </Button>

          <Button variant="outline" onClick={handleClear}>
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
