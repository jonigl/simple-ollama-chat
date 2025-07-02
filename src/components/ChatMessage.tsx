import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
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
          "max-w-[80%] rounded-lg px-4 py-3 shadow-card",
          isUser 
            ? "bg-gradient-user text-user-message-foreground ml-12" 
            : "bg-gradient-ai text-ai-message-foreground mr-12"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <span className="text-xs opacity-70 mt-2 block">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-user flex items-center justify-center shadow-glow">
          <User className="w-4 h-4 text-user-message-foreground" />
        </div>
      )}
    </div>
  );
}