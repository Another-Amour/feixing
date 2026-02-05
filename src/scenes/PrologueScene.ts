import Phaser from 'phaser';
import { GameState } from '../core/GameState';

interface StarterPet {
  id: string;
  name: string;
  type: 'fire' | 'water' | 'grass';
  description: string;
  color: number;
  stats: { attack: number; defense: number; speed: number };
}

export class PrologueScene extends Phaser.Scene {
  gameState!: GameState;
  dialogueIndex: number = 0;
  dialogueText!: Phaser.GameObjects.Text;
  nameInput: string = '';
  phase: 'intro' | 'naming' | 'pet_select' | 'tutorial' = 'intro';

  starterPets: StarterPet[] = [
    {
      id: 'fire_fox',
      name: '炎狐',
      type: 'fire',
      description: '热情似火的小狐狸，擅长攻击，能帮你快速击败敌人',
      color: 0xef4444,
      stats: { attack: 12, defense: 5, speed: 8 }
    },
    {
      id: 'water_turtle',
      name: '玄龟',
      type: 'water',
      description: '沉稳可靠的小龟，防御出众，能保护你的安全',
      color: 0x3b82f6,
      stats: { attack: 6, defense: 12, speed: 4 }
    },
    {
      id: 'grass_rabbit',
      name: '翠兔',
      type: 'grass',
      description: '活泼灵动的兔子，速度极快，收集资源效率更高',
      color: 0x22c55e,
      stats: { attack: 8, defense: 6, speed: 12 }
    }
  ];

  introDialogues: string[] = [
    '......',
    '你慢慢睁开眼睛，发现自己躺在一片陌生的草地上。',
    '四周是茂密的森林，远处隐约可见山脉的轮廓。',
    '你努力回想，却发现记忆一片模糊...',
    '只记得一个名字——这里是【迷雾大陆】。',
    '一个神秘的声音在你脑海中响起：',
    '"醒来吧，旅行者。这片大陆需要你。"',
    '"在这里，你将建立自己的家园，培养伙伴，探索未知。"',
    '"但首先...告诉我，你叫什么名字？"'
  ];

  constructor() {
    super({ key: 'PrologueScene' });
  }

  create() {
    this.gameState = GameState.getInstance();
    this.cameras.main.setBackgroundColor(0x0a0a0a);

    this.showIntro();
  }

  showIntro() {
    this.phase = 'intro';
    this.dialogueIndex = 0;

    // 渐入效果
    this.cameras.main.fadeIn(2000);

    // 对话框背景
    const dialogueBg = this.add.rectangle(400, 500, 700, 120, 0x000000, 0.8);
    dialogueBg.setStrokeStyle(2, 0x4a5568);

    // 对话文字
    this.dialogueText = this.add.text(400, 500, '', {
      fontSize: '18px',
      color: '#ffffff',
      wordWrap: { width: 650 },
      lineSpacing: 8
    }).setOrigin(0.5);

    // 提示
    const hint = this.add.text(400, 560, '点击继续...', {
      fontSize: '12px',
      color: '#9ca3af'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: hint,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // 显示第一句
    this.typeText(this.introDialogues[0]);

    // 点击继续
    this.input.on('pointerdown', () => this.handleClick());
  }

  typeText(text: string) {
    this.dialogueText.setText('');
    let i = 0;
    
    this.time.addEvent({
      delay: 50,
      repeat: text.length - 1,
      callback: () => {
        this.dialogueText.setText(text.substring(0, ++i));
      }
    });
  }

  handleClick() {
    if (this.phase === 'intro') {
      this.dialogueIndex++;
      if (this.dialogueIndex < this.introDialogues.length) {
        this.typeText(this.introDialogues[this.dialogueIndex]);
      } else {
        this.showNaming();
      }
    }
  }

  showNaming() {
    this.phase = 'naming';
    this.input.off('pointerdown');

    // 清空场景
    this.children.removeAll();

    // 背景
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    // 标题
    this.add.text(400, 150, '请输入你的名字', {
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 输入框背景
    const inputBg = this.add.rectangle(400, 250, 300, 50, 0x2d2d44);
    inputBg.setStrokeStyle(2, 0x6366f1);

    // 输入显示
    const inputText = this.add.text(400, 250, '|', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 光标闪烁
    this.tweens.add({
      targets: inputText,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 键盘输入
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Backspace') {
        this.nameInput = this.nameInput.slice(0, -1);
      } else if (event.key === 'Enter' && this.nameInput.length > 0) {
        this.gameState.playerName = this.nameInput;
        this.showPetSelection();
        return;
      } else if (event.key.length === 1 && this.nameInput.length < 10) {
        this.nameInput += event.key;
      }
      inputText.setText(this.nameInput + '|');
    });

    // 确认按钮
    const confirmBtn = this.add.container(400, 350);
    const btnBg = this.add.rectangle(0, 0, 120, 45, 0x6366f1);
    const btnText = this.add.text(0, 0, '确认', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
    confirmBtn.add([btnBg, btnText]);
    confirmBtn.setSize(120, 45);
    confirmBtn.setInteractive();

    confirmBtn.on('pointerover', () => btnBg.setFillStyle(0x818cf8));
    confirmBtn.on('pointerout', () => btnBg.setFillStyle(0x6366f1));
    confirmBtn.on('pointerdown', () => {
      if (this.nameInput.length > 0) {
        this.gameState.playerName = this.nameInput;
        this.showPetSelection();
      }
    });
  }

  showPetSelection() {
    this.phase = 'pet_select';
    this.input.keyboard!.off('keydown');
    this.children.removeAll();

    // 背景
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    // 标题
    this.add.text(400, 50, `${this.gameState.playerName}，选择你的初始伙伴`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 85, '它将陪伴你开始这段冒险', {
      fontSize: '14px',
      color: '#9ca3af'
    }).setOrigin(0.5);

    // 三只宠物卡片
    this.starterPets.forEach((pet, index) => {
      this.createPetCard(pet, 150 + index * 250, 300);
    });
  }

  createPetCard(pet: StarterPet, x: number, y: number) {
    const card = this.add.container(x, y);

    // 卡片背景
    const bg = this.add.rectangle(0, 0, 200, 320, 0x2d2d44);
    bg.setStrokeStyle(3, pet.color);

    // 宠物图标
    const icon = this.add.graphics();
    icon.fillStyle(pet.color);
    icon.fillCircle(0, -80, 40);
    
    // 眼睛
    icon.fillStyle(0xffffff);
    icon.fillCircle(-12, -85, 8);
    icon.fillCircle(12, -85, 8);
    icon.fillStyle(0x000000);
    icon.fillCircle(-10, -83, 4);
    icon.fillCircle(14, -83, 4);

    // 名字
    const nameText = this.add.text(0, -20, pet.name, {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 属性标签
    const typeColors: Record<string, string> = {
      fire: '#ef4444',
      water: '#3b82f6',
      grass: '#22c55e'
    };
    const typeNames: Record<string, string> = {
      fire: '火',
      water: '水',
      grass: '草'
    };
    const typeTag = this.add.text(0, 10, `【${typeNames[pet.type]}属性】`, {
      fontSize: '14px',
      color: typeColors[pet.type]
    }).setOrigin(0.5);

    // 描述
    const desc = this.add.text(0, 55, pet.description, {
      fontSize: '12px',
      color: '#d1d5db',
      wordWrap: { width: 170 },
      align: 'center'
    }).setOrigin(0.5);

    // 属性值
    const statsText = this.add.text(0, 115, 
      `攻击: ${pet.stats.attack}  防御: ${pet.stats.defense}  速度: ${pet.stats.speed}`, {
      fontSize: '11px',
      color: '#9ca3af'
    }).setOrigin(0.5);

    card.add([bg, icon, nameText, typeTag, desc, statsText]);
    card.setSize(200, 320);
    card.setInteractive();

    // 悬停效果
    card.on('pointerover', () => {
      this.tweens.add({
        targets: card,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150
      });
      bg.setFillStyle(0x3d3d54);
    });

    card.on('pointerout', () => {
      this.tweens.add({
        targets: card,
        scaleX: 1,
        scaleY: 1,
        duration: 150
      });
      bg.setFillStyle(0x2d2d44);
    });

    // 选择宠物
    card.on('pointerdown', () => {
      this.selectPet(pet);
    });
  }

  selectPet(pet: StarterPet) {
    // 确认选择
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    
    const confirmBox = this.add.container(400, 300);
    const boxBg = this.add.rectangle(0, 0, 350, 200, 0x2d2d44);
    boxBg.setStrokeStyle(2, pet.color);

    const title = this.add.text(0, -60, `确定选择 ${pet.name} 吗？`, {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const hint = this.add.text(0, -20, '一旦选择将无法更改', {
      fontSize: '14px',
      color: '#9ca3af'
    }).setOrigin(0.5);

    // 确认按钮
    const yesBtn = this.add.container(-70, 50);
    const yesBg = this.add.rectangle(0, 0, 100, 40, 0x22c55e);
    const yesText = this.add.text(0, 0, '确定', { fontSize: '16px', color: '#fff' }).setOrigin(0.5);
    yesBtn.add([yesBg, yesText]);
    yesBtn.setSize(100, 40).setInteractive();
    yesBtn.on('pointerdown', () => this.confirmPetSelection(pet));

    // 取消按钮
    const noBtn = this.add.container(70, 50);
    const noBg = this.add.rectangle(0, 0, 100, 40, 0x6b7280);
    const noText = this.add.text(0, 0, '取消', { fontSize: '16px', color: '#fff' }).setOrigin(0.5);
    noBtn.add([noBg, noText]);
    noBtn.setSize(100, 40).setInteractive();
    noBtn.on('pointerdown', () => {
      overlay.destroy();
      confirmBox.destroy();
    });

    confirmBox.add([boxBg, title, hint, yesBtn, noBtn]);
  }

  confirmPetSelection(pet: StarterPet) {
    // 保存初始宠物
    this.gameState.addPet({
      id: pet.id,
      name: pet.name,
      rarity: 'rare',
      level: 1,
      exp: 0,
      attack: pet.stats.attack,
      defense: pet.stats.defense,
      speed: pet.stats.speed,
      type: pet.type,
      isStarter: true
    });

    this.gameState.starterPetId = pet.id;

    // 过渡动画
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    
    this.time.delayedCall(1000, () => {
      this.showTutorialIntro(pet);
    });
  }

  showTutorialIntro(pet: StarterPet) {
    this.phase = 'tutorial';
    this.children.removeAll();
    this.cameras.main.fadeIn(1000);

    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    const dialogues = [
      `${pet.name}轻轻蹭了蹭你的手掌，似乎在说"你好"。`,
      '"很好，你已经有了第一个伙伴。"',
      '"现在，去探索这片大陆吧。"',
      '"收集资源，建造你的基地，让它成为你的家园。"',
      '"在基地中，你可以：\n· 培养和强化你的宠物\n· 种植作物获取食物\n· 招募人才帮助你\n· 研究药剂和装备"',
      '"记住，这片大陆上还有许多未知的危险..."',
      '"但也有无数的宝藏等待你去发现。"',
      '"准备好了吗？你的冒险即将开始！"'
    ];

    let index = 0;
    
    const dialogueBg = this.add.rectangle(400, 480, 700, 140, 0x000000, 0.8);
    dialogueBg.setStrokeStyle(2, 0x4a5568);

    const text = this.add.text(400, 480, dialogues[0], {
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: 650 },
      lineSpacing: 10,
      align: 'center'
    }).setOrigin(0.5);

    const hint = this.add.text(400, 545, '点击继续', {
      fontSize: '12px',
      color: '#9ca3af'
    }).setOrigin(0.5);

    this.input.on('pointerdown', () => {
      index++;
      if (index < dialogues.length) {
        text.setText(dialogues[index]);
      } else {
        // 进入游戏
        this.cameras.main.fadeOut(500);
        this.time.delayedCall(500, () => {
          this.scene.start('GameScene');
          this.scene.start('UIScene');
        });
      }
    });
  }
}
