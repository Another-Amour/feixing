import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { GameState, Pet } from '../core/GameState';

interface ActivePet {
  data: Pet;
  sprite: Phaser.Physics.Arcade.Sprite;
  followOffset: { x: number; y: number };
}

export class PetSystem {
  scene: Phaser.Scene;
  gameState: GameState;
  activePets: ActivePet[] = [];
  maxActivePets: number = 3;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameState = GameState.getInstance();

    // 监听新宠物
    this.gameState.on('petAdded', (pet: Pet) => {
      if (this.activePets.length < this.maxActivePets) {
        this.summonPet(pet);
      }
    });
  }

  summonPet(pet: Pet) {
    const sprite = this.scene.physics.add.sprite(400, 300, 'pet');
    sprite.setDepth(9);

    // 根据稀有度调整颜色
    const tints: Record<string, number> = {
      common: 0xffffff,
      rare: 0x60a5fa,
      epic: 0xa855f7,
      legendary: 0xfbbf24
    };
    sprite.setTint(tints[pet.rarity]);

    const offsetAngle = (this.activePets.length / this.maxActivePets) * Math.PI * 2;
    
    this.activePets.push({
      data: pet,
      sprite,
      followOffset: {
        x: Math.cos(offsetAngle) * 30,
        y: Math.sin(offsetAngle) * 30
      }
    });
  }

  dismissPet(petId: string) {
    const index = this.activePets.findIndex(p => p.data.id === petId);
    if (index !== -1) {
      this.activePets[index].sprite.destroy();
      this.activePets.splice(index, 1);
    }
  }

  update(player: Player) {
    const playerPos = player.getPosition();

    this.activePets.forEach(pet => {
      const targetX = playerPos.x + pet.followOffset.x;
      const targetY = playerPos.y + pet.followOffset.y;

      // 平滑跟随
      const dx = targetX - pet.sprite.x;
      const dy = targetY - pet.sprite.y;

      pet.sprite.setVelocity(dx * 3, dy * 3);

      // 轻微浮动动画
      pet.sprite.y += Math.sin(this.scene.time.now / 200) * 0.3;
    });
  }

  getPetStats(): { totalAttack: number; totalDefense: number } {
    return this.activePets.reduce(
      (acc, pet) => ({
        totalAttack: acc.totalAttack + pet.data.attack,
        totalDefense: acc.totalDefense + pet.data.defense
      }),
      { totalAttack: 0, totalDefense: 0 }
    );
  }

  feedPet(petId: string, expAmount: number) {
    const pet = this.activePets.find(p => p.data.id === petId);
    if (!pet) return;

    pet.data.exp += expAmount;

    // 升级检测
    const expNeeded = pet.data.level * 100;
    if (pet.data.exp >= expNeeded) {
      pet.data.exp -= expNeeded;
      pet.data.level++;
      pet.data.attack += 2;
      pet.data.defense += 1;

      // 升级特效
      this.scene.tweens.add({
        targets: pet.sprite,
        scale: 1.5,
        duration: 200,
        yoyo: true
      });

      this.scene.events.emit('petLevelUp', pet.data);
    }
  }
}
