import { Bot, Loader2, Sparkles, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import { convertCssSnippetToReact } from "../lib/cssSnippetToReactGemini";
import { runSnippetMcp } from "../lib/snippetMcpClient";

interface ChatAssistantProps {
  readonly css: string;
  readonly image: File | null;
  readonly result: string | null;
  readonly setResult: (code: string) => void;
  readonly onClear: () => void;
  readonly disabled?: boolean;
}

export default function ChatAssistant({
  css,
  image,
  result,
  setResult,
  onClear,
  disabled = false,
}: ChatAssistantProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [engine, setEngine] = useState<"mcp" | "gemini" | null>(null);

  const handleGenerate = async () => {
    if (!css.trim() && !image) return;

    setLoading(true);
    setStatusMsg(null);
    setEngine(null);

    const geminiApiKey = localStorage.getItem("gemini_api_key")?.trim() ?? "";
    const instruction = input.trim();

    try {
      const isRefine = !!result && !!instruction;

      const code = await runSnippetMcp({
        css,
        instruction: instruction || undefined,
        existingCode: isRefine ? result! : undefined,
        geminiApiKey,
      });

      setResult(code);
      setInput("");
      setEngine("mcp");
    } catch (mcpErr: any) {
      console.warn("[MCP] Falling back to Gemini:", mcpErr.message);
      setStatusMsg("⚡ MCP offline — using Gemini directly...");

      try {
        const code = await convertCssSnippetToReact(
          css,
          image,
          instruction || undefined,
        );
        setResult(code);
        setInput("");
        setEngine("gemini");
      } catch (geminiErr: any) {
        console.error("[Gemini fallback]", geminiErr.message);
        setStatusMsg(`❌ Error: ${geminiErr.message}`);
        return;
      }
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) handleGenerate();
  };

  const isDisabled = disabled || loading || (!css.trim() && !image);

  return (
    <div className="flex flex-col gap-1.5">
      {(statusMsg || engine) && (
        <div className="flex items-center gap-2 px-1 min-h-[20px]">
          {statusMsg && (
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              {loading && (
                <Loader2 size={11} className="animate-spin shrink-0" />
              )}
              {statusMsg}
            </span>
          )}
          {!loading && engine && !statusMsg && (
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
                engine === "mcp"
                  ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              }`}
            >
              {engine === "mcp" ? (
                <>
                  <Bot size={10} /> Gemini MCP
                </>
              ) : (
                <>
                  <Zap size={10} /> Gemini
                </>
              )}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center border rounded-lg px-3 py-2 bg-white dark:bg-neutral-900">
        <input
          className="flex-1 outline-none bg-transparent text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            result
              ? "Refine: 'make responsive', 'add dark mode', 'add animations'..."
              : "Add a command (optional) then click Generate..."
          }
          onKeyDown={handleKeyDown}
          disabled={loading}
        />

        <button
          onClick={onClear}
          disabled={loading}
          title="Clear all"
          className="ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium
                     text-muted-foreground hover:text-foreground hover:bg-muted
                     disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Trash2 size={13} />
          Clear
        </button>

        <button
          onClick={handleGenerate}
          disabled={isDisabled}
          className="ml-2 flex items-center gap-2 px-4 py-1.5 rounded-md bg-black text-white text-sm font-medium
                     dark:bg-white dark:text-black
                     hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-opacity"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          {loading ? "Generating..." : result ? "Re-generate" : "Generate"}
        </button>
      </div>
    </div>
  );
}
