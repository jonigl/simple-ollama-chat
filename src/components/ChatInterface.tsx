import { useState, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { SettingsPanel } from "./SettingsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, MessageSquare, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatState } from "@/hooks/useChatState";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";

interface OllamaModel {
  name: string;
  model: string;
  size: number;
  digest: string;
}

export function ChatInterface() {
  const [selectedModel, setSelectedModel] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const { toast } = useToast();

  const { thinkingMode, setThinkingMode, streamingMode, setStreamingMode } =
    useSettings();

  const {
    messages,
    isLoading,
    messagesEndRef,
    clearChat,
    stopGeneration,
    sendMessage,
  } = useChatState({
    ollamaUrl,
    selectedModel,
    thinkingMode,
    streamingMode,
  });

  const fetchModels = async () => {
    setIsLoadingModels(true);
    try {
      const response = await fetch(`${ollamaUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      const data = await response.json();
      setModels(data.models || []);
    } catch (error) {
      console.error('Error fetching models:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to Ollama. Make sure Ollama is running on the specified URL.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingModels(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [ollamaUrl]);

  return (
    <div className="flex flex-col h-screen bg-gradient-bg">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="flex items-center justify-between pl-8 pr-4 pt-4">
          <div className="flex items-center gap-3">
            <div className="relative inline-flex items-center justify-center">
              {/* Ollama icon */}
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                <img
                  src="/ollama-icon.png"
                  alt="Ollama"
                  className="h-12 w-auto filter brightness-0 invert"
                />
              </div>
              {/* Message square positioned to look like it's coming from the icon */}
              <div className="absolute -right-2 -top-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-border/20">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Simple Ollama Chat
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="ollama-url"
                className="text-sm text-muted-foreground"
              >
                Ollama Server URL:
              </Label>
              <Input
                id="ollama-url"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                className={cn(
                  "w-48 bg-input/50 border-border/50",
                  "focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                )}
                placeholder="http://localhost:11434"
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={fetchModels}
              disabled={isLoadingModels}
              className={cn(
                "border-border/50 bg-input/50 hover:bg-input/70",
                isLoadingModels && "animate-spin"
              )}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>

            <SettingsPanel
              streamingMode={streamingMode}
              onStreamingModeChange={setStreamingMode}
            />

            <Button
              variant="outline"
              size="icon"
              onClick={clearChat}
              disabled={isLoading}
              className="border-border/50 bg-input/50 hover:bg-destructive/20 hover:border-destructive/50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="relative inline-flex items-center justify-center mb-4">
                {/* Ollama icon */}
                <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse-glow">
                  <img
                    src="/ollama-icon.png"
                    alt="Ollama"
                    className="h-24 w-auto filter brightness-0 invert"
                  />
                </div>
                {/* Message square positioned to look like it's coming from the icon */}
                <div className="absolute -right-2 -top-1 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-border/20">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Welcome to Simple Ollama Chat
              </h2>
              <p className="text-muted-foreground">
                Start a conversation with your AI assistant. Select a model and
                type your message below.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map((message, index) => {
              // Check if this is the last message and thinking is currently active
              const isLastMessage = index === messages.length - 1;
              const isThinkingActive =
                isLastMessage &&
                message.role === "assistant" &&
                thinkingMode &&
                isLoading;

              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isThinkingActive={isThinkingActive}
                />
              );
            })}
            {isLoading && (
              <div className="flex justify-start p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-ai flex items-center justify-center shadow-card">
                    <div className="w-4 h-4 rounded-full bg-accent animate-pulse" />
                  </div>
                  <div className="bg-gradient-ai text-ai-message-foreground rounded-lg px-4 py-3 shadow-card">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-accent rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-accent rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={sendMessage}
        isLoading={isLoading}
        onStop={stopGeneration}
        disabled={!selectedModel}
        thinkingMode={thinkingMode}
        onThinkingModeChange={setThinkingMode}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        models={models}
        isLoadingModels={isLoadingModels}
      />
    </div>
  );
}
