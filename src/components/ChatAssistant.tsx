import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { convertCssSnippetToReact } from "../lib/cssSnippetToReactGemini";

interface ChatAssistantProps {
  readonly css: string;
  readonly image: File | null;
  readonly setResult: (code: string) => void;
  readonly onClear: () => void;
  readonly disabled?: boolean;
}

export default function ChatAssistant({
  css,
  image,
  setResult,
  onClear,
  disabled = false,
}: ChatAssistantProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!css.trim() && !image) return;

    try {
      setLoading(true);
      // Pass the optional instruction text (may be empty string)
      const code = await convertCssSnippetToReact(css, image, input.trim() || undefined);
      setResult(code);
      setInput("");
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) handleGenerate();
  };

  const isDisabled = disabled || loading || (!css.trim() && !image);

  return (
    <div className="flex items-center border rounded-lg px-3 py-2 bg-white dark:bg-neutral-900">
      <input
        className="flex-1 outline-none bg-transparent text-sm"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add a command (optional) then click Generate..."
        onKeyDown={handleKeyDown}
        disabled={loading}
      />

      <button
        onClick={onClear}
        disabled={loading}
        className="ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium
                   text-muted-foreground hover:text-foreground hover:bg-muted
                   disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        title="Clear all"
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
        {loading ? "Generating..." : "Generate"}
      </button>
    </div>
  );
}
