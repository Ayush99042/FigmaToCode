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
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem("gemini_api_key");
    if (key) setApiKey(key);
  }, []);

  const handleSave = () => {
    localStorage.setItem("gemini_api_key", apiKey.trim());

    localStorage.setItem("gemini_model_name", "gemini-1.5-flash");

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Configure your Google Gemini API key.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Gemini API Key</label>
            <Input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Get a free key from{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            <strong>Model:</strong> gemini-1.5-flash (fixed & SDK-safe)
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
