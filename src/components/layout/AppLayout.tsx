import { Code, Play, Settings } from "lucide-react";
import { cn } from "../../lib/utils";

type View = "converter" | "settings" | "preview" | "snippet";

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
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <aside className="w-16 md:w-64 border-r border-border bg-card flex flex-col">
        <div className="p-4 flex items-center gap-2 border-b border-border h-16">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground">
            A
          </div>
          <span className="font-bold text-lg hidden md:block">
            Anima{" "}
            <span className="text-muted-foreground font-normal">Preview</span>
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

        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground hidden md:block">
            Local Preview Builder
            <br />
            v0.1.0
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-border flex items-center px-6 bg-background/50 backdrop-blur-sm z-10">
          <h1 className="text-xl font-semibold">
            {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
          </h1>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto h-full">{children}</div>
        </div>
      </main>
    </div>
  );
}
