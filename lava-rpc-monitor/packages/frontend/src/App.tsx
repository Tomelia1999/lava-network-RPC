import React, { useEffect } from 'react';
import { useRpcMetrics } from './hooks/useRpcMetrics';
import BlockNumberDisplay from './components/BlockNumberDisplay';
import ChainIdDisplay from './components/ChainIdDisplay';
import SuccessRateDisplay from './components/SuccessRateDisplay';
import AvgResponseTimeDisplay from './components/AvgResponseTimeDisplay';
import ErrorLogDisplay from './components/ErrorLogDisplay';
import StatusIndicator from './components/StatusIndicator';
import ResponseTimeHistogram from './components/graphical_vis/ResponseTimeHistogram';
import SuccessRateChart from './components/graphical_vis/SuccessRateChart';
import SyncingStatusDisplay from './components/SyncingStatusDisplay';

import './index.css';

function App() {
    const metrics = useRpcMetrics();

    useEffect(() => {
        console.log('metrics', metrics);
    }, [metrics]);

    const plainErrorMessages = metrics.errorMessages;

    return (
        <React.Fragment>
            <h1>Lava RPC Monitor</h1>
            <div className="grid-container">
                <div className="card">
                    <StatusIndicator successRate={metrics.successRate} errorMessages={plainErrorMessages} />
                </div>
                 <div className="card">
                    <BlockNumberDisplay blockNumber={metrics.lastBlockNumber} />
                </div>
                 <div className="card">
                    <ChainIdDisplay chainId={metrics.lastChainId} />
                </div>
                <div className="card">
                    <SyncingStatusDisplay syncingStatus={metrics.syncingStatus} />
                </div>
                 <div className="card">
                    <SuccessRateDisplay successRate={metrics.successRate} />
                </div>
                 <div className="card">
                    <AvgResponseTimeDisplay averageResponseTimeMs={metrics.averageResponseTimeMs} />
                </div>
                <div className="card chart-card">
                    <ResponseTimeHistogram callRecords={metrics.callRecords || []} />
                </div>
                <div className="card chart-card">
                    <SuccessRateChart currentSuccessRate={metrics.successRate} />
                </div>
                 <div className="card error-log">
                    <ErrorLogDisplay errorMessages={plainErrorMessages} />
                </div>
            </div>
        </React.Fragment>
    );
}

export default App;
