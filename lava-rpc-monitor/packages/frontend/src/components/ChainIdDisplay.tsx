import React from 'react';

interface Props {
    chainId: string | null;
}

const ChainIdDisplay: React.FC<Props> = ({ chainId }) => {
    return (
        <div>
            <h3>Chain ID</h3>
            <p>{chainId !== null ? chainId : 'Loading...'}</p>
        </div>
    );
};

export default ChainIdDisplay; 