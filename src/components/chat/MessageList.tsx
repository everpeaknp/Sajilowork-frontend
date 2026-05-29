'use client';

import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, Loader2 } from 'lucide-react';
import { Message } from '@/types';

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
  isLoading: boolean;
}

export default function MessageList({ messages, currentUserId, isLoading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.map((message, index) => {
          const isOwnMessage = Number(message.sender.id) === currentUserId;
          const showDate =
            index === 0 ||
            format(new Date(messages[index - 1].created_at || ''), 'yyyy-MM-dd') !==
              format(new Date(message.created_at || ''), 'yyyy-MM-dd');

          return (
            <div key={message.id}>
              {/* Date Separator */}
              {showDate && (
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {format(new Date(message.created_at || ''), 'MMMM d, yyyy')}
                  </div>
                </div>
              )}

              {/* Message */}
              <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end space-x-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  {!isOwnMessage && (
                    <img
                      src={message.sender.profile_image || '/images/default-avatar.png'}
                      alt={message.sender.full_name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}

                  {/* Message Bubble */}
                  <div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>

                    {/* Time and Read Status */}
                    <div className={`flex items-center space-x-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-gray-500">
                        {format(new Date(message.created_at || ''), 'h:mm a')}
                      </span>
                      {isOwnMessage && (
                        <span className="text-xs">
                          {message.is_read ? (
                            <CheckCheck className="h-3 w-3 text-blue-500" />
                          ) : (
                            <Check className="h-3 w-3 text-gray-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
