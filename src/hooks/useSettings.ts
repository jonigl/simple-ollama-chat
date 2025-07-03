import { useState, useEffect } from "react";

export function useSettings() {
  const [thinkingMode, setThinkingMode] = useState(false);
  const [streamingMode, setStreamingMode] = useState(true);

  // Load settings from localStorage
  useEffect(() => {
    const savedThinkingMode = localStorage.getItem('thinkingMode');
    const savedStreamingMode = localStorage.getItem('streamingMode');
    
    if (savedThinkingMode !== null) {
      setThinkingMode(JSON.parse(savedThinkingMode));
    }
    if (savedStreamingMode !== null) {
      setStreamingMode(JSON.parse(savedStreamingMode));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('thinkingMode', JSON.stringify(thinkingMode));
  }, [thinkingMode]);

  useEffect(() => {
    localStorage.setItem('streamingMode', JSON.stringify(streamingMode));
  }, [streamingMode]);

  return {
    thinkingMode,
    setThinkingMode,
    streamingMode,
    setStreamingMode,
  };
}