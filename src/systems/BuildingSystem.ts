import Phaser from 'phaser';
import { GameState } from '../core/GameState';

interface BuildingConfig {
  texture: string;
  cost: { wood: number; stone: number; gold: number };
  size: { width: number; height: number };
  effect?: () => void;
}

interface Building {
  sprite: Phaser.GameObjects.Sprite;
  type: string;
  x: number;
  y: number;
}

export class BuildingSystem {
  scene: Phaser.Scene;
  gameState: GameState;
  buildings: Building[] = [];
  
  buildingConfigs: Record<string, BuildingConfig> = {
    house: {
      texture: 'house',
      cost: { wood: 20, stone: 10, gold: 50 },
      size: { width: 64, height: 64 }
    },
    barn: {
      texture: 'house', // 复用贴图，实际项目中应有独立贴图
      cost: { wood: 30, stone: 15, gold: 80 },
      size: { width: 96, height: 64 }
    },
    shop: {
      texture: 'house',
      cost: { wood: 25, stone: 20, gold: 100 },
      size: { width: 64, height: 64 }
    }
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameState = GameState.getInstance();
  }

  canAfford(type: string): boolean {
    const config = this.buildingConfigs[type];
    if (!config) return false;

    const { cost } = config;
    const res = this.gameState.resources;

    return res.wood >= cost.wood && 
           res.stone >= cost.stone && 
           res.gold >= cost.gold;
  }

  placeBuilding(x: number, y: number, type: string): boolean {
    const config = this.buildingConfigs[type];
    if (!config) return false;

    if (!this.canAfford(type)) {
      this.showMessage('资源不足！');
      return false;
    }

    // 检查是否有重叠
    const gridX = Math.floor(x / 32) * 32;
    const gridY = Math.floor(y / 32) * 32;

    for (const building of this.buildings) {
      const bConfig = this.buildingConfigs[building.type];
      if (this.checkOverlap(
        gridX, gridY, config.size.width, config.size.height,
        building.x, building.y, bConfig.size.width, bConfig.size.height
      )) {
        this.showMessage('位置被占用！');
        return false;
      }
    }

    // 扣除资源
    const { cost } = config;
    this.gameState.spendResource('wood', cost.wood);
    this.gameState.spendResource('stone', cost.stone);
    this.gameState.spendResource('gold', cost.gold);

    // 创建建筑
    const sprite = this.scene.add.sprite(
      gridX + config.size.width / 2,
      gridY + config.size.height / 2,
      config.texture
    );
    sprite.setDepth(5);

    // 建造动画
    sprite.setScale(0);
    this.scene.tweens.add({
      targets: sprite,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });

    this.buildings.push({
      sprite,
      type,
      x: gridX,
      y: gridY
    });

    return true;
  }

  checkOverlap(
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
  ): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  interact(x: number, y: number): boolean {
    for (const building of this.buildings) {
      const config = this.buildingConfigs[building.type];
      if (
        x >= building.x && x <= building.x + config.size.width &&
        y >= building.y && y <= building.y + config.size.height
      ) {
        this.onBuildingInteract(building);
        return true;
      }
    }
    return false;
  }

  onBuildingInteract(building: Building) {
    // 建筑交互逻辑
    switch (building.type) {
      case 'house':
        this.showMessage('这是你的家');
        break;
      case 'shop':
        this.scene.events.emit('openShop');
        break;
      case 'barn':
        this.scene.events.emit('openBarn');
        break;
    }
  }

  showMessage(text: string) {
    const msg = this.scene.add.text(400, 100, text, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    this.scene.tweens.add({
      targets: msg,
      alpha: 0,
      y: 80,
      duration: 1500,
      onComplete: () => msg.destroy()
    });
  }
}
