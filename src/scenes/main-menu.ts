import GameScene from './game-scene';

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenu' });
  }

  public preload() {
    this.load.image('logo', 'src/assets/logo.png');
  }

  public create() {
    const x = this.cameras.main.width / 2;
    const y = this.cameras.main.height / 2;

    this.add.image(x, y - 165, 'logo');

    const styleText = {
      fontSize: '50px',
      fill: '#fff',
      fontFamily: 'Roboto',
    };

    const styleSmallText = {
      ...styleText,
      fontSize: '24px',
    };

    const startButton = this.add.text(x, y + 160, 'START', styleText).setOrigin(0.5, 0.5);

    this.add
      .zone(
        startButton.x - startButton.width * startButton.originX - 16,
        startButton.y - startButton.height * startButton.originY - 16,
        startButton.width + 32,
        startButton.height + 32,
      )
      .setOrigin(0, 0)
      .setInteractive()
      .once('pointerup', () => this.scene.start('GameScene'));

    const { highScore } = this.scene.get('GameScene') as GameScene;
    this.add.text(x, y + 60, 'HIGH SCORE', styleSmallText).setOrigin(0.5, 0.5);
    this.add.text(x, y + 90, `${highScore} POINTS`, styleSmallText).setOrigin(0.5, 0.5);
  }
}
