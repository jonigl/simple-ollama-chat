import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  thinking?: string;
}

interface UseChatStateProps {
  ollamaUrl: string;
  selectedModel: string;
  thinkingMode: boolean;
  streamingMode: boolean;
}

export function useChatState({ ollamaUrl, selectedModel, thinkingMode, streamingMode }: UseChatStateProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!selectedModel) {
      toast({
        title: "No Model Selected",
        description: "Please select a model before sending a message.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          stream: streamingMode,
          think: thinkingMode,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (streamingMode) {
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get response reader');
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: '',
          role: 'assistant',
          timestamp: new Date(),
          ...(thinkingMode && { thinking: '' }),
        };

        setMessages(prev => [...prev, assistantMessage]);

        let fullContent = '';
        let fullThinking = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              let hasUpdate = false;

              if (data.message?.content) {
                fullContent += data.message.content;
                hasUpdate = true;
              }

              if (thinkingMode && data.message?.thinking) {
                fullThinking += data.message.thinking;
                hasUpdate = true;
              }

              if (hasUpdate) {
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMessage.id
                    ? {
                        ...msg,
                        content: fullContent,
                        ...(thinkingMode && { thinking: fullThinking })
                      }
                    : msg
                ));
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      } else {
        // Non-streaming mode - wait for complete response
        const responseData = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: responseData.message?.content || responseData.response || '',
          role: 'assistant',
          timestamp: new Date(),
          ...(thinkingMode && responseData.message?.thinking && { thinking: responseData.message.thinking }),
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message. Check your Ollama connection.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  return {
    messages,
    isLoading,
    messagesEndRef,
    clearChat,
    stopGeneration,
    sendMessage,
  };
}
