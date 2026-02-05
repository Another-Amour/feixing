import Phaser from 'phaser';

export class Player {
  scene: Phaser.Scene;
  sprite: Phaser.Physics.Arcade.Sprite;
  health: number = 100;
  maxHealth: number = 100;
  attackPower: number = 10;
  attackRange: number = 40;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
  }

  move(vx: number, vy: number) {
    this.sprite.setVelocity(vx, vy);

    // 简单的朝向
    if (vx < 0) this.sprite.setFlipX(true);
    else if (vx > 0) this.sprite.setFlipX(false);
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  attack(targets: Phaser.Physics.Arcade.Sprite[]) {
    const pos = this.getPosition();
    
    targets.forEach(target => {
      const dist = Phaser.Math.Distance.Between(
        pos.x, pos.y,
        target.x, target.y
      );

      if (dist <= this.attackRange) {
        // 触发攻击效果
        this.scene.tweens.add({
          targets: target,
          alpha: 0.5,
          duration: 100,
          yoyo: true
        });

        // 发送伤害事件
        target.emit('damage', this.attackPower);
      }
    });

    // 攻击动画
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.2,
      scaleY: 0.8,
      duration: 100,
      yoyo: true
    });
  }

  takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount);
    
    this.scene.tweens.add({
      targets: this.sprite,
      tint: 0xff0000,
      duration: 100,
      onComplete: () => this.sprite.clearTint()
    });

    if (this.health <= 0) {
      this.scene.events.emit('playerDeath');
    }
  }

  heal(amount: number) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }
}
