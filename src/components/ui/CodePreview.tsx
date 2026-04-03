import { useEffect, useRef } from "react";

interface CodePreviewProps {
  code: string;
}

/**
 * Wraps arbitrary generated JSX / React code in a full sandboxed HTML document
 * that loads React, ReactDOM and Tailwind via CDN, transpiles JSX with Babel
 * Standalone, then mounts the component.
 *
 * It handles:
 *  - Named function components:  function Foo() { return <div/> }
 *  - Arrow components assigned:  const Foo = () => <div/>
 *  - export default wrapping
 *  - Raw JSX fragment (no function wrapper)
 */
function buildIframeHtml(rawCode: string): string {
  // Strip any import / export statements — CDN handles them
  let code = rawCode
    .replace(/^import\s+.*?from\s+['"][^'"]+['"]\s*;?\s*$/gm, "")
    .replace(/^export\s+default\s+/gm, "")
    .replace(/^export\s+/gm, "")
    .trim();

  // Detect whether there's already a component definition
  const hasFunctionDecl = /^(function\s+\w+|const\s+\w+\s*=\s*(function|\())/m.test(code);
  const hasClassDecl = /^class\s+\w+/m.test(code);
  const hasComponentDecl = hasFunctionDecl || hasClassDecl;

  // Try to find the component name to render it
  let componentName = "GeneratedComponent";
  const fnMatch = code.match(/function\s+(\w+)\s*\(/);
  const arrowMatch = code.match(/(?:const|let|var)\s+(\w+)\s*=/);
  const classMatch = code.match(/class\s+(\w+)/);
  if (fnMatch) componentName = fnMatch[1];
  else if (arrowMatch) componentName = arrowMatch[1];
  else if (classMatch) componentName = classMatch[1];

  let finalCode: string;
  if (hasComponentDecl) {
    // Code already has a component — just make sure we render it
    finalCode = `
${code}

const __root = ReactDOM.createRoot(document.getElementById('root'));
__root.render(React.createElement(${componentName}));
    `;
  } else {
    // Raw JSX fragment — wrap it in a component
    finalCode = `
const ${componentName} = () => (
  ${code}
);

const __root = ReactDOM.createRoot(document.getElementById('root'));
__root.render(React.createElement(${componentName}));
    `;
  }

  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: sans-serif; background: #fff; }
    #__preview-error {
      position: fixed; inset: 0; display: flex; align-items: center;
      justify-content: center; flex-direction: column; gap: 8px;
      background: #fff0f0; color: #c00; font-family: monospace;
      font-size: 13px; padding: 24px; text-align: center; z-index: 9999;
    }
    #__preview-error pre { background: #ffe5e5; padding: 12px; border-radius: 6px; text-align: left; max-width: 100%; overflow: auto; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react">
    try {
      ${finalCode}
    } catch(e) {
      document.getElementById('root').innerHTML =
        '<div id="__preview-error"><strong>⚠ Preview Error</strong><pre>' +
        e.message.replace(/</g,'&lt;') +
        '</pre></div>';
    }
  </script>
</body>
</html>`;
}

export function CodePreview({ code }: CodePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    const html = buildIframeHtml(code);
    iframeRef.current.srcdoc = html;
  }, [code]);

  return (
    <iframe
      ref={iframeRef}
      title="Live Preview"
      sandbox="allow-scripts allow-same-origin"
      className="w-full h-full rounded-lg border-0 bg-white"
      style={{ minHeight: "100%" }}
    />
  );
}
