import React from 'react';

interface Props {
    successRate: number | null;
    errorMessages: string[];
}

const StatusIndicator: React.FC<Props> = ({ successRate, errorMessages }) => {
    const errorCount = errorMessages ? errorMessages.length : 0;
    let statusText = 'Loading...';
    let color = 'grey';

    if (successRate !== null) {
        if (successRate >= 0.98 && errorCount === 0) {
            statusText = 'Healthy';
            color = '#4CAF50'; // Green
        } else if (successRate >= 0.90) {
            statusText = 'Warning';
            color = '#FFC107'; // Amber
        } else {
            statusText = 'Error';
            color = '#F44336'; // Red
        }
    } else if (errorCount > 0) { // Show error if we have errors but no success rate yet
         statusText = 'Error';
         color = '#F44336'; // Red
    }

    const indicatorStyle: React.CSSProperties = {
        display: 'inline-block',
        width: '15px',
        height: '15px',
        backgroundColor: color,
        borderRadius: '50%',
        marginRight: '8px',
        verticalAlign: 'middle'
    };

    return (
        <div>
            <h3>Overall Status</h3>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={indicatorStyle}></span>
                <p style={{ margin: 0 }}>{statusText}</p>
            </div>
        </div>
    );
};

export default StatusIndicator; 