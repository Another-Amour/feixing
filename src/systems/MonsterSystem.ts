import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { GameState } from '../core/GameState';

interface Monster {
  sprite: Phaser.Physics.Arcade.Sprite;
  health: number;
  maxHealth: number;
  attack: number;
  speed: number;
  dropGold: number;
}

export class MonsterSystem {
  scene: Phaser.Scene;
  gameState: GameState;
  monsters: Phaser.Physics.Arcade.Sprite[] = [];
  monsterData: Map<Phaser.Physics.Arcade.Sprite, Monster> = new Map();
  spawnTimer: number = 0;
  spawnInterval: number = 10000; // 10秒生成一只

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameState = GameState.getInstance();
  }

  spawnMonster() {
    // 在地图边缘随机生成
    const side = Phaser.Math.Between(0, 3);
    let x: number, y: number;

    switch (side) {
      case 0: x = Phaser.Math.Between(0, 800); y = -20; break;
      case 1: x = 820; y = Phaser.Math.Between(0, 600); break;
      case 2: x = Phaser.Math.Between(0, 800); y = 620; break;
      default: x = -20; y = Phaser.Math.Between(0, 600);
    }

    const sprite = this.scene.physics.add.sprite(x, y, 'monster');
    sprite.setDepth(8);

    const monster: Monster = {
      sprite,
      health: 30,
      maxHealth: 30,
      attack: 5,
      speed: 30,
      dropGold: Phaser.Math.Between(5, 15)
    };

    this.monsterData.set(sprite, monster);
    this.monsters.push(sprite);

    // 监听伤害事件
    sprite.on('damage', (amount: number) => {
      this.damageMonster(sprite, amount);
    });

    return monster;
  }

  damageMonster(sprite: Phaser.Physics.Arcade.Sprite, amount: number) {
    const monster = this.monsterData.get(sprite);
    if (!monster) return;

    monster.health -= amount;

    // 显示伤害数字
    const dmgText = this.scene.add.text(sprite.x, sprite.y - 20, `-${amount}`, {
      fontSize: '12px',
      color: '#ff0000'
    }).setDepth(100);

    this.scene.tweens.add({
      targets: dmgText,
      y: sprite.y - 40,
      alpha: 0,
      duration: 800,
      onComplete: () => dmgText.destroy()
    });

    if (monster.health <= 0) {
      this.killMonster(sprite);
    }
  }

  killMonster(sprite: Phaser.Physics.Arcade.Sprite) {
    const monster = this.monsterData.get(sprite);
    if (!monster) return;

    // 掉落金币
    this.gameState.addResource('gold', monster.dropGold);

    // 死亡动画
    this.scene.tweens.add({
      targets: sprite,
      alpha: 0,
      scale: 0,
      duration: 300,
      onComplete: () => {
        sprite.destroy();
        this.monsters = this.monsters.filter(m => m !== sprite);
        this.monsterData.delete(sprite);
      }
    });

    // 经验/掉落事件
    this.scene.events.emit('monsterKilled', monster);
  }

  update(player: Player) {
    const delta = this.scene.game.loop.delta;

    // 生成计时
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval && this.monsters.length < 5) {
      this.spawnTimer = 0;
      this.spawnMonster();
    }

    // 怪物AI - 追踪玩家
    const playerPos = player.getPosition();

    this.monsters.forEach(sprite => {
      const monster = this.monsterData.get(sprite);
      if (!monster) return;

      const angle = Phaser.Math.Angle.Between(
        sprite.x, sprite.y,
        playerPos.x, playerPos.y
      );

      sprite.setVelocity(
        Math.cos(angle) * monster.speed,
        Math.sin(angle) * monster.speed
      );

      // 攻击检测
      const dist = Phaser.Math.Distance.Between(
        sprite.x, sprite.y,
        playerPos.x, playerPos.y
      );

      if (dist < 20) {
        player.takeDamage(monster.attack * delta / 1000);
      }
    });
  }
}
