import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { verifyAccessToken } from './jwt';

type WsEventType = 'order:new' | 'order:status_update' | 'table:status_update' | 'bill:generated' | 'delivery:status_update';

interface WsMessage<T = unknown> {
  event: WsEventType;
  restaurantId: string;
  payload: T;
}

const rooms = new Map<string, Set<WebSocket>>();

export const initWebSocket = (server: Server): void => {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    const restaurantId = url.searchParams.get('restaurantId');
    const isGuest = url.searchParams.get('guest') === 'true';

    if (!restaurantId) {
      ws.close(1008, 'Missing restaurantId');
      return;
    }

    // Staff/admin must have valid token; customers connect as guest
    if (!isGuest) {
      if (!token) { ws.close(1008, 'Missing token'); return; }
      try {
        verifyAccessToken(token);
      } catch {
        ws.close(1008, 'Invalid token');
        return;
      }
    }

    if (!rooms.has(restaurantId)) rooms.set(restaurantId, new Set());
    rooms.get(restaurantId)!.add(ws);

    ws.on('close', () => {
      rooms.get(restaurantId)?.delete(ws);
    });

    ws.send(JSON.stringify({ event: 'connected', restaurantId }));
  });

  console.log('WebSocket server initialized at /ws');
};

export const broadcastToRestaurant = <T>(restaurantId: string, message: WsMessage<T>): void => {
  const clients = rooms.get(restaurantId);
  if (!clients) return;
  const data = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
};