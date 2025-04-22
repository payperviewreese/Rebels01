export default class SplashScene extends Phaser.Scene {
  constructor() {
    super('SplashScene');
  }

  preload() {
    // Load the splash screen background image
    this.load.image('title_bg', 'assets/title_bg.png');
  }

  create() {
    const { width, height } = this.scale;

    // Set the background image full screen
    this.add.image(width / 2, height / 2, 'title_bg')
      .setOrigin(0.5)
      .setDisplaySize(width, height);

    // Add title text overlay
    this.add.text(width / 2, height * 0.2, 'REBELS OF THE UNDEAD', {
      fontFamily: 'Impact',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Create a styled "Start Game" button
    const startButton = this.add.text(width / 2, height * 0.75, '▶ START GAME', {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      backgroundColor: '#8B0000',
      padding: { x: 20, y: 10 },
      color: '#ffffff',
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerover', () => startButton.setStyle({ backgroundColor: '#a50000' }))
    .on('pointerout', () => startButton.setStyle({ backgroundColor: '#8B0000' }))
    .on('pointerdown', () => {
      this.scene.start('MainScene'); // 🔁 Replace with your actual game scene name
    });
  }
}
