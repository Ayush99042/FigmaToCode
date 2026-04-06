export interface SnippetMcpOptions {
  css?: string;
  figmaJson?: any;
  figmaImageBase64?: string | null;
  instruction?: string;
  existingCode?: string;
  geminiApiKey: string;
}

const MCP_URL = "http://localhost:4000/api/snippet-mcp/run";

export async function runSnippetMcp(
  options: SnippetMcpOptions,
): Promise<string> {
  const { css, figmaJson, figmaImageBase64, instruction, existingCode, geminiApiKey } = options;

  let response: Response;
  try {
    response = await fetch(MCP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ css, figmaJson, figmaImageBase64, instruction, existingCode, geminiApiKey }),
    });
  } catch {
    throw new Error(
      "Cannot reach MCP server (localhost:4000). Is it running? Falling back to Gemini.",
    );
  }

  const json: any = await response.json();

  if (!response.ok) {
    throw new Error(json?.error || "MCP server error");
  }

  if (!json?.code) {
    throw new Error("MCP returned no code");
  }

  return json.code;
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
