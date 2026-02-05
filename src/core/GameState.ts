import Phaser from 'phaser';

export interface Resources {
  gold: number;
  wood: number;
  stone: number;
  seeds: number;
  food: number;
  crystal: number;
}

export interface Pet {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  level: number;
  exp: number;
  attack: number;
  defense: number;
  speed?: number;
  type?: 'fire' | 'water' | 'grass' | 'thunder' | 'normal';
  isStarter?: boolean;
  equipment?: PetEquipment;
}

export interface PetEquipment {
  weapon?: Item;
  armor?: Item;
  accessory?: Item;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'potion' | 'material';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats?: { attack?: number; defense?: number; speed?: number };
  effect?: string;
}

export interface Talent {
  id: string;
  name: string;
  role: 'farmer' | 'researcher' | 'trainer' | 'builder';
  level: number;
  efficiency: number;
}

export interface BaseBuilding {
  id: string;
  type: 'petHouse' | 'farm' | 'lab' | 'workshop' | 'recruitCenter';
  level: number;
  position: { x: number; y: number };
  assignedTalent?: Talent;
}

export interface Card {
  id: string;
  name: string;
  type: 'pet' | 'item' | 'buff';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  data: any;
}

export class GameState extends Phaser.Events.EventEmitter {
  private static instance: GameState;

  // 玩家信息
  playerName: string = '';
  starterPetId: string = '';

  // 资源
  resources: Resources = {
    gold: 100,
    wood: 50,
    stone: 30,
    seeds: 10,
    food: 20,
    crystal: 0
  };

  // 收集
  pets: Pet[] = [];
  cards: Card[] = [];
  items: Item[] = [];
  talents: Talent[] = [];

  // 基地
  baseBuildings: BaseBuilding[] = [];
  baseLevel: number = 1;

  // 游戏状态
  currentAction: string = 'plant';
  dayTime: number = 0;
  day: number = 1;

  // 研究进度
  researchProgress: Map<string, number> = new Map();

  private constructor() {
    super();
  }

  static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  addResource(type: keyof Resources, amount: number) {
    this.resources[type] += amount;
    this.emit('resourceChanged', type, this.resources[type]);
  }

  spendResource(type: keyof Resources, amount: number): boolean {
    if (this.resources[type] >= amount) {
      this.resources[type] -= amount;
      this.emit('resourceChanged', type, this.resources[type]);
      return true;
    }
    return false;
  }

  addPet(pet: Pet) {
    this.pets.push(pet);
    this.emit('petAdded', pet);
  }

  addCard(card: Card) {
    this.cards.push(card);
    this.emit('cardAdded', card);
  }

  addItem(item: Item) {
    this.items.push(item);
    this.emit('itemAdded', item);
  }

  addTalent(talent: Talent) {
    this.talents.push(talent);
    this.emit('talentAdded', talent);
  }

  addBuilding(building: BaseBuilding) {
    this.baseBuildings.push(building);
    this.emit('buildingAdded', building);
  }

  getStarterPet(): Pet | undefined {
    return this.pets.find(p => p.id === this.starterPetId);
  }

  save(): string {
    return JSON.stringify({
      playerName: this.playerName,
      starterPetId: this.starterPetId,
      resources: this.resources,
      pets: this.pets,
      cards: this.cards,
      items: this.items,
      talents: this.talents,
      baseBuildings: this.baseBuildings,
      baseLevel: this.baseLevel,
      day: this.day
    });
  }

  load(data: string) {
    const parsed = JSON.parse(data);
    this.playerName = parsed.playerName;
    this.starterPetId = parsed.starterPetId;
    this.resources = parsed.resources;
    this.pets = parsed.pets;
    this.cards = parsed.cards;
    this.items = parsed.items || [];
    this.talents = parsed.talents || [];
    this.baseBuildings = parsed.baseBuildings || [];
    this.baseLevel = parsed.baseLevel || 1;
    this.day = parsed.day;
    this.emit('loaded');
  }
}
