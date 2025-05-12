import WebSocket, { WebSocketServer } from 'ws';
import { RpcMetrics } from '../types';
import { getLatestMetrics } from './metricsService';

const DEFAULT_PORT = 8080;
let wss: WebSocketServer | null = null;

/**
 * Initializes and starts the WebSocket server.
 * @param port The port number to listen on. Defaults to DEFAULT_PORT.
 */
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

    // Send initial metrics upon connection
    try {
      const currentMetrics = getLatestMetrics();
      ws.send(JSON.stringify(currentMetrics));
    } catch (error) {
      console.error('WebSocket: Error sending initial metrics to client:', error);
    }

    ws.on('message', (message: WebSocket.RawData) => {
      // For now, we don't expect messages from clients, but we can log them.
      console.log('WebSocket client message received:', message.toString());
      // Example: ws.send(`Server received: ${message}`);
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
    wss = null; // Reset wss if server fails to start
  });
}

/**
 * Broadcasts data to all connected WebSocket clients.
 * @param data The data to broadcast (expected to be RpcMetrics).
 */
export function broadcastMetrics(data: RpcMetrics): void {
  if (!wss) {
    // console.warn('WebSocketServer is not running. Cannot broadcast metrics.');
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

/**
 * Stops the WebSocket server.
 */
export function stopWebSocketServer(): void {
  if (wss) {
    wss.close((err: Error | undefined) => {
      if (err) {
        console.error('WebSocketServer: Error during close:', err);
      }
      console.log('WebSocketServer stopped.');
      wss = null;
    });
    // Forcefully close all client connections
    wss.clients.forEach((client: WebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
            client.terminate();
        }
    });
  } else {
    console.warn('WebSocketServer is not running.');
  }
} 