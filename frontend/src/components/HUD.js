import React, { useState, useEffect, useRef } from 'react';

const HUD = ({ gameEvents }) => {
  const [health, setHealth] = useState(100);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [interactPrompt, setInteractPrompt] = useState({
    visible: false,
    name: ''
  });
  const miniMapRef = useRef(null);

  useEffect(() => {
    if (!gameEvents) return;

    const handleGameStarted = (data) => {
      setHealth(data.health);
    };

    const handleHealthUpdate = (data) => {
      setHealth(data.health);
    };

    const handlePlayerMove = (data) => {
      setPlayerPosition({ x: data.x, y: data.y });
      updateMiniMap(data.x, data.y);
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
    gameEvents.on('playerMove', handlePlayerMove);
    gameEvents.on('showInteractPrompt', handleShowInteractPrompt);
    gameEvents.on('hideInteractPrompt', handleHideInteractPrompt);

    // Clean up
    return () => {
      gameEvents.off('gameStarted', handleGameStarted);
      gameEvents.off('updateHealth', handleHealthUpdate);
      gameEvents.off('playerMove', handlePlayerMove);
      gameEvents.off('showInteractPrompt', handleShowInteractPrompt);
      gameEvents.off('hideInteractPrompt', handleHideInteractPrompt);
    };
  }, [gameEvents]);

  // Function to update mini-map
  const updateMiniMap = (playerX, playerY) => {
    if (!miniMapRef.current) return;
    
    const ctx = miniMapRef.current.getContext('2d');
    const mapWidth = miniMapRef.current.width;
    const mapHeight = miniMapRef.current.height;
    
    // Clear canvas
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, mapWidth, mapHeight);
    
    // Draw world boundaries
    ctx.strokeStyle = '#555';
    ctx.strokeRect(0, 0, mapWidth, mapHeight);
    
    // Scale player position to mini-map (3000x3000 game world to 150x150 mini-map)
    const scaledX = (playerX / 3000) * mapWidth;
    const scaledY = (playerY / 3000) * mapHeight;
    
    // Draw locations from the game world
    drawLocation(ctx, 100, 100, 300, 200, '#555', 'Pharmacy', mapWidth, mapHeight);
    drawLocation(ctx, 500, 100, 350, 250, '#777', 'Hardware', mapWidth, mapHeight);
    drawLocation(ctx, 100, 400, 400, 300, '#666', 'School', mapWidth, mapHeight);
    drawLocation(ctx, 600, 450, 350, 350, '#888', 'Shop', mapWidth, mapHeight);
    drawLocation(ctx, 1000, 200, 300, 400, '#999', 'Zoo', mapWidth, mapHeight);
    drawLocation(ctx, 1100, 700, 250, 150, '#444', 'Pier', mapWidth, mapHeight);
    
    // Draw player position
    ctx.fillStyle = '#0f0';
    ctx.beginPath();
    ctx.arc(scaledX, scaledY, 3, 0, Math.PI * 2);
    ctx.fill();
  };
  
  // Helper function to draw a location on the mini-map
  const drawLocation = (ctx, x, y, width, height, color, name, mapWidth, mapHeight) => {
    // Scale coordinates to mini-map
    const scaledX = (x / 3000) * mapWidth;
    const scaledY = (y / 3000) * mapHeight;
    const scaledWidth = (width / 3000) * mapWidth;
    const scaledHeight = (height / 3000) * mapHeight;
    
    // Draw location rectangle
    ctx.fillStyle = color;
    ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
  };

  return (
    <>
      {/* Health bar */}
      <div className="health-bar">
        <div 
          className="health-fill" 
          style={{ width: `${health}%` }}
        />
      </div>
      
      {/* Interaction prompt */}
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
      
      {/* Mini-map */}
      <div className="mini-map">
        <div>MAP</div>
        <canvas 
          ref={miniMapRef} 
          width={140} 
          height={120}
          style={{
            marginTop: '5px',
            border: '1px solid #333'
          }}
        />
      </div>
    </>
  );
};

export default HUD;
