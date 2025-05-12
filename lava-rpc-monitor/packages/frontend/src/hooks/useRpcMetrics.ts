import { useState, useEffect } from 'react';
import webSocketClient from '../services/websocketClient';
import type { RpcMetrics, MetricsListener } from '../services/websocketClient';

// Define a default/initial state for metrics
const initialMetrics: RpcMetrics = {
    blockNumber: null,
    chainId: null,
    successRate: null,
    averageResponseTimeMs: null,
    errorMessages: [],
};

export function useRpcMetrics() {
    const [metrics, setMetrics] = useState<RpcMetrics>(initialMetrics);
    // Could add connection status state here too (e.g., connecting, open, closed)

    useEffect(() => {
        // Define the listener function that updates state
        const listener: MetricsListener = (newMetrics) => {
            setMetrics(newMetrics);
        };

        // Add the listener when the component mounts
        webSocketClient.addListener(listener);

        // Return a cleanup function to remove the listener when the component unmounts
        return () => {
            webSocketClient.removeListener(listener);
        };
    }, []); // Empty dependency array ensures this runs only once on mount/unmount

    return metrics;
} 