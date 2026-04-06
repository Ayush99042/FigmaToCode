import { Code } from "lucide-react";
import { useState } from "react";
import ChatAssistant from "../components/ChatAssistant";
import { Card, CardContent } from "../components/ui/card";
import { CodeViewer } from "../components/ui/CodeViewer";
import { ImageUpload } from "../components/ui/ImageUpload";

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
  const [error, setError] = useState<string | null>(null);

  const handleClear = () => {
    setCss("");
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="shrink-0">
        <h2 className="text-xl font-bold leading-tight">
          Figma Snippet → React
        </h2>
        <p className="text-xs text-muted-foreground">
          Generate React code from a selected Figma portion (CSS + image)
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        <div className="flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
          <Card className="shrink-0">
            <CardContent className="pt-4 pb-3">
              <textarea
                value={css}
                onChange={(e) => setCss(e.target.value)}
                placeholder="Paste CSS copied from Figma"
                className="w-full h-36 font-mono text-xs border rounded-md p-2 resize-none"
              />
            </CardContent>
          </Card>

          <Card className="shrink-0">
            <CardContent className="pt-4 pb-3">
              <ImageUpload
                selectedImage={image}
                onImageSelect={(file) => setImage(file)}
              />
            </CardContent>
          </Card>

          {error && (
            <div className="text-xs text-red-500 shrink-0">{error}</div>
          )}
        </div>

        <div className="flex flex-col min-h-0 overflow-hidden rounded-lg border">
          <div className="flex-1 overflow-hidden min-h-0">
            {result ? (
              <div >
                <CodeViewer code={result} />
              </div>
            ) : (
              <div className="h-full border border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                <Code size={36} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0">
        <ChatAssistant
          css={css}
          image={image}
          result={result}
          setResult={(code) => setResult(code)}
          onClear={handleClear}
        />
      </div>
    </div>
  );
}
