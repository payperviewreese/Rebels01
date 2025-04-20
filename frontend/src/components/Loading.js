import React, { useState, useEffect } from 'react';

const Loading = ({ gameEvents }) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!gameEvents) return;

    const handleLoadingProgress = (value) => {
      setProgress(value);
    };

    const handleLoadingComplete = () => {
      // Keep the loading screen visible for a bit longer
      setTimeout(() => {
        setVisible(false);
      }, 1000);
    };

    // Subscribe to events
    gameEvents.on('loadingProgress', handleLoadingProgress);
    gameEvents.on('loadingComplete', handleLoadingComplete);

    // Clean up
    return () => {
      gameEvents.off('loadingProgress', handleLoadingProgress);
      gameEvents.off('loadingComplete', handleLoadingComplete);
    };
  }, [gameEvents]);

  if (!visible) return null;

  return (
    <div className="loading-screen">
      <div className="game-title">REBELS OF THE UNDEAD</div>
      <div>Loading game assets...</div>
      <div className="loading-bar-container">
        <div 
          className="loading-bar" 
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
};

export default Loading;
