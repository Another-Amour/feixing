import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // 创建加载进度条
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x4ade80, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    // 生成临时像素素材
    this.createPlaceholderAssets();
  }

  createPlaceholderAssets() {
    // 玩家
    const playerGraphics = this.make.graphics({ x: 0, y: 0 });
    playerGraphics.fillStyle(0x4ade80);
    playerGraphics.fillRect(0, 0, 16, 24);
    playerGraphics.fillStyle(0xfbbf24);
    playerGraphics.fillRect(4, 2, 8, 8);
    playerGraphics.generateTexture('player', 16, 24);

    // 地块
    const tileGraphics = this.make.graphics({ x: 0, y: 0 });
    tileGraphics.fillStyle(0x65a30d);
    tileGraphics.fillRect(0, 0, 32, 32);
    tileGraphics.lineStyle(1, 0x4d7c0f);
    tileGraphics.strokeRect(0, 0, 32, 32);
    tileGraphics.generateTexture('grass', 32, 32);

    // 耕地
    const farmGraphics = this.make.graphics({ x: 0, y: 0 });
    farmGraphics.fillStyle(0x78350f);
    farmGraphics.fillRect(0, 0, 32, 32);
    farmGraphics.lineStyle(2, 0x92400e);
    for (let i = 0; i < 4; i++) {
      farmGraphics.lineBetween(0, 8 + i * 8, 32, 8 + i * 8);
    }
    farmGraphics.generateTexture('farmland', 32, 32);

    // 作物各阶段
    const cropColors = [0x84cc16, 0x65a30d, 0x4d7c0f, 0xfbbf24];
    cropColors.forEach((color, i) => {
      const cropGraphics = this.make.graphics({ x: 0, y: 0 });
      cropGraphics.fillStyle(color);
      const height = 8 + i * 6;
      cropGraphics.fillRect(14, 32 - height, 4, height);
      if (i > 0) {
        cropGraphics.fillRect(10, 32 - height + 4, 4, 4);
        cropGraphics.fillRect(18, 32 - height + 4, 4, 4);
      }
      cropGraphics.generateTexture(`crop_${i}`, 32, 32);
    });

    // 建筑
    const buildingGraphics = this.make.graphics({ x: 0, y: 0 });
    buildingGraphics.fillStyle(0x78716c);
    buildingGraphics.fillRect(0, 16, 64, 48);
    buildingGraphics.fillStyle(0xb91c1c);
    buildingGraphics.fillTriangle(32, 0, 0, 20, 64, 20);
    buildingGraphics.fillStyle(0x44403c);
    buildingGraphics.fillRect(24, 40, 16, 24);
    buildingGraphics.generateTexture('house', 64, 64);

    // 怪物
    const monsterGraphics = this.make.graphics({ x: 0, y: 0 });
    monsterGraphics.fillStyle(0xef4444);
    monsterGraphics.fillRect(0, 0, 20, 20);
    monsterGraphics.fillStyle(0xffffff);
    monsterGraphics.fillRect(4, 4, 4, 4);
    monsterGraphics.fillRect(12, 4, 4, 4);
    monsterGraphics.generateTexture('monster', 20, 20);

    // 宠物
    const petGraphics = this.make.graphics({ x: 0, y: 0 });
    petGraphics.fillStyle(0xfbbf24);
    petGraphics.fillCircle(8, 8, 8);
    petGraphics.fillStyle(0x000000);
    petGraphics.fillCircle(5, 6, 2);
    petGraphics.fillCircle(11, 6, 2);
    petGraphics.generateTexture('pet', 16, 16);

    // 资源
    const resourceTypes = [
      { name: 'wood', color: 0x92400e },
      { name: 'stone', color: 0x6b7280 },
      { name: 'gold', color: 0xfbbf24 }
    ];
    resourceTypes.forEach(({ name, color }) => {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(color);
      g.fillRect(0, 0, 16, 16);
      g.generateTexture(name, 16, 16);
    });

    // 卡牌
    const cardGraphics = this.make.graphics({ x: 0, y: 0 });
    cardGraphics.fillStyle(0xffffff);
    cardGraphics.fillRoundedRect(0, 0, 60, 80, 4);
    cardGraphics.fillStyle(0x6366f1);
    cardGraphics.fillRect(5, 5, 50, 40);
    cardGraphics.generateTexture('card', 60, 80);

    // 基地建筑贴图
    this.createBuildingTextures();
  }

  createBuildingTextures() {
    // 宠物小屋
    const petHouse = this.make.graphics({ x: 0, y: 0 });
    petHouse.fillStyle(0xfbbf24);
    petHouse.fillRect(10, 30, 76, 56);
    petHouse.fillStyle(0xf59e0b);
    petHouse.fillTriangle(48, 5, 5, 35, 91, 35);
    petHouse.fillStyle(0x78350f);
    petHouse.fillRect(35, 50, 26, 36);
    petHouse.fillStyle(0x60a5fa);
    petHouse.fillRect(15, 45, 15, 15);
    petHouse.fillRect(66, 45, 15, 15);
    petHouse.generateTexture('building_pet', 96, 96);

    // 农场
    const farm = this.make.graphics({ x: 0, y: 0 });
    farm.fillStyle(0x78350f);
    farm.fillRect(0, 40, 128, 56);
    farm.fillStyle(0x65a30d);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        farm.fillRect(10 + i * 30, 50 + j * 15, 20, 10);
      }
    }
    farm.fillStyle(0xdc2626);
    farm.fillRect(50, 10, 28, 35);
    farm.fillStyle(0x991b1b);
    farm.fillTriangle(64, 0, 45, 15, 83, 15);
    farm.generateTexture('building_farm', 128, 96);

    // 研究室
    const lab = this.make.graphics({ x: 0, y: 0 });
    lab.fillStyle(0x6b7280);
    lab.fillRect(10, 25, 76, 66);
    lab.fillStyle(0x4b5563);
    lab.fillRect(10, 25, 76, 10);
    lab.fillStyle(0x22d3ee);
    lab.fillRect(20, 45, 20, 25);
    lab.fillRect(56, 45, 20, 25);
    lab.fillStyle(0xa855f7);
    lab.fillCircle(48, 20, 12);
    lab.generateTexture('building_lab', 96, 96);

    // 工坊
    const workshop = this.make.graphics({ x: 0, y: 0 });
    workshop.fillStyle(0x92400e);
    workshop.fillRect(10, 30, 76, 60);
    workshop.fillStyle(0x78350f);
    workshop.fillTriangle(48, 10, 5, 35, 91, 35);
    workshop.fillStyle(0xfbbf24);
    workshop.fillRect(38, 55, 20, 35);
    workshop.fillStyle(0xf97316);
    workshop.fillCircle(25, 50, 8);
    workshop.generateTexture('building_workshop', 96, 96);

    // 招募所
    const recruit = this.make.graphics({ x: 0, y: 0 });
    recruit.fillStyle(0x1e40af);
    recruit.fillRect(10, 25, 76, 66);
    recruit.fillStyle(0x1e3a8a);
    recruit.fillRect(10, 25, 76, 15);
    recruit.fillStyle(0xfbbf24);
    recruit.fillRect(35, 50, 26, 41);
    recruit.fillStyle(0xffffff);
    recruit.fillCircle(30, 55, 8);
    recruit.fillCircle(66, 55, 8);
    recruit.generateTexture('building_recruit', 96, 96);
  }

  create() {
    this.scene.start('PrologueScene');
  }
}
