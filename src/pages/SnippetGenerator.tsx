import { useState } from "react";
import ChatAssistant from "../components/ChatAssistant";
import { Card, CardContent } from "../components/ui/card";
import { Code, Eye, FileCode } from "lucide-react";
import { CodePreview } from "../components/ui/CodePreview";
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

type Tab = "code" | "preview";

export default function SnippetGenerator({
  css,
  setCss,
  image,
  setImage,
  result,
  setResult,
}: SnippetGeneratorProps) {
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("code");

  const handleClear = () => {
    setCss("");
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    // Fill the entire available content area; no extra padding or scroll
    <div className="flex flex-col h-full gap-3">

      {/* ── Page title (compact) ── */}
      <div className="shrink-0">
        <h2 className="text-xl font-bold leading-tight">Figma Snippet → React</h2>
        <p className="text-xs text-muted-foreground">
          Generate React code from a selected Figma portion (CSS + image)
        </p>
      </div>

      {/* ── Main two-column work area — takes all remaining space ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">

        {/* Left panel: inputs */}
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

          {error && <div className="text-xs text-red-500 shrink-0">{error}</div>}
        </div>

        {/* Right panel: Code + Preview tabs */}
        <div className="flex flex-col min-h-0 overflow-hidden rounded-lg border">
          {/* Tab bar — only shown when there's a result */}
          {result && (
            <div className="flex items-center border-b bg-muted/40 shrink-0">
              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === "code"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                <FileCode size={13} />
                Code
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === "preview"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Eye size={13} />
                Preview
              </button>
            </div>
          )}

          {/* Tab content */}
          <div className="flex-1 overflow-hidden min-h-0">
            {result ? (
              activeTab === "code" ? (
                <div className="h-full overflow-auto">
                  <CodeViewer code={result} />
                </div>
              ) : (
                <div className="h-full bg-white">
                  <CodePreview code={result} />
                </div>
              )
            ) : (
              <div className="h-full border border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                <Code size={36} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom: unified input bar (always visible, never scrolls away) ── */}
      <div className="shrink-0">
        <ChatAssistant
          css={css}
          image={image}
          setResult={(code) => setResult(code)}
          onClear={handleClear}
        />
      </div>
    </div>
  );
}
