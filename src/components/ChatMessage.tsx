import { cn } from "@/lib/utils";
import { Bot, User, Brain } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    thinking?: string;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [showThinking, setShowThinking] = useState(false);
  const hasThinking = message.thinking && message.thinking.length > 0;
  
  return (
    <div 
      className={cn(
        "flex gap-3 p-4 animate-slide-up",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-ai flex items-center justify-center shadow-card">
          <Bot className="w-4 h-4 text-accent" />
        </div>
      )}
      
      <div 
        className={cn(
          "max-w-[80%] space-y-2",
          isUser ? "ml-12" : "mr-12"
        )}
      >
        {/* Thinking Process */}
        {hasThinking && !isUser && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowThinking(!showThinking)}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Brain className="w-3 h-3 mr-1" />
              {showThinking ? 'Hide' : 'Show'} thinking process
            </Button>
            
            {showThinking && (
              <div className="bg-muted/30 border border-border/30 rounded-lg px-3 py-2 animate-fade-in thinking-shimmer">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-3 h-3 text-muted-foreground animate-pulse" />
                  <span className="text-xs text-muted-foreground font-medium">Thinking...</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap animate-typing">
                  {message.thinking}
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Main Message */}
        <div 
          className={cn(
            "rounded-lg px-4 py-3 shadow-card",
            isUser 
              ? "bg-gradient-user text-user-message-foreground" 
              : "bg-gradient-ai text-ai-message-foreground"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <span className="text-xs opacity-70 mt-2 block">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-user flex items-center justify-center shadow-glow">
          <User className="w-4 h-4 text-user-message-foreground" />
        </div>
      )}
    </div>
  );
}