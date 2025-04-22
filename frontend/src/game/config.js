import Phaser from 'phaser';
import SplashScene from './scenes/SplashScene';
import MainScene from './scenes/MainScene';

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'phaser-game',
  backgroundColor: '#000000',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: {
    pixelArt: true,
    antialias: false
  },
  scene: [MainScene] // SplashScene loads first
};

const game = new Phaser.Game(config);

export default config;
