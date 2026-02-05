import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { FarmSystem } from '../systems/FarmSystem';
import { BuildingSystem } from '../systems/BuildingSystem';
import { MonsterSystem } from '../systems/MonsterSystem';
import { PetSystem } from '../systems/PetSystem';
import { GameState } from '../core/GameState';

export class GameScene extends Phaser.Scene {
  player!: Player;
  farmSystem!: FarmSystem;
  buildingSystem!: BuildingSystem;
  monsterSystem!: MonsterSystem;
  petSystem!: PetSystem;
  gameState!: GameState;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.gameState = GameState.getInstance();
    
    // 创建地图
    this.createMap();
    
    // 初始化玩家
    this.player = new Player(this, 400, 300);
    
    // 初始化各系统
    this.farmSystem = new FarmSystem(this);
    this.buildingSystem = new BuildingSystem(this);
    this.monsterSystem = new MonsterSystem(this);
    this.petSystem = new PetSystem(this);

    // 输入控制
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // 交互按键
    this.input.keyboard!.on('keydown-SPACE', () => this.handleInteraction());
    this.input.keyboard!.on('keydown-E', () => this.handleAction());

    // 相机跟随
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);
  }

  createMap() {
    // 生成草地地图
    for (let x = 0; x < 25; x++) {
      for (let y = 0; y < 20; y++) {
        this.add.image(x * 32 + 16, y * 32 + 16, 'grass');
      }
    }
  }

  handleInteraction() {
    const playerPos = this.player.getPosition();
    
    // 检查农田交互
    if (this.farmSystem.interact(playerPos.x, playerPos.y)) return;
    
    // 检查建筑交互
    if (this.buildingSystem.interact(playerPos.x, playerPos.y)) return;
  }

  handleAction() {
    // E键执行当前选中的动作
    const action = this.gameState.currentAction;
    const playerPos = this.player.getPosition();

    switch (action) {
      case 'plant':
        this.farmSystem.createFarmland(playerPos.x, playerPos.y);
        break;
      case 'build':
        this.buildingSystem.placeBuilding(playerPos.x, playerPos.y, 'house');
        break;
      case 'attack':
        this.player.attack(this.monsterSystem.monsters);
        break;
    }
  }

  update() {
    // 玩家移动
    const speed = 100;
    let vx = 0, vy = 0;

    if (this.cursors.left.isDown) vx = -speed;
    else if (this.cursors.right.isDown) vx = speed;
    if (this.cursors.up.isDown) vy = -speed;
    else if (this.cursors.down.isDown) vy = speed;

    this.player.move(vx, vy);

    // 更新各系统
    this.farmSystem.update();
    this.monsterSystem.update(this.player);
    this.petSystem.update(this.player);
  }
}
