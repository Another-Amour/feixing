import Phaser from 'phaser';
import { GameState, Pet, Card } from '../core/GameState';

interface GachaPool {
  id: string;
  name: string;
  cost: number;
  rates: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
}

const PET_NAMES = {
  common: ['小鸡', '小狗', '小猫', '兔子'],
  rare: ['火狐', '冰鸟', '雷鼠', '风蛇'],
  epic: ['凤凰', '麒麟', '白虎', '玄武'],
  legendary: ['神龙', '天马', '九尾狐', '青龙']
};

export class GachaSystem {
  scene: Phaser.Scene;
  gameState: GameState;
  
  pools: GachaPool[] = [
    {
      id: 'standard',
      name: '标准池',
      cost: 10,
      rates: { common: 0.6, rare: 0.3, epic: 0.08, legendary: 0.02 }
    },
    {
      id: 'premium',
      name: '高级池',
      cost: 50,
      rates: { common: 0.4, rare: 0.4, epic: 0.15, legendary: 0.05 }
    }
  ];

  pityCounter: number = 0;
  pityThreshold: number = 50; // 50抽保底

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameState = GameState.getInstance();
  }

  pull(poolId: string = 'standard'): Card | null {
    const pool = this.pools.find(p => p.id === poolId);
    if (!pool) return null;

    if (!this.gameState.spendResource('gold', pool.cost)) {
      this.showResult('金币不足！', 'common');
      return null;
    }

    this.pityCounter++;

    // 确定稀有度
    let rarity = this.determineRarity(pool);

    // 保底机制
    if (this.pityCounter >= this.pityThreshold) {
      rarity = 'legendary';
      this.pityCounter = 0;
    } else if (rarity === 'legendary' || rarity === 'epic') {
      this.pityCounter = 0;
    }

    // 生成宠物
    const pet = this.generatePet(rarity);
    this.gameState.addPet(pet);

    // 创建卡牌记录
    const card: Card = {
      id: `card_${Date.now()}`,
      name: pet.name,
      type: 'pet',
      rarity,
      data: pet
    };
    this.gameState.addCard(card);

    // 显示抽卡动画
    this.showGachaAnimation(card);

    return card;
  }

  determineRarity(pool: GachaPool): 'common' | 'rare' | 'epic' | 'legendary' {
    const roll = Math.random();
    let cumulative = 0;

    if (roll < (cumulative += pool.rates.legendary)) return 'legendary';
    if (roll < (cumulative += pool.rates.epic)) return 'epic';
    if (roll < (cumulative += pool.rates.rare)) return 'rare';
    return 'common';
  }

  generatePet(rarity: 'common' | 'rare' | 'epic' | 'legendary'): Pet {
    const names = PET_NAMES[rarity];
    const name = names[Math.floor(Math.random() * names.length)];

    const baseStats: Record<string, { attack: number; defense: number }> = {
      common: { attack: 5, defense: 3 },
      rare: { attack: 10, defense: 6 },
      epic: { attack: 20, defense: 12 },
      legendary: { attack: 40, defense: 25 }
    };

    const stats = baseStats[rarity];

    return {
      id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      rarity,
      level: 1,
      exp: 0,
      attack: stats.attack + Math.floor(Math.random() * 5),
      defense: stats.defense + Math.floor(Math.random() * 3)
    };
  }

  showGachaAnimation(card: Card) {
    const centerX = 400;
    const centerY = 300;

    // 背景遮罩
    const overlay = this.scene.add.rectangle(centerX, centerY, 800, 600, 0x000000, 0.8)
      .setScrollFactor(0).setDepth(200);

    // 卡牌
    const cardSprite = this.scene.add.sprite(centerX, centerY + 100, 'card')
      .setScrollFactor(0).setDepth(201).setScale(0);

    // 稀有度颜色
    const colors: Record<string, number> = {
      common: 0x9ca3af,
      rare: 0x60a5fa,
      epic: 0xa855f7,
      legendary: 0xfbbf24
    };
    cardSprite.setTint(colors[card.rarity]);

    // 动画
    this.scene.tweens.add({
      targets: cardSprite,
      scale: 2,
      y: centerY,
      duration: 500,
      ease: 'Back.easeOut'
    });

    // 名称文字
    const nameText = this.scene.add.text(centerX, centerY + 100, card.name, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(202).setAlpha(0);

    const rarityText = this.scene.add.text(centerX, centerY + 130, `★ ${card.rarity.toUpperCase()} ★`, {
      fontSize: '16px',
      color: `#${colors[card.rarity].toString(16)}`
    }).setOrigin(0.5).setScrollFactor(0).setDepth(202).setAlpha(0);

    this.scene.tweens.add({
      targets: [nameText, rarityText],
      alpha: 1,
      delay: 400,
      duration: 300
    });

    // 点击关闭
    overlay.setInteractive();
    overlay.once('pointerdown', () => {
      this.scene.tweens.add({
        targets: [overlay, cardSprite, nameText, rarityText],
        alpha: 0,
        duration: 200,
        onComplete: () => {
          overlay.destroy();
          cardSprite.destroy();
          nameText.destroy();
          rarityText.destroy();
        }
      });
    });
  }

  showResult(text: string, rarity: string) {
    const msg = this.scene.add.text(400, 300, text, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 15, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    this.scene.tweens.add({
      targets: msg,
      alpha: 0,
      duration: 1500,
      onComplete: () => msg.destroy()
    });
  }

  tenPull(poolId: string = 'standard'): Card[] {
    const results: Card[] = [];
    for (let i = 0; i < 10; i++) {
      const card = this.pull(poolId);
      if (card) results.push(card);
    }
    return results;
  }
}
