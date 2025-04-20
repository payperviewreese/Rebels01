import Phaser from 'phaser';

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Load necessary assets for the loading screen
    this.load.image('logo', 'https://placehold.co/200x100/ff5500/ffffff.png?text=Rebels+of+the+Undead');
    
    // Display loading text
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Loading text
    this.loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  create() {
    this.scene.start('PreloadScene');
  }
}

export default BootScene;
