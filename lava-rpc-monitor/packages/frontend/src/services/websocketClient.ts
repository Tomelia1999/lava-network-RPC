// Define the structure for the metrics data we expect from the backend
// This should align with what the backend's metricsService provides

// Define the expected structure of a single call record
export interface CallRecord {
  method: string;
  startTime: number;
  endTime: number;
  statusCode: number;
  isSuccess: boolean;
  result?: any; // Can be any type or undefined if error
  error?: string;
}

import type { EthSyncingResultObject } from '../types/apiTypes'; // Corrected to type-only import

export interface RpcMetrics {
    totalRequests: number;
    successfulRequests: number;
    errorCount: number;
    averageResponseTimeMs: number;
    lastBlockNumber: string | null;
    lastChainId: string | null;
    successRate: number;
    callRecords: any[]; // Changed from RpcCallRecord[] to any[]
    errorMessages: { timestamp: string; message: string }[];
    syncingStatus: EthSyncingResultObject | false | null;
    // Add other relevant metrics here as they are defined
}

// Define the type for the listener function that components will use
export type MetricsListener = (metrics: RpcMetrics) => void;

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

class WebSocketClient {
    private ws: WebSocket | null = null;
    private listeners: Set<MetricsListener> = new Set();
    private reconnectInterval: number = 5000; // 5 seconds
    private reconnectTimeoutId: number | null = null;

    constructor() {
        this.connect();
    }

    private connect = () => {
        console.log(`Attempting to connect WebSocket to ${WS_URL}...`);
        // Clear any existing reconnect timeout
        if (this.reconnectTimeoutId) {
            clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = null;
        }

        // Close existing connection if any before attempting a new one
        if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
            this.ws.close();
        }


        try {
            this.ws = new WebSocket(WS_URL);

            this.ws.onopen = this.handleOpen;
            this.ws.onmessage = this.handleMessage;
            this.ws.onerror = this.handleError;
            this.ws.onclose = this.handleClose;
        } catch (error) {
            console.error("WebSocket instantiation failed:", error);
            this.scheduleReconnect(); // Schedule reconnect if instantiation fails
        }
    }

    private handleOpen = () => {
        console.log("WebSocket connection opened.");
        // Reset reconnect interval logic if needed upon successful connection
    }

    private handleMessage = (event: MessageEvent) => {
        try {
            const metrics: RpcMetrics = JSON.parse(event.data);
            // console.log("Received metrics:", metrics); // Optional: for debugging
            // Notify all listeners
            this.listeners.forEach(listener => listener(metrics));
        } catch (error) {
            console.error("Failed to parse incoming WebSocket message:", error);
        }
    }

    private handleError = (event: Event) => {
        console.error("WebSocket error:", event);
        // Error event is usually followed by a close event, which handles reconnect
    }

    private handleClose = (event: CloseEvent) => {
        console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason || 'N/A'}`);
        this.ws = null; // Ensure ws is nullified
        this.scheduleReconnect();
    }

    private scheduleReconnect = () => {
         // Avoid scheduling multiple reconnects
        if (this.reconnectTimeoutId) {
            return;
        }
        console.log(`Scheduling WebSocket reconnect in ${this.reconnectInterval / 1000} seconds...`);
        this.reconnectTimeoutId = window.setTimeout(this.connect, this.reconnectInterval);
    }


    public addListener = (listener: MetricsListener) => {
        this.listeners.add(listener);
    }

    public removeListener = (listener: MetricsListener) => {
        this.listeners.delete(listener);
    }

    // Optional: Method to explicitly close the connection if needed
    public close = () => {
        if (this.reconnectTimeoutId) {
            clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null; // Explicitly nullify after calling close
        }
    }
}

// Export a singleton instance
const webSocketClient = new WebSocketClient();
export default webSocketClient; 