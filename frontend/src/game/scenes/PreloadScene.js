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
    // Character assets
    this.load.spritesheet('player', 'https://placehold.co/192x128/888888/ffffff.png?text=Player', { 
      frameWidth: 32, 
      frameHeight: 32 
    });
    
    this.load.spritesheet('zombie', 'https://placehold.co/192x128/ff0000/ffffff.png?text=Zombie', { 
      frameWidth: 32, 
      frameHeight: 32 
    });
    
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
    // Create animations
    this.createAnimations();
    
    // Start the game
    this.scene.start('MainScene');
  }

  createAnimations() {
    // Player animations
    this.anims.create({
      key: 'player_idle_down',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player_walk_down',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player_idle_up',
      frames: this.anims.generateFrameNumbers('player', { start: 3, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player_walk_up',
      frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player_idle_right',
      frames: this.anims.generateFrameNumbers('player', { start: 6, end: 6 }),
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player_walk_right',
      frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player_idle_left',
      frames: this.anims.generateFrameNumbers('player', { start: 9, end: 9 }),
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player_walk_left',
      frames: this.anims.generateFrameNumbers('player', { start: 9, end: 11 }),
      frameRate: 10,
      repeat: -1
    });

    // Zombie animations
    this.anims.create({
      key: 'zombie_walk',
      frames: this.anims.generateFrameNumbers('zombie', { start: 0, end: 2 }),
      frameRate: 5,
      repeat: -1
    });
  }
}

export default PreloadScene;
