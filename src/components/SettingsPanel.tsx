import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Brain, Zap, Sun, Moon, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SettingsPanelProps {
  thinkingMode: boolean;
  onThinkingModeChange: (enabled: boolean) => void;
  streamingMode: boolean;
  onStreamingModeChange: (enabled: boolean) => void;
}

export function SettingsPanel({
  thinkingMode,
  onThinkingModeChange,
  streamingMode,
  onStreamingModeChange,
}: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="border-border/50 bg-input/50 hover:bg-accent/50"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-card/95 backdrop-blur-sm border-border/50" align="end">
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Settings</h4>
            <p className="text-sm text-muted-foreground">
              Configure your chat experience
            </p>
          </div>
          
          <div className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Sun className="w-4 h-4 text-muted-foreground" />
                )}
                <Label htmlFor="theme-toggle" className="text-sm">
                  Dark Mode
                </Label>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>

            {/* Thinking Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label htmlFor="thinking-toggle" className="text-sm">
                    Thinking Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show model's reasoning process
                  </p>
                </div>
              </div>
              <Switch
                id="thinking-toggle"
                checked={thinkingMode}
                onCheckedChange={onThinkingModeChange}
              />
            </div>

            {/* Streaming Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label htmlFor="streaming-toggle" className="text-sm">
                    Streaming Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Real-time response streaming
                  </p>
                </div>
              </div>
              <Switch
                id="streaming-toggle"
                checked={streamingMode}
                onCheckedChange={onStreamingModeChange}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}