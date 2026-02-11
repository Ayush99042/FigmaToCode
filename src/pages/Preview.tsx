import Babel from "@babel/standalone";
import { AlertCircle, Play } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

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

  const contentRef = useRef<HTMLDivElement>(null);

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
            placeholder="Paste here generated code"
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

      {Component && (
        <div ref={contentRef} className="relative">
          <Component />
        </div>
      )}
    </div>
  );
}
