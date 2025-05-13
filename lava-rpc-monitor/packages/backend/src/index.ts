import { startMetricsService, stopMetricsService } from './services/metricsService';
import { startWebSocketServer, stopWebSocketServer } from './services/websocketService';

const WEBSOCKET_PORT = process.env.BACKEND_WEBSOCKET_PORT ? parseInt(process.env.BACKEND_WEBSOCKET_PORT, 10) : 8080;

function main() {
  console.log('Backend service starting...');

  try {
    startMetricsService();

    startWebSocketServer(WEBSOCKET_PORT);

    console.log('Backend services initialized and running.');
  } catch (error) {
    console.error('Failed to start backend services:', error);
    process.exit(1);
  }
}

main();

// Graceful shutdown handling
function gracefulShutdown(signal: string) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  
  // Stop WebSocket server
  console.log('Stopping WebSocket server...');
  stopWebSocketServer();

  // Stop metrics polling
  console.log('Stopping metrics service...');
  stopMetricsService();

  setTimeout(() => {
    console.log('Shutdown complete.');
    process.exit(0);
  }, 1000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException'); 
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
}); 