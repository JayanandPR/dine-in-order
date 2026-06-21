import { useEffect, useRef, useCallback } from 'react';

type WsHandler = (data: any) => void;

export const useWebSocket = (tableId: string, restaurantId: string, onMessage: WsHandler) => {
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!restaurantId) return;
    // Dynamically use whatever host the page is served from
    const WS_URL = import.meta.env.VITE_WS_URL ||
      `ws://${window.location.hostname}:3000/ws`;
    const ws = new WebSocket(`${WS_URL}?restaurantId=${restaurantId}&tableId=${tableId}&guest=true`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try { onMessage(JSON.parse(e.data)); } catch {}
    };

    ws.onclose = () => {
      setTimeout(connect, 3000);
    };
  }, [restaurantId, tableId, onMessage]);

  useEffect(() => {
    connect();
    return () => { wsRef.current?.close(); };
  }, [connect]);
};