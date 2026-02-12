import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";

export default function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState("gemini-1.5-flash-002");

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem("gemini_api_key");
    if (key) setApiKey(key);

    const model = localStorage.getItem("gemini_model_name");
    if (model) setModelName(model);
  }, []);

  const handleSave = () => {
    localStorage.setItem("gemini_api_key", apiKey);
    localStorage.setItem("gemini_model_name", modelName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Configure your Google Gemini API settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="api-key"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Gemini API Key
            </label>
            <Input
              id="api-key"
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Don't have a key?{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Get one here
              </a>{" "}
              for free.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="model-name"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Model Name
            </label>
            <select
              id="model-name"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-black px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="gemini-2.0-flash-exp">
                gemini-2.0-flash-exp (Fastest, Preview)
              </option>
              <option value="gemini-1.5-flash">gemini-1.5-flash (Alias)</option>
              <option value="gemini-1.5-flash-002">
                gemini-1.5-flash-002 (Latest Stable)
              </option>
              <option value="gemini-1.5-flash-001">
                gemini-1.5-flash-001 (Old Stable)
              </option>
              <option value="gemini-1.5-flash-8b-latest">
                gemini-1.5-flash-8b-latest (High speed)
              </option>
              <option value="gemini-1.5-pro">gemini-1.5-pro (Alias)</option>
              <option value="gemini-1.5-pro-002">
                gemini-1.5-pro-002 (Best Quality)
              </option>
            </select>
            <p className="text-sm text-muted-foreground">
              Select the AI model to use. If one fails, try another.
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save size={16} />
            {saved ? "Saved!" : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
