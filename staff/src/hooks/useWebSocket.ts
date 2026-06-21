import { useEffect, useRef, useCallback } from 'react';

type WsHandler = (data: any) => void;

export const useWebSocket = (restaurantId: string, onMessage: WsHandler) => {
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || !restaurantId) return;

    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws';
    const ws = new WebSocket(`${WS_URL}?token=${token}&restaurantId=${restaurantId}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try { onMessage(JSON.parse(e.data)); } catch {}
    };

    ws.onclose = () => {
      // Reconnect after 3s on unexpected close
      setTimeout(connect, 3000);
    };
  }, [restaurantId, onMessage]);

  useEffect(() => {
    connect();
    return () => { wsRef.current?.close(); };
  }, [connect]);
};
