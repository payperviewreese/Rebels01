export default class SplashScene extends Phaser.Scene {
  constructor() {
    super('SplashScene');
  }

  create() {
    const { width, height } = this.scale;

    // Title
    this.add.text(width / 2, height / 2 - 100, 'Rebels of the Undead', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Start Button
    const startBtn = this.add.text(width / 2, height / 2, '▶ Start Game', {
      fontSize: '24px',
      fontFamily: 'Arial',
      backgroundColor: '#000',
      padding: { x: 15, y: 10 },
      color: '#ffffff',
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('MainScene'); // Change to your actual main game scene name
      });
  }
}
