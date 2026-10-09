import { useState, useEffect, useRef, useCallback } from 'react';
import { LiveChatMessage, StudentProfile } from '../types';

export function useLiveChat(currentUser: StudentProfile | null, targetChannelId?: string) {
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  // Initial fetch via REST API
  const fetchHistory = useCallback(async () => {
    if (!currentUser) return;
    try {
      const url = targetChannelId
        ? `/api/consultation/messages?channelId=${encodeURIComponent(targetChannelId)}`
        : `/api/consultation/messages?userId=${encodeURIComponent(currentUser.id)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch chat history via REST:', err);
    }
  }, [currentUser?.id, targetChannelId]);

  // Connect to WebSocket server
  const connectWebSocket = useCallback(() => {
    if (!currentUser) return;

    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      setConnectionStatus('connecting');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
        // Authenticate with server
        ws.send(
          JSON.stringify({
            type: 'auth',
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.userRoleType || 'siswa',
          })
        );
        // Request channel or user messages
        ws.send(
          JSON.stringify({
            type: 'get_messages',
            channelId: targetChannelId,
            userId: currentUser.id,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === 'auth_success') {
            if (payload.onlineUsers) setOnlineUsers(payload.onlineUsers);
          } else if (payload.type === 'presence_update') {
            if (payload.onlineUsers) setOnlineUsers(payload.onlineUsers);
          } else if (payload.type === 'messages_history') {
            if (payload.messages && Array.isArray(payload.messages)) {
              setMessages((prev) => {
                const map = new Map<string, LiveChatMessage>();
                prev.forEach((m) => map.set(m.id, m));
                payload.messages.forEach((m: LiveChatMessage) => map.set(m.id, m));
                return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
              });
            }
          } else if (payload.type === 'new_message') {
            const newMsg: LiveChatMessage = payload.message;
            // Check if relevant to this client or channel
            const isRelevant =
              !targetChannelId ||
              newMsg.channelId === targetChannelId ||
              newMsg.senderId === currentUser.id ||
              newMsg.recipientId === currentUser.id;

            if (isRelevant) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
            }
          } else if (payload.type === 'typing') {
            if (payload.recipientId === currentUser.id) {
              setTypingUsers((prev) => ({
                ...prev,
                [payload.senderId]: payload.isTyping,
              }));
            }
          }
        } catch (e) {
          console.error('Error handling WebSocket message:', e);
        }
      };

      ws.onerror = () => {
        setConnectionStatus('disconnected');
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        // Auto-reconnect after 3s
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };
    } catch (e) {
      console.warn('WebSocket init error:', e);
      setConnectionStatus('disconnected');
    }
  }, [currentUser, targetChannelId]);

  useEffect(() => {
    fetchHistory();
    connectWebSocket();

    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [fetchHistory, connectWebSocket]);

  // Send Message function
  const sendMessage = useCallback(
    async (
      recipient: { id: string; name: string; role: 'siswa' | 'guru_bk' | 'psikolog' | 'admin' },
      text: string,
      categoryTag?: string
    ) => {
      if (!currentUser || !text.trim()) return;

      const trimmedText = text.trim();
      const channel = targetChannelId || `chat_${[currentUser.id, recipient.id].sort().join('_')}`;
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const msgPayload: LiveChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        channelId: channel,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.userRoleType || 'siswa',
        senderAvatar: currentUser.avatar,
        recipientId: recipient.id,
        recipientName: recipient.name,
        recipientRole: recipient.role,
        text: trimmedText,
        time: timeStr,
        timestamp: Date.now(),
        categoryTag: categoryTag || 'Konsultasi Siswa',
        isRead: false,
      };

      // 1. Optimistic update
      setMessages((prev) => {
        if (prev.some((m) => m.id === msgPayload.id)) return prev;
        return [...prev, msgPayload];
      });

      // 2. Send via WebSocket if connected
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'send_message',
            message: msgPayload,
          })
        );
      } else {
        // Fallback to REST API
        try {
          await fetch('/api/consultation/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msgPayload }),
          });
        } catch (e) {
          console.warn('REST fallback message failed:', e);
        }
      }
    },
    [currentUser, targetChannelId]
  );

  const sendTyping = useCallback(
    (recipientId: string, isTyping: boolean) => {
      if (!currentUser || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
      socketRef.current.send(
        JSON.stringify({
          type: 'typing',
          senderId: currentUser.id,
          recipientId,
          isTyping,
        })
      );
    },
    [currentUser]
  );

  return {
    messages,
    onlineUsers,
    connectionStatus,
    typingUsers,
    sendMessage,
    sendTyping,
    refreshMessages: fetchHistory,
  };
}
