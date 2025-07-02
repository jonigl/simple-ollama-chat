import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onStop?: () => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, onStop, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex gap-3 items-end max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={disabled}
            className={cn(
              "min-h-[60px] max-h-[120px] resize-none rounded-xl",
              "bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground",
              "focus:border-primary/50 focus:ring-1 focus:ring-primary/20",
              "transition-all duration-200"
            )}
            rows={1}
          />
        </div>
        
        {isLoading ? (
          <Button
            type="button"
            onClick={onStop}
            variant="destructive"
            size="icon"
            className="h-[60px] w-[60px] rounded-xl shadow-card"
          >
            <Square className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            className={cn(
              "h-[60px] w-[60px] rounded-xl shadow-card",
              "bg-gradient-primary hover:shadow-glow",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
          >
            <Send className="w-5 h-5" />
          </Button>
        )}
      </div>
    </form>
  );
}