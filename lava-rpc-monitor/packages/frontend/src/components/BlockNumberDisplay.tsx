import React from 'react';

interface Props {
    blockNumber: number | null;
}

const BlockNumberDisplay: React.FC<Props> = ({ blockNumber }) => {
    return (
        <div>
            <h3>Latest Block Number</h3>
            <p>{blockNumber !== null ? blockNumber : 'Loading...'}</p>
        </div>
    );
};

export default BlockNumberDisplay; 