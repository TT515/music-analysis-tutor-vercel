
import React from 'react';
import type { ChatMessage as ChatMessageType } from '../types';

export const ChatMessage: React.FC<ChatMessageType> = ({ role, content }) => {
  const isUser = role === 'user';
  
  const bubbleClasses = isUser
    ? 'bg-blue-600 text-white self-end'
    : 'bg-gray-200 text-gray-800 self-start';
  
  const containerClasses = isUser ? 'justify-end' : 'justify-start';

  return (
    <div className={`flex w-full ${containerClasses}`}>
      <div
        className={`max-w-md lg:max-w-lg px-4 py-2 rounded-xl shadow-sm whitespace-pre-wrap ${bubbleClasses}`}
      >
        {content}
      </div>
    </div>
  );
};
