import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Square, Brain, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MessageImageAttachment } from "@/lib/chatHistory";

interface ChatInputProps {
  onSendMessage: (message: string, image?: MessageImageAttachment) => void;
  isLoading: boolean;
  onStop?: () => void;
  disabled?: boolean;
  thinkingMode: boolean;
  onThinkingModeChange: (enabled: boolean) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  models: Array<{ name: string; size: number }>;
  isLoadingModels: boolean;
  canAttachImages: boolean;
}

export function ChatInput({
  onSendMessage,
  isLoading,
  onStop,
  disabled,
  thinkingMode,
  onThinkingModeChange,
  selectedModel,
  onModelChange,
  models,
  isLoadingModels,
  canAttachImages,
}: ChatInputProps) {
  const defaultImagePrompt = "Transcribe the text of this image.";

  const formatModelSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)}GB`;
  };
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<MessageImageAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!canAttachImages && attachment) {
      setAttachment(null);
    }
  }, [attachment, canAttachImages]);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read attachment."));
      reader.readAsDataURL(file);
    });

  const handleAttachmentSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setAttachment({
      name: file.name,
      mimeType: file.type,
      dataUrl,
    });

    if (!message.trim()) {
      setMessage(defaultImagePrompt);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim(), attachment ?? undefined);
      setMessage("");
      setAttachment(null);
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
      <div className="max-w-4xl mx-auto space-y-2">
        {attachment && (
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/40 px-3 py-2 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-base leading-none">📎</span>
              <span className="truncate text-foreground">{attachment.name}</span>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setAttachment(null)}
              className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="grid grid-cols-[minmax(0,1fr)_60px] gap-x-3 gap-y-2 items-end">
          <div className="min-w-0">
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
              className="h-[60px] w-[60px] rounded-xl [&_svg]:!size-6 hover:bg-destructive/90 transition-all duration-200"
            >
              <Square className="w-6 h-6" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!message.trim() || disabled}
              variant="outline"
              className={cn(
                "h-[60px] w-[60px] rounded-xl [&_svg]:!size-6",
                "bg-primary/0 border-primary/50 text-primary",
                "hover:bg-primary/10 hover:border-primary hover:text-primary",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-200"
              )}
            >
              <Send className="w-6 h-6" />
            </Button>
          )}

          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
            <Select value={selectedModel} onValueChange={onModelChange} disabled={isLoadingModels}>
              <SelectTrigger className={cn(
                "h-8 w-48 rounded-lg text-sm border-border/50",
                "hover:bg-transparent hover:border-foreground hover:text-foreground",
                "focus:border-foreground focus:ring-1 focus:ring-foreground/20",
                "transition-all duration-200"
              )}>
                <SelectValue placeholder="Select model..." className="truncate" />
              </SelectTrigger>
              <SelectContent className="border-border/50">
                {models.map((model) => (
                  <SelectItem
                    key={model.name}
                    value={model.name}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="font-medium truncate">{model.name}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatModelSize(model.size)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {canAttachImages && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAttachmentSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 rounded-lg border-border/50 px-3 text-sm hover:bg-transparent hover:border-primary hover:text-primary"
                >
                  <span className="mr-1.5 text-base leading-none">📎</span>
                  Attach image
                </Button>
              </>
            )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onThinkingModeChange(!thinkingMode)}
              className={cn(
                "h-8 shrink-0 px-3 rounded-lg text-muted-foreground hover:bg-transparent hover:border-primary hover:text-primary",
                thinkingMode && "bg-primary/10 border-primary/50 text-primary"
              )}
            >
              <Brain className="w-3.5 h-3.5 mr-1.5" />
              Thinking
            </Button>
          </div>

          <div aria-hidden="true" />
        </div>
      </div>
    </form>
  );
}
