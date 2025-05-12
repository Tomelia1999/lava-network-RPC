import React from 'react';

interface Props {
    successRate: number | null;
}

const SuccessRateDisplay: React.FC<Props> = ({ successRate }) => {
    const displayRate = successRate !== null ? (successRate * 100).toFixed(2) + '%' : 'Loading...';
    return (
        <div>
            <h3>Success Rate</h3>
            <p>{displayRate}</p>
        </div>
    );
};

export default SuccessRateDisplay; 