import { AlertCircle, Play } from "lucide-react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import Babel from "@babel/standalone";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
type PreviewBg = "light" | "dark";
function ensureTailwind() {
  if (!document.getElementById("tailwind-preview")) {
    const script = document.createElement("script");
    script.id = "tailwind-preview";
    script.src = "https://cdn.tailwindcss.com";
    document.head.appendChild(script);
  }
}

function normalizeCode(code: string) {
  let cleaned = code
    .replace(/^import\s.+?;$/gm, "")
    .replace(/export\s+default\s+/g, "")
    .trim();

  const hasFunction = /function\s+[A-Z][A-Za-z0-9_]*\s*\(/.test(cleaned);

  if (!hasFunction) {
    return `
      function GeneratedComponent() {
        return (
          <>
            ${cleaned}
          </>
        );
      }
    `;
  }

  return cleaned;
}

function findComponentName(code: string) {
  const match = code.match(/function\s+([A-Z][A-Za-z0-9_]*)/);
  return match?.[1] ?? "GeneratedComponent";
}

export default function Preview() {
  const [code, setCode] = useState("");
  const [Component, setComponent] = useState<React.FC | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bg, setBg] = useState<PreviewBg>("light");
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [frameSize, setFrameSize] = useState({
    width: 0,
    height: 0,
  });
  useEffect(() => {
    ensureTailwind();
  }, []);

  const handleRun = () => {
    setError(null);
    setComponent(null);

    try {
      if (!code.trim()) {
        throw new Error("Paste generated code first.");
      }

      const normalized = normalizeCode(code);
      const componentName = findComponentName(normalized);

      const transformed = Babel.transform(normalized, {
        presets: ["react"],
      }).code;

      if (!transformed) {
        throw new Error("Code transformation failed.");
      }

      const GeneratedComponent = new Function(
        "React",
        `
          ${transformed}
          return ${componentName};
        `,
      )(React);

      if (typeof GeneratedComponent !== "function") {
        throw new Error("No valid React component found.");
      }

      setComponent(() => GeneratedComponent);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to render preview");
    }
  };
  useLayoutEffect(() => {
    if (!contentRef.current) return;

    const rect = contentRef.current.getBoundingClientRect();

    setFrameSize({
      width: rect.width,
      height: rect.height,
    });
  }, [Component, bg]);
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Component Preview</h2>
        <p className="text-muted-foreground">
          Paste generated Tailwind React code and preview it instantly
        </p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`export default function Tools() {
  return (
    <div className="p-6 bg-white rounded-xl">
      Hello World
    </div>
  );
}`}
            className="w-full h-[180px] font-mono text-sm border rounded-md p-3"
          />

          <div className="flex items-center gap-3">
            <Button onClick={handleRun} className="gap-2">
              <Play size={16} />
              Run Preview
            </Button>

            {error && (
              <div className="flex gap-2 text-sm text-destructive items-center">
                <AlertCircle size={16} />
                <span className="max-w-[420px] truncate">{error}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="border-t border-border" />
      <div className="flex items-center gap-2">
        <Button
          variant={bg === "light" ? "default" : "outline"}
          onClick={() => setBg("light")}
        >
          Light
        </Button>

        <Button
          variant={bg === "dark" ? "default" : "outline"}
          onClick={() => setBg("dark")}
        >
          Dark
        </Button>
      </div>
      <div
        className={`w-full flex justify-center ${
          bg === "light" ? "bg-neutral-100" : "bg-neutral-900"
        } py-20`}
      >
        {/* AUTO-SIZED PREVIEW FRAME */}
        <div
          ref={frameRef}
          style={{
            width: frameSize.width || "auto",
            height: frameSize.height || "auto",
          }}
          className={`
      relative
      rounded-xl
      shadow-xl
      transition-all
      ${bg === "dark" ? "bg-black text-white" : "bg-white text-black"}
    `}
        >
          {Component ? (
            <div ref={contentRef} className="relative">
              <Component />
            </div>
          ) : (
            <div className="p-20 text-muted-foreground">
              Output preview will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
