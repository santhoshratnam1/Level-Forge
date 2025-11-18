import { useState, useCallback } from 'react';
import { getChatResponse } from '../lib/ai/chatService';
import type { ChatMessage } from '../types/portfolio';
import type { Block } from '../types/portfolio';

// Utility to convert portfolio blocks to a string for context
const blocksToContextString = (blocks: Block[]): string => {
  return blocks.map(block => {
    let content = `[${block.type}]`;
    if (block.content.text) {
      if(block.content.title) {
         content += ` ${block.content.title}: ${block.content.text}`;
      } else {
         content += ` ${block.content.text}`;
      }
    }
    // Add more cases if needed for other block types
    return content;
  }).join('\n');
};

export const useChat = (portfolioBlocks: Block[]) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const context = useCallback(() => blocksToContextString(portfolioBlocks), [portfolioBlocks]);

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    setError(null);
    
    const userMessage: ChatMessage = { role: 'user', text: message };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      const chatHistory = newMessages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }));
      
      const responseText = await getChatResponse(chatHistory, context());
      const modelMessage: ChatMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, modelMessage]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to get response. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, error, sendMessage };
};
