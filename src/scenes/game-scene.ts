const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  key: 'GameScene',
}

const width = window.innerWidth < 1300 ? 1325 : window.innerWidth
const height = window.innerHeight

export default class GameScene extends Phaser.Scene {
  public sky: Phaser.GameObjects.Image
  public platforms: Phaser.Physics.Arcade.StaticGroup
  public player: Phaser.Physics.Arcade.Sprite
  public cursors: Phaser.Types.Input.Keyboard.CursorKeys
  public stars: Phaser.Physics.Arcade.Group
  public score = 0
  public scoreText: Phaser.GameObjects.Text
  public bombs: Phaser.Physics.Arcade.Group
  public gameOver: boolean
  public gameOverText: Phaser.GameObjects.Text

  constructor() {
    super(sceneConfig)
  }

  public preload() {
    this.load.image('sky', 'src/assets/sky.png')
    this.load.image('ground', 'src/assets/platform.png')
    this.load.image('star', 'src/assets/star.png')
    this.load.image('bomb', 'src/assets/bomb.png')
    this.load.spritesheet('dude', 'src/assets/dude.png', {
      frameWidth: 32,
      frameHeight: 48,
    })
  }

  public create() {
    this.physics.world.bounds.width = width
    this.physics.world.bounds.height = height

    this.sky = this.add.image(0, 0, 'sky')
    this.sky.setOrigin(0, 0)
    this.sky.setDisplaySize(this.game.scale.width, this.game.scale.height)

    this.platforms = this.physics.add.staticGroup()
    const ground = this.platforms.create(
      0,
      height - 64,
      'ground'
    ) as Phaser.Physics.Arcade.Image
    ground.setOrigin(0.0)
    ground.setDisplaySize(width, ground.height * 2)
    ground.refreshBody()

    this.platforms.create(600, 400, 'ground')
    this.platforms.create(50, 250, 'ground')
    this.platforms.create(750, 220, 'ground')

    this.player = this.physics.add.sprite(100, 450, 'dude')
    this.player.setBounce(0.2)
    this.player.setCollideWorldBounds(true)

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    })

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20,
    })

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    })

    this.cursors = this.input.keyboard.createCursorKeys()

    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    })

    this.stars.children.iterate(child =>
      (child.body as Phaser.Physics.Arcade.Body).setBounceY(
        Phaser.Math.FloatBetween(0.4, 0.8)
      )
    )

    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#000',
      fontFamily: 'Roboto',
    })
    this.scoreText.setScrollFactor(0)

    this.bombs = this.physics.add.group()

    this.gameOverText = this.add.text(
      width / 2 - 100,
      height / 2 - 50,
      'Game Over!',
      { fontSize: '50px', fill: '#fff' }
    )
    this.gameOverText.setVisible(false)
    this.gameOverText.setScrollFactor(0)

    this.physics.add.collider(this.player, this.platforms)
    this.physics.add.collider(this.stars, this.platforms)
    this.physics.add.collider(this.bombs, this.platforms)

    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    )
    this.physics.add.overlap(this.player, this.bombs, this.hitBomb, null, this)
  }

  public update() {
    if (this.gameOver) {
      return
    }

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160)
      this.player.anims.play('left', true)
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160)
      this.player.anims.play('right', true)
    } else {
      this.player.setVelocityX(0)
      this.player.anims.play('turn')
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330)
    }
  }

  public collectStar(
    player: Phaser.Physics.Arcade.Sprite,
    star: Phaser.Physics.Arcade.Sprite
  ) {
    star.disableBody(true, true)

    this.score += 10
    this.scoreText.setText('Score: ' + this.score)

    if (this.stars.countActive(true) === 0) {
      this.stars.children.iterate((child: any) =>
        child.enableBody(true, child.x, 0, true, true)
      )
    }

    const x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400)
    const bomb = this.bombs.create(x, 16, 'bomb')
    bomb.setBounce(1)
    bomb.setCollideWorldBounds(true)
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
  }

  public hitBomb(player, bomb) {
    this.physics.pause()
    player.setTint(0xff0000)
    player.anims.play('turn')
    this.gameOver = true
    this.gameOverText.setVisible(true)
  }
}
