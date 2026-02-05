import Phaser from 'phaser';
import { GameState } from '../core/GameState';

interface Crop {
  sprite: Phaser.GameObjects.Sprite;
  stage: number;
  growthTime: number;
  maxStage: number;
  x: number;
  y: number;
}

export class FarmSystem {
  scene: Phaser.Scene;
  gameState: GameState;
  farmlands: Map<string, Phaser.GameObjects.Sprite> = new Map();
  crops: Map<string, Crop> = new Map();
  growthInterval: number = 5000; // 5秒生长一阶段

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameState = GameState.getInstance();
  }

  private getKey(x: number, y: number): string {
    const gridX = Math.floor(x / 32) * 32;
    const gridY = Math.floor(y / 32) * 32;
    return `${gridX},${gridY}`;
  }

  createFarmland(x: number, y: number): boolean {
    const key = this.getKey(x, y);
    
    if (this.farmlands.has(key)) return false;

    const gridX = Math.floor(x / 32) * 32 + 16;
    const gridY = Math.floor(y / 32) * 32 + 16;

    const farmland = this.scene.add.sprite(gridX, gridY, 'farmland');
    farmland.setDepth(1);
    this.farmlands.set(key, farmland);

    return true;
  }

  interact(x: number, y: number): boolean {
    const key = this.getKey(x, y);

    // 如果有农田
    if (this.farmlands.has(key)) {
      // 如果有作物
      if (this.crops.has(key)) {
        return this.harvestCrop(key);
      } else {
        return this.plantCrop(key);
      }
    }

    return false;
  }

  plantCrop(key: string): boolean {
    if (!this.gameState.spendResource('seeds', 1)) {
      return false;
    }

    const [x, y] = key.split(',').map(Number);
    const sprite = this.scene.add.sprite(x + 16, y + 16, 'crop_0');
    sprite.setDepth(2);

    this.crops.set(key, {
      sprite,
      stage: 0,
      growthTime: 0,
      maxStage: 3,
      x: x + 16,
      y: y + 16
    });

    return true;
  }

  harvestCrop(key: string): boolean {
    const crop = this.crops.get(key);
    if (!crop || crop.stage < crop.maxStage) return false;

    // 收获奖励
    this.gameState.addResource('gold', 10 + Math.floor(Math.random() * 10));
    this.gameState.addResource('seeds', Math.random() > 0.5 ? 2 : 1);

    // 收获动画
    this.scene.tweens.add({
      targets: crop.sprite,
      y: crop.y - 20,
      alpha: 0,
      duration: 300,
      onComplete: () => crop.sprite.destroy()
    });

    this.crops.delete(key);
    return true;
  }

  update() {
    const delta = this.scene.game.loop.delta;

    this.crops.forEach((crop, key) => {
      if (crop.stage >= crop.maxStage) return;

      crop.growthTime += delta;

      if (crop.growthTime >= this.growthInterval) {
        crop.growthTime = 0;
        crop.stage++;
        crop.sprite.setTexture(`crop_${crop.stage}`);

        // 生长动画
        this.scene.tweens.add({
          targets: crop.sprite,
          scaleY: 1.1,
          duration: 200,
          yoyo: true
        });
      }
    });
  }
}
