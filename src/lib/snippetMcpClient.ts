export interface SnippetMcpOptions {
  css: string;
  instruction?: string;
  existingCode?: string;
  geminiApiKey: string;
  onStatus: (message: string) => void;
}

const MCP_URL = "http://localhost:4000/api/snippet-mcp/run";

export async function runSnippetMcp(
  options: SnippetMcpOptions,
): Promise<string> {
  const { css, instruction, existingCode, geminiApiKey, onStatus } = options;

  let response: Response;
  try {
    response = await fetch(MCP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ css, instruction, existingCode, geminiApiKey }),
    });
  } catch {
    throw new Error(
      "Cannot reach MCP server (localhost:4000). Is it running? Falling back to Gemini.",
    );
  }

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error((errJson as any).error || "MCP server error");
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalCode = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const event = JSON.parse(line.slice(6)) as {
          type: string;
          message?: string;
          code?: string;
        };

        if (event.type === "status" && event.message) {
          onStatus(event.message);
        }
        if (event.type === "done" && event.code) {
          finalCode = event.code;
        }
        if (event.type === "error") {
          throw new Error(event.message || "MCP error");
        }
      } catch (parseErr: any) {
        if (
          parseErr.message !== "MCP error" &&
          !parseErr.message?.includes("JSON")
        ) {
          throw parseErr;
        }
      }
    }
  }

  if (!finalCode) {
    throw new Error("MCP returned no code");
  }

  return finalCode;
}

export async function isMcpServerAvailable(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:4000/api/snippet-mcp/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _ping: true }),
      signal: AbortSignal.timeout(2000),
    });
    return res.status !== 0;
  } catch {
    return false;
  }
}
