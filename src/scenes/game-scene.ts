import sky from '../assets/sky.png'
import platform from '../assets/platform.png'
import star from '../assets/star.png'
import bomb from '../assets/bomb.png'
import dude from '../assets/dude.png'

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  key: 'GameScene',
};

const width = window.innerWidth < 1300 ? 1300 : window.innerWidth;
const height = window.innerHeight < 600 ? 600 : window.innerHeight;

export default class GameScene extends Phaser.Scene {
  public sky: Phaser.GameObjects.Image;
  public platforms: Phaser.Physics.Arcade.StaticGroup;
  public player: Phaser.Physics.Arcade.Sprite;
  public cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  public stars: Phaser.Physics.Arcade.Group;
  public score = 0;
  public highScore = 0;
  public scoreText: Phaser.GameObjects.Text;
  public bombs: Phaser.Physics.Arcade.Group;
  public gameOver: boolean;
  public gameOverText: Phaser.GameObjects.Text;
  public gameOverZone: Phaser.GameObjects.Zone;

  constructor() {
    super(sceneConfig);
  }

  public preload() {
    this.load.image('sky', sky);
    this.load.image('ground', platform);
    this.load.image('star', star);
    this.load.image('bomb', bomb);
    this.load.spritesheet('dude', dude, {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  public create() {
    this.physics.world.bounds.width = width;
    this.physics.world.bounds.height = height;

    this.sky = this.add.image(0, 0, 'sky');
    this.sky.setOrigin(0, 0);
    this.sky.setDisplaySize(width, height);

    this.platforms = this.physics.add.staticGroup();
    const ground = this.platforms.create(0, height - 64, 'ground') as Phaser.Physics.Arcade.Image;
    ground.setOrigin(0.0);
    ground.setDisplaySize(width, ground.height * 2);
    ground.refreshBody();

    this.platforms.create(600, height - 325, 'ground');
    this.platforms.create(50, height - 475, 'ground');
    this.platforms.create(750, height - 580, 'ground');

    this.player = this.physics.add.sprite(100, height / 2 + 48, 'dude');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.stars = this.physics.add.group({
      key: 'star',
      repeat: Math.round(width / 70),
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    // this.stars.children.iterate(child =>
    //   (child.body as Phaser.Physics.Arcade.Body).setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)),
    // );

    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      // fill: '#000',
      fontFamily: 'Roboto',
    });
    this.scoreText.setScrollFactor(0);

    this.bombs = this.physics.add.group();

    this.gameOverText = this.add.text(window.innerWidth / 2, window.innerHeight / 2, 'Game Over!', {
      fontSize: '50px',
      // fill: '#fff',
      fontFamily: 'Roboto',
    });

    this.gameOverText.setOrigin(0.5, 0.5);
    this.gameOverText.setVisible(false);
    this.gameOverText.setScrollFactor(0);

    this.gameOverZone = this.add
      .zone(
        this.gameOverText.x - this.gameOverText.width * this.gameOverText.originX - 16,
        this.gameOverText.y - this.gameOverText.height * this.gameOverText.originY - 16,
        this.gameOverText.width + 32,
        this.gameOverText.height + 32,
      )
      .setOrigin(0, 0)
      .setInteractive()
      .once('pointerup', () => this.scene.start('MainMenu'))
      .setVisible(false);

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.bombs, this.platforms);

    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
    this.physics.add.overlap(this.player, this.bombs, this.hitBomb, null, this);
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.startFollow(this.player, true);
  }

  public update() {
    if (this.gameOver) {
      return;
    }

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-450);
    }
  }

  public collectStar(player: Phaser.Physics.Arcade.Sprite, star: Phaser.Physics.Arcade.Sprite) {
    star.disableBody(true, true);

    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // if (this.stars.countActive(true) === 0) {
    //   this.stars.children.iterate((child: Phaser.Physics.Arcade.Sprite) =>
    //     child.enableBody(true, child.body.x, 0, true, true),
    //   );
    // }

    const x = player.x < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    const bomb = this.bombs.create(x, 16, 'bomb') as Phaser.Physics.Arcade.Sprite;
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }

  public hitBomb(player: Phaser.Physics.Arcade.Sprite, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    this.gameOver = true;
    this.gameOverText.setVisible(true);
    this.gameOverZone.setVisible(true);
    if (this.highScore < this.score) {
      this.highScore = this.score;
    }
  }
}
