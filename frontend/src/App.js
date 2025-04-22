import React, { useEffect, useState } from 'react';
import Phaser from 'phaser';
import EventEmitter from 'events';
import './App.css';

// Game configuration and scenes
import config from './game/config';
import SplashScene from './game/scenes/SplashScene';
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
  const [gameEvents] = useState(new EventEmitter());

  useEffect(() => {
    // Make the event emitter available globally
    window.gameEvents = gameEvents;

    // Create Phaser game config with all scenes, starting with SplashScene
    const gameConfig = {
      ...config,
      scene: [SplashScene, BootScene, PreloadScene, MainScene]
    };

    // Initialize the Phaser game
    const game = new Phaser.Game(gameConfig);
    window.game = game;

    // Clean up on unmount
    return () => {
      game.destroy(true);
      delete window.game;
      delete window.gameEvents;
    };
  }, [gameEvents]);

  return (
    <div className="game-container">
      {/* Phaser game mounts here */}
      <div id="phaser-game"></div>

      {/* UI overlay components */}
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
