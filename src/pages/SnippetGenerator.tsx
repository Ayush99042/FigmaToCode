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
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-bold">Figma Snippet → React</h2>
        <p>Generate React code from a selected Figma portion (CSS + image)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh]">
        {/* ── Left panel: inputs ── */}
        <div className="flex flex-col gap-4 pr-2">
          <Card>
            <CardContent className="pt-6">
              <textarea
                value={css}
                onChange={(e) => setCss(e.target.value)}
                placeholder="Paste CSS copied from Figma"
                className="w-full h-48 font-mono text-sm border rounded-md p-3"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <ImageUpload
                selectedImage={image}
                onImageSelect={(file) => setImage(file)}
              />
            </CardContent>
          </Card>

          {error && <div className="text-sm text-red-500">{error}</div>}
        </div>

        {/* ── Right panel: Code + Preview tabs ── */}
        <div className="flex flex-col h-full overflow-hidden rounded-lg border">
          {/* Tab bar — only shown when there's a result */}
          {result && (
            <div className="flex items-center gap-0 border-b bg-muted/40 shrink-0">
              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === "code"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                <FileCode size={14} />
                Code
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === "preview"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Eye size={14} />
                Preview
              </button>
            </div>
          )}

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
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
                <Code size={40} />
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom: unified input bar ── */}
        <div className="col-span-1 lg:col-span-2">
          <ChatAssistant
            css={css}
            image={image}
            setResult={(code) => setResult(code)}
            onClear={handleClear}
          />
        </div>
      </div>
    </div>
  );
}
