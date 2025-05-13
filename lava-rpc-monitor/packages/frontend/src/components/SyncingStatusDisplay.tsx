import React from 'react';
import type { EthSyncingResultObject } from '../types/apiTypes'; // Assuming apiTypes.ts is in src/types/

interface SyncingStatusDisplayProps {
  syncingStatus: EthSyncingResultObject | false | null;
}

const SyncingStatusDisplay: React.FC<SyncingStatusDisplayProps> = ({ syncingStatus }) => {
  const renderStatus = () => {
    if (syncingStatus === null || syncingStatus === undefined) {
      return <p>Syncing Status: N/A</p>;
    }
    if (syncingStatus === false) {
      return <p>Status: Synced</p>;
    }
    // It's an EthSyncingResultObject
    const currentBlock = parseInt(syncingStatus.currentBlock, 16);
    const highestBlock = parseInt(syncingStatus.highestBlock, 16);
    const startingBlock = parseInt(syncingStatus.startingBlock, 16);

    let progressMessage = `Syncing (Block: ${isNaN(currentBlock) ? 'N/A' : currentBlock} / ${isNaN(highestBlock) ? 'N/A' : highestBlock})`;
    if (!isNaN(startingBlock)) {
        progressMessage += ` from ${startingBlock}`;
    }

    let progressBar = null;
    if (!isNaN(currentBlock) && !isNaN(highestBlock) && highestBlock > 0 && currentBlock >= startingBlock) {
      // Ensure currentBlock is not greater than highestBlock for percentage calculation
      const effectiveCurrentBlock = Math.min(currentBlock, highestBlock);
      const totalBlocksToSync = highestBlock - startingBlock;
      const syncedBlocks = effectiveCurrentBlock - startingBlock;
      
      // Avoid division by zero or negative progress if startingBlock is equal to or greater than highestBlock
      const percentage = (totalBlocksToSync > 0 && syncedBlocks >=0) 
                         ? Math.min(100, Math.max(0, (syncedBlocks / totalBlocksToSync) * 100)) 
                         : (effectiveCurrentBlock >= highestBlock ? 100 : 0); // If at or past highest, 100%, else 0 if no valid range

      progressBar = (
        <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '4px', marginTop: '8px', height: '12px' }}>
          <div 
            style={{
              width: `${percentage}%`, 
              backgroundColor: '#4caf50', 
              height: '12px', 
              borderRadius: '4px', 
              transition: 'width 0.5s ease-in-out' 
            }}
          >
            <span style={{fontSize: '10px', color: 'white', paddingLeft: '4px'}}>{`${percentage.toFixed(0)}%`}</span>
          </div>
        </div>
      );
    }

    return (
      <React.Fragment>
        <p style={{ margin: '0 0 5px 0' }}>{progressMessage}</p>
        {progressBar}
      </React.Fragment>
    );
  };

  return (
    <div>
      <h3>Node Sync Status</h3>
      {renderStatus()}
    </div>
  );
};

export default SyncingStatusDisplay; 