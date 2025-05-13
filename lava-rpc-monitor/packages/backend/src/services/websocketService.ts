import WebSocket, { WebSocketServer } from 'ws';
import { RpcMetrics } from '../types';
import { getLatestMetrics } from './metricsService';

const DEFAULT_PORT = 8080;
let wss: WebSocketServer | null = null;

export function startWebSocketServer(port: number = DEFAULT_PORT): void {
  if (wss) {
    console.warn('WebSocketServer is already running.');
    return;
  }

  wss = new WebSocketServer({ port });

  wss.on('listening', () => {
    console.log(`WebSocketServer started and listening on port ${port}`);
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected.');

    try {
      const currentMetrics = getLatestMetrics();
      ws.send(JSON.stringify(currentMetrics));
    } catch (error) {
      console.error('WebSocket: Error sending initial metrics to client:', error);
    }

    ws.on('message', (message: WebSocket.RawData) => {
      console.log('WebSocket client message received:', message.toString());
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected.');
    });

    ws.on('error', (error: Error) => {
      console.error('WebSocket client error:', error);
    });
  });

  wss.on('error', (error: Error) => {
    console.error('WebSocketServer error:', error);
    wss = null;
  });
}

export function broadcastMetrics(data: RpcMetrics): void {
  if (!wss) {
    return;
  }

  const jsonData = JSON.stringify(data);
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(jsonData);
      } catch (error) {
        console.error('WebSocket: Error broadcasting metrics to a client:', error);
      }
    }
  });
}

export function stopWebSocketServer(): void {
  if (wss) {
    wss.close((err: Error | undefined) => {
      if (err) {
        console.error('WebSocketServer: Error during close:', err);
      }
      console.log('WebSocketServer stopped.');
      wss = null;
    });
    wss.clients.forEach((client: WebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
            client.terminate();
        }
    });
  } else {
    console.warn('WebSocketServer is not running.');
  }
} 