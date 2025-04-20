import Phaser from 'phaser';

// Game configuration
const config = {
  type: Phaser.CANVAS, // Use Canvas instead of WebGL for better compatibility
  width: 800,
  height: 600,
  parent: 'phaser-game',
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
  backgroundColor: '#000000',
  render: {
    pixelArt: true,
    antialias: false
  }
};

export default config;
