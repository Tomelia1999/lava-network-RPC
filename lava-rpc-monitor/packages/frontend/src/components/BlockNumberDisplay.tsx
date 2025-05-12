import React from 'react';

interface Props {
    blockNumber: string | null; // Accept hex string or null
}

const BlockNumberDisplay: React.FC<Props> = ({ blockNumber }) => {
    // Convert hex string to decimal number for display, handle null
    const displayValue = blockNumber !== null 
        ? parseInt(blockNumber, 16) 
        : 'Loading...';

    // Check if conversion resulted in NaN (in case of invalid hex)
    const displayText = typeof displayValue === 'number' && !isNaN(displayValue) 
        ? displayValue.toString() 
        : (blockNumber === null ? 'Loading...' : 'Invalid');

    return (
        <div>
            <h3>Latest Block Number</h3>
            {/* Display the converted number or loading/invalid text */}
            <p>{displayText}</p>
        </div>
    );
};

export default BlockNumberDisplay; 