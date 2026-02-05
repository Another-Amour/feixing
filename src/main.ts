import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PrologueScene } from './scenes/PrologueScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { BaseScene } from './scenes/BaseScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [BootScene, PrologueScene, GameScene, UIScene, BaseScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
