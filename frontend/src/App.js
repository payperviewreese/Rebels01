import React, { useEffect, useState } from 'react';
import Phaser from 'phaser';
import EventEmitter from 'events';
import './App.css';

// Game configuration and scenes
import config from './game/config';
import BootScene from './game/scenes/BootScene';
import PreloadScene from './game/scenes/PreloadScene';
import MainScene from './game/scenes/MainScene';

// UI components
import Loading from './components/Loading';
import Dialog from './components/Dialog';
import Inventory from './components/Inventory';
import HUD from './components/HUD';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [gameReady, setGameReady] = useState(false);
  const [gameEvents] = useState(new EventEmitter());

  useEffect(() => {
    // Make the event emitter available to the Phaser game
    window.gameEvents = gameEvents;
    
    // Initialize Phaser game
    const gameConfig = {
      ...config,
      scene: [BootScene, PreloadScene, MainScene]
    };
    
    // Create the game instance
    const game = new Phaser.Game(gameConfig);
    
    // Make the game instance globally available
    window.game = game;
    
    // Clean up
    return () => {
      game.destroy(true);
      delete window.game;
      delete window.gameEvents;
    };
  }, [gameEvents]);

  return (
    <div className="game-container">
      {/* Phaser game container */}
      <div id="phaser-game"></div>
      
      {/* UI overlay */}
      <div className="ui-overlay">
        <Loading gameEvents={gameEvents} />
        <Dialog gameEvents={gameEvents} />
        <Inventory gameEvents={gameEvents} />
        <HUD gameEvents={gameEvents} />
      </div>
    </div>
  );
}

export default App;
