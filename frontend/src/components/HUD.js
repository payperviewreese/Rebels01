import React, { useState, useEffect } from 'react';

const HUD = ({ gameEvents }) => {
  const [health, setHealth] = useState(100);
  const [interactPrompt, setInteractPrompt] = useState({
    visible: false,
    name: ''
  });

  useEffect(() => {
    if (!gameEvents) return;

    const handleGameStarted = (data) => {
      setHealth(data.health);
    };

    const handleHealthUpdate = (data) => {
      setHealth(data.health);
    };

    const handleShowInteractPrompt = (data) => {
      setInteractPrompt({
        visible: true,
        name: data.name
      });
    };

    const handleHideInteractPrompt = () => {
      setInteractPrompt({
        visible: false,
        name: ''
      });
    };

    // Subscribe to events
    gameEvents.on('gameStarted', handleGameStarted);
    gameEvents.on('updateHealth', handleHealthUpdate);
    gameEvents.on('showInteractPrompt', handleShowInteractPrompt);
    gameEvents.on('hideInteractPrompt', handleHideInteractPrompt);

    // Clean up
    return () => {
      gameEvents.off('gameStarted', handleGameStarted);
      gameEvents.off('updateHealth', handleHealthUpdate);
      gameEvents.off('showInteractPrompt', handleShowInteractPrompt);
      gameEvents.off('hideInteractPrompt', handleHideInteractPrompt);
    };
  }, [gameEvents]);

  return (
    <>
      <div className="health-bar">
        <div 
          className="health-fill" 
          style={{ width: `${health}%` }}
        />
      </div>
      
      {interactPrompt.visible && (
        <div 
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '5px 15px',
            borderRadius: '5px'
          }}
        >
          Press E to interact with {interactPrompt.name}
        </div>
      )}
    </>
  );
};

export default HUD;
