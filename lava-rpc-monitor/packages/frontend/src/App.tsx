import React, { useEffect } from 'react';
import { useRpcMetrics } from './hooks/useRpcMetrics';
import BlockNumberDisplay from './components/BlockNumberDisplay';
import ChainIdDisplay from './components/ChainIdDisplay';
import SuccessRateDisplay from './components/SuccessRateDisplay';
import AvgResponseTimeDisplay from './components/AvgResponseTimeDisplay';
import ErrorLogDisplay from './components/ErrorLogDisplay';
import StatusIndicator from './components/StatusIndicator';

import './index.css';

function App() {
    const metrics = useRpcMetrics();

    useEffect(() => {
        console.log('metrics', metrics);
    }, [metrics]);

    return (
        <React.Fragment>
            <h1>Lava RPC Monitor</h1>
            <div className="grid-container">
                <div className="card">
                    <StatusIndicator successRate={metrics.successRate} errorMessages={metrics.errorMessages} />
                </div>
                 <div className="card">
                    <BlockNumberDisplay blockNumber={metrics.blockNumber} />
                </div>
                 <div className="card">
                    <ChainIdDisplay chainId={metrics.chainId} />
                </div>
                 <div className="card">
                    <SuccessRateDisplay successRate={metrics.successRate} />
                </div>
                 <div className="card">
                    <AvgResponseTimeDisplay averageResponseTimeMs={metrics.averageResponseTimeMs} />
                </div>
                 <div className="card error-log">
                    <ErrorLogDisplay errorMessages={metrics.errorMessages} />
                </div>
            </div>
        </React.Fragment>
    );
}

export default App;
