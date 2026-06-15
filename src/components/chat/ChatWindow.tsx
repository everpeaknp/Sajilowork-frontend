'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chat.service';
import { Message } from '@/types';
import { buildChatWebSocketUrl, isWebSocketsEnabled } from '@/lib/chatWebSocket';
import UserAvatar from '@/components/common/UserAvatar';

interface ChatWindowProps {
  taskId: number;
  recipientId: number;
  recipientName: string;
  recipientImage?: string;
  recipientVerified?: boolean;
  onClose: () => void;
}

export default function ChatWindow({
  taskId,
  recipientId,
  recipientName,
  recipientImage,
  recipientVerified = false,
  onClose,
}: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const wsUrl = isWebSocketsEnabled()
    ? buildChatWebSocketUrl(String(taskId))
    : null;

  const { isConnected, sendMessage } = useWebSocket(wsUrl, {
    onMessage: (message) => {
      handleWebSocketMessage(message);
    },
    onConnect: () => {
      console.log('Chat WebSocket connected');
    },
    onDisconnect: () => {
      console.log('Chat WebSocket disconnected');
    },
  });

  useEffect(() => {
    fetchMessages();
  }, [taskId]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      // Convert taskId to conversationId (string)
      const conversationId = String(taskId);
      const response = await chatService.getMessages(conversationId);
      if (response.success && response.data) {
        const payload: any = response.data as any;
        const nextMessages: Message[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.results)
            ? payload.results
            : [];
        setMessages(nextMessages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebSocketMessage = (wsMessage: any) => {
    const { type } = wsMessage as { type: string };
    const data = (wsMessage?.message ?? wsMessage?.data) as Message | undefined;

    switch (type) {
      case 'chat_message':
        if (!data) break;
        setMessages((prev) => {
          if (prev.some((m) => String(m.id) === String(data.id))) return prev;
          return [...prev, data];
        });
        break;

      case 'typing_indicator':
        if (wsMessage.user_id != null && String(wsMessage.user_id) !== String(user?.id)) {
          if (wsMessage.is_typing === false) {
            setIsTyping(false);
            break;
          }
          setIsTyping(true);

          if (typingTimeout) {
            clearTimeout(typingTimeout);
          }

          const timeout = setTimeout(() => {
            setIsTyping(false);
          }, 4000);

          setTypingTimeout(timeout);
        }
        break;

      case 'message_read':
        // Mark messages as read
        if (!wsMessage?.data) break;
        setMessages((prev) =>
          prev.map((msg) =>
            String(msg.id) === String((wsMessage.data as any).message_id)
              ? { ...msg, is_read: true }
              : msg
          )
        );
        break;

      default:
        console.log('Unknown message type:', type);
    }
  };

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) {
      return;
    }

    try {
      // Convert taskId to conversationId (string)
      const conversationId = String(taskId);
      
      // Send via REST API
      const response = await chatService.sendMessage(conversationId, {
        content,
        message_type: attachments && attachments.length > 0 ? 'file' : 'text',
        attachment: attachments && attachments.length > 0 ? attachments[0] : undefined,
      });

      if (response.success && response.data) {
        // Message will be added via WebSocket
        // Optionally, you can add it immediately for better UX
        // setMessages((prev) => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = () => {
    sendMessage({ type: 'typing_start' });
  };

  return (
    <Card className={`fixed bottom-4 right-4 w-96 shadow-2xl transition-all ${isMinimized ? 'h-14' : 'h-[600px]'} flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary text-white rounded-t-lg">
        <div className="flex items-center space-x-3">
          <UserAvatar
            src={recipientImage}
            name={recipientName}
            size="md"
            verified={recipientVerified}
          />
          <div>
            <h3 className="font-semibold">{recipientName}</h3>
            <p className="text-xs opacity-90">
              {isConnected ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-primary-dark"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-primary-dark"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Content */}
      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <MessageList
              messages={messages}
              currentUserId={user?.id ? Number(user.id) : 0}
              isLoading={isLoading}
            />
          </div>

          {/* Typing Indicator */}
          {isTyping && (
            <div className="px-4 py-2">
              <TypingIndicator userName={recipientName} />
            </div>
          )}

          {/* Message Input */}
          <div className="border-t">
            <MessageInput
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              disabled={!isConnected}
            />
          </div>
        </>
      )}
    </Card>
  );
}
