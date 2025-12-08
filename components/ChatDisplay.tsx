
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { Spinner } from './Spinner';
import type { ChatDisplayProps } from '../types';

export const ChatDisplay: React.FC<ChatDisplayProps> = ({ messages, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl shadow-inner">
        <header className="p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Conversation</h2>
        </header>
        <div ref={scrollRef} className="flex-1 p-4 space-y-4 overflow-y-auto" aria-live="polite">
        {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <p>Your conversation will appear here.</p>
                <p className="text-sm">Upload an audio file and enter a prompt to begin.</p>
            </div>
        )}
        {messages.map((msg, index) => (
          <ChatMessage key={index} role={msg.role} content={msg.content} />
        ))}
        {isLoading && (
          <div className="flex justify-start w-full" aria-label="Assistant is typing">
            <div className="max-w-md lg:max-w-lg px-4 py-3 rounded-xl shadow bg-gray-200 text-gray-800 self-start flex items-center gap-3">
                <Spinner className="h-5 w-5 border-b-2 border-gray-600" />
                <span className="text-sm font-medium">Thinking...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
