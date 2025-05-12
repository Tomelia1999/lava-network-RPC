import React from 'react';

interface Props {
    averageResponseTimeMs: number | null;
}

const AvgResponseTimeDisplay: React.FC<Props> = ({ averageResponseTimeMs }) => {
    const displayTime = averageResponseTimeMs !== null ? `${averageResponseTimeMs.toFixed(0)} ms` : 'Loading...';
    return (
        <div>
            <h3>Avg. Response Time</h3>
            <p>{displayTime}</p>
        </div>
    );
};

export default AvgResponseTimeDisplay; 