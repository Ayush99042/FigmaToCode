import { Check, Copy, Maximize, Minimize } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "./button";
import { CodePreview } from "./CodePreview";

interface CodeViewerProps {
  code: string;
}

export function CodeViewer({ code }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-4 z-50 rounded-lg overflow-hidden border border-border bg-[#1e1e1e] flex flex-col shadow-2xl"
          : "relative rounded-lg overflow-hidden border border-border bg-[#1e1e1e] flex flex-col h-[700px]"
      }
    >
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3e3e42] shrink-0">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-3 text-xs ${
              activeTab === "code"
                ? "bg-[#3e3e42] text-white"
                : "text-[#cccccc] hover:text-white hover:bg-[#3e3e42]"
            }`}
            onClick={() => setActiveTab("code")}
          >
            Code
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-3 text-xs ${
              activeTab === "preview"
                ? "bg-[#3e3e42] text-white"
                : "text-[#cccccc] hover:text-white hover:bg-[#3e3e42]"
            }`}
            onClick={() => setActiveTab("preview")}
          >
            Preview
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 text-[#cccccc] hover:text-white hover:bg-[#3e3e42]"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 text-[#cccccc] hover:text-white hover:bg-[#3e3e42]"
            onClick={handleCopy}
          >
            {copied ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto h-full relative relative">
        {activeTab === "code" ? (
          <div className="w-full h-fit">
            <SyntaxHighlighter
              language="jsx"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: "1.5rem",
                fontSize: "14px",
                lineHeight: "1.5",
                background: "transparent",
              }}
              showLineNumbers={true}
              wrapLines={true}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full bg-white">
            <CodePreview code={code} />
          </div>
        )}
      </div>
    </div>
  );
}
