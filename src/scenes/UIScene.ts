import Phaser from 'phaser';
import { GameState } from '../core/GameState';
import { GachaSystem } from '../systems/GachaSystem';

export class UIScene extends Phaser.Scene {
  gameState!: GameState;
  gachaSystem!: GachaSystem;
  resourceTexts: Map<string, Phaser.GameObjects.Text> = new Map();
  actionButtons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.gameState = GameState.getInstance();
    this.gachaSystem = new GachaSystem(this);

    this.createResourcePanel();
    this.createActionBar();
    this.createGachaButton();

    // 监听状态变化
    this.gameState.on('resourceChanged', () => this.updateResources());
  }

  createResourcePanel() {
    const panel = this.add.rectangle(100, 30, 180, 50, 0x000000, 0.7);
    
    const resources = ['gold', 'wood', 'stone'];
    resources.forEach((res, i) => {
      const icon = this.add.image(30 + i * 60, 30, res).setScale(1.5);
      const text = this.add.text(45 + i * 60, 22, '0', {
        fontSize: '14px',
        color: '#ffffff'
      });
      this.resourceTexts.set(res, text);
    });

    this.updateResources();
  }

  createActionBar() {
    const actions = [
      { key: 'plant', label: '种植', color: 0x4ade80 },
      { key: 'build', label: '建造', color: 0x78716c },
      { key: 'attack', label: '攻击', color: 0xef4444 },
      { key: 'pet', label: '宠物', color: 0xfbbf24 }
    ];

    actions.forEach((action, i) => {
      const x = 100 + i * 80;
      const y = 560;

      const btn = this.add.container(x, y);
      const bg = this.add.rectangle(0, 0, 70, 40, action.color, 0.8);
      const label = this.add.text(0, 0, action.label, {
        fontSize: '12px',
        color: '#ffffff'
      }).setOrigin(0.5);

      btn.add([bg, label]);
      btn.setSize(70, 40);
      btn.setInteractive();

      btn.on('pointerdown', () => {
        this.gameState.currentAction = action.key;
        this.updateActionBar();
      });

      this.actionButtons.push(btn);
    });

    this.updateActionBar();
  }

  updateActionBar() {
    const actions = ['plant', 'build', 'attack', 'pet'];
    this.actionButtons.forEach((btn, i) => {
      const bg = btn.getAt(0) as Phaser.GameObjects.Rectangle;
      bg.setStrokeStyle(
        this.gameState.currentAction === actions[i] ? 3 : 0,
        0xffffff
      );
    });
  }

  createGachaButton() {
    const btn = this.add.container(720, 560);
    const bg = this.add.rectangle(0, 0, 70, 40, 0x6366f1, 0.9);
    const label = this.add.text(0, 0, '抽卡', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    btn.add([bg, label]);
    btn.setSize(70, 40);
    btn.setInteractive();

    btn.on('pointerdown', () => {
      this.gachaSystem.pull();
    });

    // 基地按钮
    const baseBtn = this.add.container(620, 560);
    const baseBg = this.add.rectangle(0, 0, 70, 40, 0x8b4513, 0.9);
    const baseLabel = this.add.text(0, 0, '基地', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    baseBtn.add([baseBg, baseLabel]);
    baseBtn.setSize(70, 40);
    baseBtn.setInteractive();

    baseBtn.on('pointerdown', () => {
      this.scene.stop('GameScene');
      this.scene.stop('UIScene');
      this.scene.start('BaseScene');
    });
  }

  updateResources() {
    const resources = this.gameState.resources;
    this.resourceTexts.get('gold')?.setText(resources.gold.toString());
    this.resourceTexts.get('wood')?.setText(resources.wood.toString());
    this.resourceTexts.get('stone')?.setText(resources.stone.toString());
  }
}
