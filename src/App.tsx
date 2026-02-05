import { useState } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import Converter from "./pages/Converter";
import Preview from "./pages/Preview";
import Settings from "./pages/Settings";
import SnippetGenerator from "./pages/SnippetGenerator";

export type View = "converter" | "settings" | "preview" | "snippet";

function App() {
  const [activeView, setActiveView] = useState<View>(() => {
    return localStorage.getItem("gemini_api_key") ? "converter" : "settings";
  });

  const [image, setImage] = useState<File | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const [snippetCss, setSnippetCss] = useState("");
  const [snippetImage, setSnippetImage] = useState<File | null>(null);
  const [snippetResult, setSnippetResult] = useState<string | null>(null);

  return (
    <AppLayout activeView={activeView} onNavigate={setActiveView}>
      {activeView === "converter" && (
        <Converter
          image={image}
          setImage={setImage}
          result={generatedCode}
          setResult={setGeneratedCode}
        />
      )}

      {activeView === "snippet" && (
        <SnippetGenerator
          css={snippetCss}
          setCss={setSnippetCss}
          image={snippetImage}
          setImage={setSnippetImage}
          result={snippetResult}
          setResult={setSnippetResult}
        />
      )}

      {activeView === "preview" && <Preview />}

      {activeView === "settings" && <Settings />}
    </AppLayout>
  );
}

export default App;
