import Phaser from 'phaser';
import { GameState, BaseBuilding, Talent } from '../core/GameState';

interface BuildingConfig {
  name: string;
  description: string;
  texture: string;
  size: { width: number; height: number };
  cost: { wood: number; stone: number; gold: number };
  unlockLevel: number;
}

export class BaseScene extends Phaser.Scene {
  gameState!: GameState;
  buildingConfigs: Record<string, BuildingConfig> = {
    petHouse: {
      name: '宠物小屋',
      description: '培养和强化宠物的地方',
      texture: 'building_pet',
      size: { width: 96, height: 96 },
      cost: { wood: 30, stone: 20, gold: 100 },
      unlockLevel: 1
    },
    farm: {
      name: '农场',
      description: '种植作物，生产食物',
      texture: 'building_farm',
      size: { width: 128, height: 96 },
      cost: { wood: 40, stone: 10, gold: 80 },
      unlockLevel: 1
    },
    lab: {
      name: '研究室',
      description: '研究强化药剂和宠物装备',
      texture: 'building_lab',
      size: { width: 96, height: 96 },
      cost: { wood: 50, stone: 40, gold: 200 },
      unlockLevel: 2
    },
    workshop: {
      name: '工坊',
      description: '制作装备和道具',
      texture: 'building_workshop',
      size: { width: 96, height: 96 },
      cost: { wood: 60, stone: 50, gold: 150 },
      unlockLevel: 2
    },
    recruitCenter: {
      name: '招募所',
      description: '招募人才帮助管理基地',
      texture: 'building_recruit',
      size: { width: 96, height: 96 },
      cost: { wood: 35, stone: 25, gold: 120 },
      unlockLevel: 1
    }
  };

  selectedBuilding: string | null = null;
  buildMode: boolean = false;
  buildPreview: Phaser.GameObjects.Sprite | null = null;

  constructor() {
    super({ key: 'BaseScene' });
  }

  create() {
    this.gameState = GameState.getInstance();
    this.cameras.main.setBackgroundColor(0x2d5a27);

    this.createBaseGround();
    this.createExistingBuildings();
    this.createUI();

    // 返回探索按钮
    this.createBackButton();

    // 鼠标移动预览
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.buildMode && this.buildPreview) {
        this.buildPreview.setPosition(
          Math.floor(pointer.x / 32) * 32 + 48,
          Math.floor(pointer.y / 32) * 32 + 48
        );
      }
    });

    // 点击放置
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.buildMode && this.selectedBuilding) {
        this.tryPlaceBuilding(pointer.x, pointer.y);
      }
    });

    // ESC取消建造
    this.input.keyboard!.on('keydown-ESC', () => {
      this.cancelBuildMode();
    });
  }

  createBaseGround() {
    // 基地地面
    for (let x = 0; x < 25; x++) {
      for (let y = 0; y < 18; y++) {
        const isPath = (x === 12 || y === 9) && Math.random() > 0.3;
        const color = isPath ? 0xd4a574 : 0x4a7c3f;
        this.add.rectangle(x * 32 + 16, y * 32 + 16, 32, 32, color);
      }
    }

    // 基地边界
    this.add.rectangle(400, 300, 800, 576, 0x000000, 0).setStrokeStyle(4, 0x8b4513);
  }

  createExistingBuildings() {
    this.gameState.baseBuildings.forEach(building => {
      this.renderBuilding(building);
    });
  }

  renderBuilding(building: BaseBuilding) {
    const config = this.buildingConfigs[building.type];
    const sprite = this.add.sprite(building.position.x, building.position.y, config.texture);
    sprite.setInteractive();

    // 点击建筑打开管理面板
    sprite.on('pointerdown', () => {
      this.openBuildingPanel(building);
    });

    // 建筑名称
    this.add.text(building.position.x, building.position.y + config.size.height / 2 + 10, 
      `${config.name} Lv.${building.level}`, {
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  createUI() {
    // 顶部信息栏
    const topBar = this.add.rectangle(400, 25, 800, 50, 0x000000, 0.7);

    this.add.text(20, 15, `${this.gameState.playerName}的基地`, {
      fontSize: '18px',
      color: '#ffffff'
    });

    this.add.text(20, 35, `基地等级: ${this.gameState.baseLevel}`, {
      fontSize: '12px',
      color: '#9ca3af'
    });

    // 资源显示
    const resources = [
      { key: 'gold', icon: '💰', x: 300 },
      { key: 'wood', icon: '🪵', x: 400 },
      { key: 'stone', icon: '🪨', x: 500 },
      { key: 'food', icon: '🌾', x: 600 },
      { key: 'crystal', icon: '💎', x: 700 }
    ];

    resources.forEach(res => {
      this.add.text(res.x, 15, `${res.icon} ${(this.gameState.resources as any)[res.key]}`, {
        fontSize: '14px',
        color: '#ffffff'
      });
    });

    // 建造菜单按钮
    this.createBuildMenu();
  }

  createBuildMenu() {
    const menuY = 550;
    
    const menuBg = this.add.rectangle(400, menuY, 600, 80, 0x000000, 0.8);

    const buildings = Object.entries(this.buildingConfigs);
    const startX = 150;

    buildings.forEach(([key, config], index) => {
      const x = startX + index * 110;
      const unlocked = this.gameState.baseLevel >= config.unlockLevel;

      const btn = this.add.container(x, menuY);
      const bg = this.add.rectangle(0, 0, 100, 60, unlocked ? 0x4a5568 : 0x1f2937);
      const icon = this.add.text(0, -10, this.getBuildingEmoji(key), { fontSize: '20px' }).setOrigin(0.5);
      const name = this.add.text(0, 15, config.name, { 
        fontSize: '10px', 
        color: unlocked ? '#ffffff' : '#6b7280' 
      }).setOrigin(0.5);

      btn.add([bg, icon, name]);
      btn.setSize(100, 60);

      if (unlocked) {
        btn.setInteractive();
        btn.on('pointerover', () => bg.setFillStyle(0x6b7280));
        btn.on('pointerout', () => bg.setFillStyle(0x4a5568));
        btn.on('pointerdown', () => this.enterBuildMode(key));
      }
    });
  }

  getBuildingEmoji(type: string): string {
    const emojis: Record<string, string> = {
      petHouse: '🏠',
      farm: '🌾',
      lab: '🔬',
      workshop: '🔨',
      recruitCenter: '👥'
    };
    return emojis[type] || '🏗️';
  }

  enterBuildMode(buildingType: string) {
    this.buildMode = true;
    this.selectedBuilding = buildingType;

    const config = this.buildingConfigs[buildingType];

    // 创建预览
    this.buildPreview = this.add.sprite(400, 300, config.texture);
    this.buildPreview.setAlpha(0.6);
    this.buildPreview.setTint(0x00ff00);

    // 显示提示
    this.showMessage(`点击放置${config.name}，ESC取消`);
  }

  cancelBuildMode() {
    this.buildMode = false;
    this.selectedBuilding = null;
    if (this.buildPreview) {
      this.buildPreview.destroy();
      this.buildPreview = null;
    }
  }

  tryPlaceBuilding(x: number, y: number) {
    if (!this.selectedBuilding) return;

    const config = this.buildingConfigs[this.selectedBuilding];
    const gridX = Math.floor(x / 32) * 32 + config.size.width / 2;
    const gridY = Math.floor(y / 32) * 32 + config.size.height / 2;

    // 检查资源
    const res = this.gameState.resources;
    if (res.wood < config.cost.wood || res.stone < config.cost.stone || res.gold < config.cost.gold) {
      this.showMessage('资源不足！');
      return;
    }

    // 检查重叠（简化版）
    const overlap = this.gameState.baseBuildings.some(b => {
      const bConfig = this.buildingConfigs[b.type];
      return Math.abs(b.position.x - gridX) < (config.size.width + bConfig.size.width) / 2 &&
             Math.abs(b.position.y - gridY) < (config.size.height + bConfig.size.height) / 2;
    });

    if (overlap) {
      this.showMessage('位置被占用！');
      return;
    }

    // 扣除资源
    this.gameState.spendResource('wood', config.cost.wood);
    this.gameState.spendResource('stone', config.cost.stone);
    this.gameState.spendResource('gold', config.cost.gold);

    // 创建建筑
    const building: BaseBuilding = {
      id: `building_${Date.now()}`,
      type: this.selectedBuilding as any,
      level: 1,
      position: { x: gridX, y: gridY }
    };

    this.gameState.addBuilding(building);
    this.renderBuilding(building);

    this.showMessage(`${config.name}建造完成！`);
    this.cancelBuildMode();
  }

  openBuildingPanel(building: BaseBuilding) {
    const config = this.buildingConfigs[building.type];

    // 面板背景
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8).setInteractive();
    const panel = this.add.container(400, 300);
    const bg = this.add.rectangle(0, 0, 500, 400, 0x2d2d44);
    bg.setStrokeStyle(2, 0x6366f1);

    // 标题
    const title = this.add.text(0, -170, `${config.name} Lv.${building.level}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const desc = this.add.text(0, -140, config.description, {
      fontSize: '14px',
      color: '#9ca3af'
    }).setOrigin(0.5);

    panel.add([bg, title, desc]);

    // 根据建筑类型显示不同内容
    switch (building.type) {
      case 'petHouse':
        this.showPetHousePanel(panel, building);
        break;
      case 'farm':
        this.showFarmPanel(panel, building);
        break;
      case 'lab':
        this.showLabPanel(panel, building);
        break;
      case 'recruitCenter':
        this.showRecruitPanel(panel, building);
        break;
    }

    // 关闭按钮
    const closeBtn = this.add.text(220, -170, '✕', {
      fontSize: '24px',
      color: '#ef4444'
    }).setOrigin(0.5).setInteractive();
    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      panel.destroy();
    });
    panel.add(closeBtn);
  }

  showPetHousePanel(panel: Phaser.GameObjects.Container, building: BaseBuilding) {
    const pets = this.gameState.pets;
    
    if (pets.length === 0) {
      const noPet = this.add.text(0, 0, '暂无宠物', {
        fontSize: '16px',
        color: '#9ca3af'
      }).setOrigin(0.5);
      panel.add(noPet);
      return;
    }

    pets.forEach((pet, i) => {
      const y = -80 + i * 60;
      const petInfo = this.add.text(-200, y, 
        `${pet.name} Lv.${pet.level} | 攻击:${pet.attack} 防御:${pet.defense}`, {
        fontSize: '14px',
        color: '#ffffff'
      });

      const trainBtn = this.add.text(150, y, '训练', {
        fontSize: '14px',
        color: '#22c55e',
        backgroundColor: '#1f2937',
        padding: { x: 10, y: 5 }
      }).setInteractive();

      trainBtn.on('pointerdown', () => {
        if (this.gameState.spendResource('food', 5)) {
          pet.exp += 20;
          if (pet.exp >= pet.level * 50) {
            pet.exp = 0;
            pet.level++;
            pet.attack += 2;
            pet.defense += 1;
            this.showMessage(`${pet.name}升级了！`);
          } else {
            this.showMessage(`${pet.name}获得了经验`);
          }
        } else {
          this.showMessage('食物不足！');
        }
      });

      panel.add([petInfo, trainBtn]);
    });
  }

  showFarmPanel(panel: Phaser.GameObjects.Container, building: BaseBuilding) {
    const info = this.add.text(0, -50, `每日产出食物: ${building.level * 10}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const harvestBtn = this.add.text(0, 20, '收获', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#22c55e',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    harvestBtn.on('pointerdown', () => {
      const amount = building.level * 10;
      this.gameState.addResource('food', amount);
      this.showMessage(`收获了${amount}食物！`);
    });

    panel.add([info, harvestBtn]);
  }

  showLabPanel(panel: Phaser.GameObjects.Container, building: BaseBuilding) {
    const researches = [
      { id: 'potion_attack', name: '攻击药剂', cost: { gold: 50, crystal: 5 } },
      { id: 'potion_defense', name: '防御药剂', cost: { gold: 50, crystal: 5 } },
      { id: 'equip_basic', name: '基础装备图纸', cost: { gold: 100, crystal: 10 } }
    ];

    researches.forEach((research, i) => {
      const y = -60 + i * 50;
      const progress = this.gameState.researchProgress.get(research.id) || 0;
      
      const text = this.add.text(-150, y, `${research.name} (${progress}%)`, {
        fontSize: '14px',
        color: '#ffffff'
      });

      const btn = this.add.text(120, y, progress >= 100 ? '已完成' : '研究', {
        fontSize: '14px',
        color: progress >= 100 ? '#6b7280' : '#6366f1',
        backgroundColor: '#1f2937',
        padding: { x: 10, y: 5 }
      });

      if (progress < 100) {
        btn.setInteractive();
        btn.on('pointerdown', () => {
          const newProgress = Math.min(100, progress + 20);
          this.gameState.researchProgress.set(research.id, newProgress);
          this.showMessage(`研究进度: ${newProgress}%`);
        });
      }

      panel.add([text, btn]);
    });
  }

  showRecruitPanel(panel: Phaser.GameObjects.Container, building: BaseBuilding) {
    const recruitBtn = this.add.text(0, 0, '招募人才 (100金币)', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#6366f1',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    recruitBtn.on('pointerdown', () => {
      if (this.gameState.spendResource('gold', 100)) {
        const roles: Array<'farmer' | 'researcher' | 'trainer' | 'builder'> = 
          ['farmer', 'researcher', 'trainer', 'builder'];
        const names = ['小明', '小红', '阿强', '小芳', '老王'];
        
        const talent: Talent = {
          id: `talent_${Date.now()}`,
          name: names[Math.floor(Math.random() * names.length)],
          role: roles[Math.floor(Math.random() * roles.length)],
          level: 1,
          efficiency: 0.8 + Math.random() * 0.4
        };

        this.gameState.addTalent(talent);
        this.showMessage(`招募了${talent.name}（${talent.role}）！`);
      } else {
        this.showMessage('金币不足！');
      }
    });

    panel.add(recruitBtn);

    // 显示已有人才
    const talents = this.gameState.talents;
    talents.forEach((t, i) => {
      const text = this.add.text(-100, 60 + i * 25, 
        `${t.name} - ${t.role} Lv.${t.level}`, {
        fontSize: '12px',
        color: '#9ca3af'
      });
      panel.add(text);
    });
  }

  createBackButton() {
    const btn = this.add.container(70, 80);
    const bg = this.add.rectangle(0, 0, 100, 35, 0x4a5568);
    const text = this.add.text(0, 0, '← 探索', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    btn.add([bg, text]);
    btn.setSize(100, 35).setInteractive();

    btn.on('pointerover', () => bg.setFillStyle(0x6b7280));
    btn.on('pointerout', () => bg.setFillStyle(0x4a5568));
    btn.on('pointerdown', () => {
      this.scene.start('GameScene');
      this.scene.start('UIScene');
    });
  }

  showMessage(text: string) {
    const msg = this.add.text(400, 100, text, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: msg,
      alpha: 0,
      y: 80,
      duration: 2000,
      onComplete: () => msg.destroy()
    });
  }
}
