import { Code, Moon, Play, Settings, Sun } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";

type View = "converter" | "settings" | "preview" | "snippet";
type Theme = "light" | "dark";

interface AppLayoutProps {
  children: React.ReactNode;
  activeView: View;
  onNavigate: (view: View) => void;
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all",
        "hover:bg-accent hover:text-accent-foreground",
        active
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground",
      )}
    >
      {icon}
      <span className="hidden md:block">{label}</span>
    </button>
  );
}

export function AppLayout({
  children,
  activeView,
  onNavigate,
}: AppLayoutProps) {
  const [theme, setTheme] = useState<Theme>("dark");

  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "flex h-screen overflow-hidden transition-colors",
        isDark ? "bg-black text-white" : "bg-white text-black",
      )}
    >
      <aside
        className={cn(
          "w-16 md:w-64 border-r flex flex-col",
          isDark
            ? "bg-black border-neutral-800"
            : "bg-white border-neutral-200",
        )}
      >
        <div className="p-4 flex items-center gap-2 border-b h-16">
          <span className="font-bold text-lg hidden md:block">
            Figma To Code
          </span>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          <NavButton
            icon={<Code size={20} />}
            label="Converter"
            active={activeView === "converter"}
            onClick={() => onNavigate("converter")}
          />
          <NavButton
            icon={<Code size={20} />}
            label="Snippet"
            active={activeView === "snippet"}
            onClick={() => onNavigate("snippet")}
          />
          <NavButton
            icon={<Play size={20} />}
            label="Preview"
            active={activeView === "preview"}
            onClick={() => onNavigate("preview")}
          />
          <NavButton
            icon={<Settings size={20} />}
            label="Settings"
            active={activeView === "settings"}
            onClick={() => onNavigate("settings")}
          />
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header
          className={cn(
            "h-16 border-b flex items-center justify-between px-6",
            isDark
              ? "border-neutral-800 bg-black/60"
              : "border-neutral-200 bg-white/60",
          )}
        >
          <h1 className="text-xl font-semibold capitalize">{activeView}</h1>

          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 rounded-md hover:bg-neutral-800/20 transition"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto h-full">{children}</div>
        </div>
      </main>
    </div>
  );
}
