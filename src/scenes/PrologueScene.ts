import Phaser from 'phaser';
import { GameState } from '../core/GameState';

interface StarterPet {
  id: string;
  name: string;
  title: string;
  type: 'fire' | 'water' | 'thunder';
  description: string;
  lore: string;
  color: number;
  accentColor: number;
  stats: { attack: number; defense: number; speed: number };
}

export class PrologueScene extends Phaser.Scene {
  gameState!: GameState;
  dialogueIndex: number = 0;
  dialogueText!: Phaser.GameObjects.Text;
  nameInput: string = '';
  phase: 'intro' | 'naming' | 'pet_select' | 'tutorial' = 'intro';
  bgParticles: Phaser.GameObjects.Graphics[] = [];

  starterPets: StarterPet[] = [
    {
      id: 'shadow_wolf',
      name: '烬狼·夜焰',
      title: '暗夜猎手',
      type: 'fire',
      description: '来自深渊火山的孤狼，浑身燃烧着黑色的火焰',
      lore: '传说它是被遗弃在火山口的幼狼，吞噬了地心之火后获得了不灭的黑焰之力。它的眼眸如同燃烧的余烬，能看穿一切黑暗。',
      color: 0x1a1a2e,
      accentColor: 0xff6b35,
      stats: { attack: 14, defense: 6, speed: 10 }
    },
    {
      id: 'storm_dragon',
      name: '霆龙·苍雷',
      title: '雷霆之子',
      type: 'thunder',
      description: '诞生于雷暴云层的幼龙，周身环绕着紫色闪电',
      lore: '在千年一遇的雷暴之夜，一道紫雷击中了龙族的神殿，苍雷便从雷光中诞生。它虽年幼，却已掌握操控雷电的力量。',
      color: 0x2d1b4e,
      accentColor: 0xa855f7,
      stats: { attack: 11, defense: 7, speed: 12 }
    },
    {
      id: 'ice_phoenix',
      name: '凰羽·寒星',
      title: '极光守护者',
      type: 'water',
      description: '栖息于极北冰原的神鸟，羽翼闪耀着极光的色彩',
      lore: '寒星是冰凤凰一族最后的血脉，它的羽毛能折射出极光的七彩光芒。虽然外表冷艳，内心却温柔而坚定，誓要守护认定的主人。',
      color: 0x0c1929,
      accentColor: 0x38bdf8,
      stats: { attack: 9, defense: 11, speed: 10 }
    }
  ];

  introDialogues: string[] = [
    '...',
    '...... ......',
    '意识逐渐从黑暗中浮现...',
    '你感到一阵刺骨的寒风拂过脸庞。',
    '睁开眼，映入眼帘的是一片苍茫的天空。',
    '灰白色的迷雾笼罩着四周，远处隐约传来野兽的嘶吼。',
    '你挣扎着站起身，却发现记忆如同被撕裂的画卷...',
    '只有一个名字，深深刻在脑海中——',
    '【雾灵大陆】',
    '突然，一道苍老而威严的声音在意识中响起：',
    '"终于等到你了，命运的旅者。"',
    '"这片大陆正被黑暗侵蚀，而你，是被选中的驭灵师。"',
    '"驭灵师能与灵兽缔结契约，借助它们的力量战斗。"',
    '"现在，告诉我你的名字..."',
    '"让命运记住，这个即将改变一切的名字。"'
  ];

  constructor() {
    super({ key: 'PrologueScene' });
  }

  create() {
    this.gameState = GameState.getInstance();
    this.cameras.main.setBackgroundColor(0x0a0a12);

    this.createAnimatedBackground();
    this.showIntro();
  }

  createAnimatedBackground() {
    // 动态迷雾粒子效果
    for (let i = 0; i < 30; i++) {
      const particle = this.add.graphics();
      const size = Phaser.Math.Between(50, 150);
      const alpha = Phaser.Math.FloatBetween(0.03, 0.08);
      
      particle.fillStyle(0x6366f1, alpha);
      particle.fillCircle(0, 0, size);
      particle.setPosition(
        Phaser.Math.Between(0, 800),
        Phaser.Math.Between(0, 600)
      );
      
      this.bgParticles.push(particle);
      
      // 缓慢漂浮动画
      this.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-100, 100),
        y: particle.y + Phaser.Math.Between(-50, 50),
        alpha: { from: alpha, to: alpha * 0.5 },
        duration: Phaser.Math.Between(8000, 15000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
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

    // 重新创建背景
    this.createAnimatedBackground();

    // 渐变背景
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a12, 0x0a0a12, 0x1a1a2e, 0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 标题
    this.add.text(400, 40, '选择你的契约灵兽', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 75, `${this.gameState.playerName}，命运为你准备了三位伙伴`, {
      fontSize: '14px',
      color: '#9ca3af'
    }).setOrigin(0.5);

    // 三只宠物卡片
    this.starterPets.forEach((pet, index) => {
      this.createPetCard(pet, 135 + index * 265, 320);
    });
  }

  createPetCard(pet: StarterPet, x: number, y: number) {
    const card = this.add.container(x, y);

    // 卡片背景 - 渐变效果
    const bg = this.add.graphics();
    bg.fillStyle(pet.color, 0.9);
    bg.fillRoundedRect(-110, -180, 220, 360, 12);
    bg.lineStyle(2, pet.accentColor, 0.8);
    bg.strokeRoundedRect(-110, -180, 220, 360, 12);

    // 发光边框效果
    const glow = this.add.graphics();
    glow.lineStyle(4, pet.accentColor, 0.3);
    glow.strokeRoundedRect(-112, -182, 224, 364, 14);

    // 宠物形象区域
    const portraitBg = this.add.graphics();
    portraitBg.fillStyle(0x000000, 0.4);
    portraitBg.fillRoundedRect(-90, -160, 180, 140, 8);

    // 绘制宠物形象
    const petImage = this.createPetPortrait(pet);
    petImage.setPosition(0, -90);

    // 名字
    const nameText = this.add.text(0, 5, pet.name, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 称号
    const titleText = this.add.text(0, 30, `「${pet.title}」`, {
      fontSize: '12px',
      color: `#${pet.accentColor.toString(16)}`
    }).setOrigin(0.5);

    // 属性标签
    const typeColors: Record<string, { bg: number; text: string }> = {
      fire: { bg: 0xff6b35, text: '炎' },
      thunder: { bg: 0xa855f7, text: '雷' },
      water: { bg: 0x38bdf8, text: '冰' }
    };
    const typeInfo = typeColors[pet.type];
    
    const typeBadge = this.add.graphics();
    typeBadge.fillStyle(typeInfo.bg, 0.8);
    typeBadge.fillRoundedRect(-25, 50, 50, 22, 11);
    
    const typeText = this.add.text(0, 61, typeInfo.text + '属性', {
      fontSize: '11px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 描述
    const desc = this.add.text(0, 95, pet.description, {
      fontSize: '11px',
      color: '#d1d5db',
      wordWrap: { width: 180 },
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5);

    // 属性值
    const statsY = 145;
    const stats = [
      { label: '攻击', value: pet.stats.attack, color: 0xef4444 },
      { label: '防御', value: pet.stats.defense, color: 0x3b82f6 },
      { label: '速度', value: pet.stats.speed, color: 0x22c55e }
    ];

    stats.forEach((stat, i) => {
      const statX = -60 + i * 60;
      
      // 属性条背景
      const barBg = this.add.graphics();
      barBg.fillStyle(0x000000, 0.3);
      barBg.fillRoundedRect(statX - 20, statsY + 15, 40, 6, 3);
      
      // 属性条
      const barFill = this.add.graphics();
      barFill.fillStyle(stat.color, 0.8);
      barFill.fillRoundedRect(statX - 20, statsY + 15, (stat.value / 15) * 40, 6, 3);
      
      this.add.text(statX, statsY, stat.label, {
        fontSize: '10px',
        color: '#9ca3af'
      }).setOrigin(0.5);
      
      this.add.text(statX, statsY + 28, stat.value.toString(), {
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      card.add([barBg, barFill]);
    });

    card.add([bg, glow, portraitBg, petImage, nameText, titleText, typeBadge, typeText, desc]);
    card.setSize(220, 360);
    card.setInteractive();

    // 悬停效果
    card.on('pointerover', () => {
      this.tweens.add({
        targets: card,
        scaleX: 1.05,
        scaleY: 1.05,
        y: y - 10,
        duration: 200,
        ease: 'Back.easeOut'
      });
      glow.clear();
      glow.lineStyle(6, pet.accentColor, 0.6);
      glow.strokeRoundedRect(-112, -182, 224, 364, 14);
    });

    card.on('pointerout', () => {
      this.tweens.add({
        targets: card,
        scaleX: 1,
        scaleY: 1,
        y: y,
        duration: 200
      });
      glow.clear();
      glow.lineStyle(4, pet.accentColor, 0.3);
      glow.strokeRoundedRect(-112, -182, 224, 364, 14);
    });

    // 选择宠物
    card.on('pointerdown', () => {
      this.selectPet(pet);
    });
  }

  createPetPortrait(pet: StarterPet): Phaser.GameObjects.Graphics {
    const g = this.add.graphics();
    
    if (pet.id === 'shadow_wolf') {
      // 烬狼 - 黑狼形象，带火焰效果
      // 身体
      g.fillStyle(0x1a1a2e);
      g.fillEllipse(0, 20, 60, 40);
      // 头部
      g.fillStyle(0x252540);
      g.fillCircle(0, -10, 25);
      // 耳朵
      g.fillTriangle(-20, -25, -10, -45, -5, -20);
      g.fillTriangle(20, -25, 10, -45, 5, -20);
      // 眼睛 - 燃烧的橙色
      g.fillStyle(0xff6b35);
      g.fillCircle(-10, -12, 5);
      g.fillCircle(10, -12, 5);
      g.fillStyle(0xffffff);
      g.fillCircle(-8, -13, 2);
      g.fillCircle(12, -13, 2);
      // 火焰效果
      g.fillStyle(0xff6b35, 0.8);
      g.fillTriangle(-30, 10, -40, -20, -20, 0);
      g.fillTriangle(30, 10, 40, -20, 20, 0);
      g.fillStyle(0xfbbf24, 0.6);
      g.fillTriangle(-25, 15, -35, -10, -15, 5);
      g.fillTriangle(25, 15, 35, -10, 15, 5);
    } 
    else if (pet.id === 'storm_dragon') {
      // 霆龙 - 紫色小龙，带闪电
      // 身体
      g.fillStyle(0x4c1d95);
      g.fillEllipse(0, 15, 50, 35);
      // 头部
      g.fillStyle(0x5b21b6);
      g.fillCircle(0, -15, 22);
      // 角
      g.fillStyle(0xa855f7);
      g.fillTriangle(-15, -30, -10, -50, -5, -25);
      g.fillTriangle(15, -30, 10, -50, 5, -25);
      // 眼睛
      g.fillStyle(0xe9d5ff);
      g.fillCircle(-8, -15, 6);
      g.fillCircle(8, -15, 6);
      g.fillStyle(0x7c3aed);
      g.fillCircle(-8, -15, 3);
      g.fillCircle(8, -15, 3);
      // 翅膀
      g.fillStyle(0x7c3aed, 0.7);
      g.fillTriangle(-25, 0, -55, -20, -30, 25);
      g.fillTriangle(25, 0, 55, -20, 30, 25);
      // 闪电效果
      g.lineStyle(3, 0xa855f7, 0.8);
      g.lineBetween(-40, -30, -30, -10);
      g.lineBetween(-30, -10, -35, 5);
      g.lineBetween(40, -25, 32, -5);
      g.lineBetween(32, -5, 38, 10);
    }
    else if (pet.id === 'ice_phoenix') {
      // 凰羽 - 冰蓝色凤凰
      // 身体
      g.fillStyle(0x0c4a6e);
      g.fillEllipse(0, 15, 45, 30);
      // 头部
      g.fillStyle(0x0369a1);
      g.fillCircle(0, -15, 20);
      // 冠羽
      g.fillStyle(0x38bdf8);
      g.fillTriangle(0, -35, -8, -55, 8, -55);
      g.fillTriangle(-10, -30, -20, -48, -5, -35);
      g.fillTriangle(10, -30, 20, -48, 5, -35);
      // 眼睛
      g.fillStyle(0x7dd3fc);
      g.fillCircle(-7, -15, 5);
      g.fillCircle(7, -15, 5);
      g.fillStyle(0x0c4a6e);
      g.fillCircle(-7, -15, 2);
      g.fillCircle(7, -15, 2);
      // 翅膀
      g.fillStyle(0x0ea5e9, 0.8);
      g.fillTriangle(-22, 5, -60, -15, -35, 35);
      g.fillTriangle(22, 5, 60, -15, 35, 35);
      // 尾羽
      g.fillStyle(0x38bdf8, 0.7);
      g.fillTriangle(0, 30, -20, 60, 0, 50);
      g.fillTriangle(0, 30, 20, 60, 0, 50);
      g.fillTriangle(0, 30, -10, 55, 10, 55);
      // 极光效果
      g.fillStyle(0x7dd3fc, 0.3);
      g.fillEllipse(0, 0, 80, 60);
    }
    
    return g;
  }

  selectPet(pet: StarterPet) {
    // 确认选择弹窗
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85);
    
    const confirmBox = this.add.container(400, 300);
    
    // 弹窗背景
    const boxBg = this.add.graphics();
    boxBg.fillStyle(0x1a1a2e, 0.95);
    boxBg.fillRoundedRect(-200, -150, 400, 300, 16);
    boxBg.lineStyle(2, pet.accentColor, 0.8);
    boxBg.strokeRoundedRect(-200, -150, 400, 300, 16);

    // 宠物小图
    const miniPortrait = this.createPetPortrait(pet);
    miniPortrait.setScale(0.6);
    miniPortrait.setPosition(0, -70);

    const title = this.add.text(0, 10, `与 ${pet.name} 缔结契约？`, {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 背景故事
    const lore = this.add.text(0, 55, pet.lore, {
      fontSize: '12px',
      color: '#9ca3af',
      wordWrap: { width: 350 },
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5);

    // 确认按钮
    const yesBtn = this.add.container(-70, 120);
    const yesBg = this.add.graphics();
    yesBg.fillStyle(pet.accentColor, 0.9);
    yesBg.fillRoundedRect(-55, -20, 110, 40, 8);
    const yesText = this.add.text(0, 0, '缔结契约', { fontSize: '14px', color: '#fff' }).setOrigin(0.5);
    yesBtn.add([yesBg, yesText]);
    yesBtn.setSize(110, 40).setInteractive();
    yesBtn.on('pointerover', () => yesBg.clear().fillStyle(pet.accentColor, 1).fillRoundedRect(-55, -20, 110, 40, 8));
    yesBtn.on('pointerout', () => yesBg.clear().fillStyle(pet.accentColor, 0.9).fillRoundedRect(-55, -20, 110, 40, 8));
    yesBtn.on('pointerdown', () => this.confirmPetSelection(pet));

    // 取消按钮
    const noBtn = this.add.container(70, 120);
    const noBg = this.add.graphics();
    noBg.fillStyle(0x4b5563, 0.9);
    noBg.fillRoundedRect(-55, -20, 110, 40, 8);
    const noText = this.add.text(0, 0, '再考虑下', { fontSize: '14px', color: '#fff' }).setOrigin(0.5);
    noBtn.add([noBg, noText]);
    noBtn.setSize(110, 40).setInteractive();
    noBtn.on('pointerdown', () => {
      overlay.destroy();
      confirmBox.destroy();
    });

    confirmBox.add([boxBg, miniPortrait, title, lore, yesBtn, noBtn]);
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
      type: pet.type as any,
      isStarter: true
    });

    this.gameState.starterPetId = pet.id;

    // 契约特效
    this.cameras.main.flash(500, 
      (pet.accentColor >> 16) & 0xff,
      (pet.accentColor >> 8) & 0xff,
      pet.accentColor & 0xff
    );

    this.time.delayedCall(500, () => {
      this.cameras.main.fadeOut(1000, 0, 0, 0);
    });
    
    this.time.delayedCall(1500, () => {
      this.showTutorialIntro(pet);
    });
  }

  showTutorialIntro(pet: StarterPet) {
    this.phase = 'tutorial';
    this.children.removeAll();
    this.cameras.main.fadeIn(1000);

    // 背景
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a12, 0x0a0a12, 0x1a1a2e, 0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    this.createAnimatedBackground();

    // 宠物形象
    const petPortrait = this.createPetPortrait(pet);
    petPortrait.setPosition(400, 200);
    petPortrait.setScale(1.5);

    // 发光效果
    const glow = this.add.graphics();
    glow.fillStyle(pet.accentColor, 0.1);
    glow.fillCircle(400, 200, 100);

    this.tweens.add({
      targets: glow,
      alpha: { from: 0.3, to: 0.6 },
      duration: 1500,
      yoyo: true,
      repeat: -1
    });

    const dialogues = [
      `${pet.name}缓缓靠近你，眼中闪烁着认可的光芒。`,
      '一道无形的纽带在你们之间形成——契约已经缔结。',
      `"很好，${this.gameState.playerName}。你已经迈出了第一步。"`,
      '"作为驭灵师，你需要建立自己的据点。"',
      '"在据点中，你可以：\n\n· 培养和强化你的灵兽\n· 种植灵草获取资源\n· 招募志同道合的伙伴\n· 研究强化秘药和灵兽装备"',
      '"这片大陆上潜伏着无数危险的野兽和黑暗势力..."',
      '"但同样也有无数强大的灵兽等待着与你缔结契约。"',
      '"去吧，年轻的驭灵师。"',
      '"你的传说，从这里开始！"'
    ];

    let index = 0;
    
    const dialogueBg = this.add.graphics();
    dialogueBg.fillStyle(0x000000, 0.8);
    dialogueBg.fillRoundedRect(50, 420, 700, 140, 12);
    dialogueBg.lineStyle(2, pet.accentColor, 0.5);
    dialogueBg.strokeRoundedRect(50, 420, 700, 140, 12);

    const text = this.add.text(400, 490, dialogues[0], {
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: 650 },
      lineSpacing: 10,
      align: 'center'
    }).setOrigin(0.5);

    const hint = this.add.text(400, 545, '点击继续', {
      fontSize: '12px',
      color: '#6b7280'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: hint,
      alpha: { from: 0.5, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    this.input.on('pointerdown', () => {
      index++;
      if (index < dialogues.length) {
        text.setText(dialogues[index]);
      } else {
        // 进入游戏
        this.cameras.main.fadeOut(800);
        this.time.delayedCall(800, () => {
          this.scene.start('GameScene');
          this.scene.start('UIScene');
        });
      }
    });
  }
}
