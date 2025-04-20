import Phaser from 'phaser';

class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
    this.loadingComplete = false;
  }

  preload() {
    // Create loading bar UI in React
    if (window.gameEvents) {
      window.gameEvents.emit('loadingStarted');
    }

    // Update the loading progress
    this.load.on('progress', (value) => {
      if (window.gameEvents) {
        window.gameEvents.emit('loadingProgress', value);
      }
    });

    this.load.on('complete', () => {
      this.loadingComplete = true;
      if (window.gameEvents) {
        window.gameEvents.emit('loadingComplete');
      }
    });

    // Load all game assets
    this.loadGameAssets();
  }

  loadGameAssets() {
    // Simple colored squares for characters to avoid WebGL issues
    this.load.image('player', 'https://placehold.co/32x32/00aa00/ffffff.png?text=Player');
    this.load.image('zombie', 'https://placehold.co/32x32/aa0000/ffffff.png?text=Zombie');
    
    // Tileset for the map
    this.load.image('tileset', 'https://placehold.co/512x512/555555/ffffff.png?text=Tilemap');
    
    // UI elements
    this.load.image('inventoryIcon', 'https://placehold.co/32x32/ffffff/000000.png?text=Inv');
    
    // Weapons and items
    this.load.image('bat', 'https://placehold.co/32x32/886644/ffffff.png?text=Bat');
    this.load.image('medkit', 'https://placehold.co/32x32/ff0000/ffffff.png?text=Med');
    this.load.image('key', 'https://placehold.co/32x32/ffff00/000000.png?text=Key');
    this.load.image('boltCutters', 'https://placehold.co/32x32/0000ff/ffffff.png?text=Tool');
  }

  create() {
    // Start the game
    this.scene.start('MainScene');
  }
}

export default PreloadScene;
