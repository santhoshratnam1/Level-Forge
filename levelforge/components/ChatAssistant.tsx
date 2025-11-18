import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { Icon } from './Icon';
import { useChat } from '../hooks/useChat';
import type { Block } from '../types/portfolio';

interface ChatAssistantProps {
  portfolioBlocks: Block[];
}

const QuickActionButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button
        onClick={onClick}
        className="px-3 py-1.5 bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-full text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-primary)] hover:text-[var(--text-primary)] transition-colors"
    >
        {children}
    </button>
);

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ portfolioBlocks }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const { messages, isLoading, error, sendMessage } = useChat(portfolioBlocks);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = () => {
        if (inputValue.trim()) {
            sendMessage(inputValue);
            setInputValue('');
        }
    };

    const handleQuickAction = (question: string) => {
        sendMessage(question);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full shadow-lg text-white flex items-center justify-center hover:scale-110 transition-transform z-50 animate-pulse"
                aria-label="Open AI Chat Assistant"
            >
                <Icon name="logo" className="w-8 h-8" />
            </button>
        );
    }
    
    const quickActions = [
        "How can I improve navigation?",
        "Suggest combat encounter improvements.",
        "Analyze my pacing.",
        "What's missing from this level?"
    ];

    return (
        <div className="fixed bottom-8 right-8 z-50 w-full max-w-md">
            <GlassCard className="flex flex-col h-[60vh] shadow-2xl">
                <header className="p-4 flex justify-between items-center border-b border-[var(--border-primary)] flex-shrink-0">
                    <h3 className="font-bold text-lg">Forge Assistant</h3>
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                    </button>
                </header>

                <div className="flex-grow p-4 overflow-y-auto custom-scrollbar bg-[var(--bg-secondary)]/50">
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-[var(--text-secondary)] text-sm p-4">
                                <p className="mb-4">Ask me anything about your level analysis. For example:</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {quickActions.map(q => <QuickActionButton key={q} onClick={() => handleQuickAction(q)}>{q}</QuickActionButton>)}
                                </div>
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-[var(--accent-primary)] text-white rounded-br-none' : 'bg-[var(--surface-primary)] text-[var(--text-primary)] rounded-bl-none'}`}>
                                    {msg.text.split('\n').map((line, i) => <p key={i} className="whitespace-pre-wrap">{line}</p>)}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] px-4 py-2 rounded-2xl bg-[var(--surface-primary)] text-[var(--text-primary)] rounded-bl-none">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                         {error && <p className="text-red-400 text-sm">{error}</p>}
                    </div>
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t border-[var(--border-primary)] flex-shrink-0">
                    <div className="flex items-center bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                            placeholder="Ask a follow-up question..."
                            className="flex-grow bg-transparent p-3 focus:outline-none"
                            disabled={isLoading}
                        />
                        <button onClick={handleSendMessage} disabled={isLoading || !inputValue} className="p-3 text-[var(--accent-text)] hover:brightness-110 disabled:text-[var(--text-secondary)] disabled:hover:brightness-100">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};