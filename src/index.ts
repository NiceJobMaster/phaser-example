import * as Phaser from 'phaser';
import Scenes from './scenes';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: Scenes,
};

export const game = new Phaser.Game(config);

window.addEventListener('resize', () => {
  return game.scale.resize(window.innerWidth, window.innerHeight);
});
