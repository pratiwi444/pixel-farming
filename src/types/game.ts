export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';
export type Weather = 'Sunny' | 'Cloudy' | 'Rainy';
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night';
export type Direction = 'up' | 'down' | 'left' | 'right';
export type ToolType = 'hoe' | 'watering_can' | 'axe' | 'pickaxe' | 'fishing_rod';
export type ItemCategory = 'Seeds' | 'Crops' | 'Animal Products' | 'Food' | 'Tools' | 'Materials' | 'Fish' | 'Miscellaneous';
export type MapArea = 'farm' | 'village' | 'forest' | 'lake' | 'house_interior';
export type GameScreen = 'main_menu' | 'character_creator' | 'playing' | 'paused' | 'credits';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  sellPrice: number;
  buyPrice?: number;
  stackable: boolean;
  maxStack?: number;
  toolType?: ToolType;
  seedCropId?: string;
  energyRestored?: number;
  iconType: string;
}

export interface InventorySlot {
  item: Item;
  quantity: number;
}

export interface CropDefinition {
  id: string;
  name: string;
  seedId: string;
  harvestItemId: string;
  growthDays: number;
  harvestYieldMin: number;
  harvestYieldMax: number;
  seedPrice: number;
  sellPrice: number;
  season: Season[];
  color: string;
}

export interface PlacedCrop {
  cropId: string;
  stage: number; // 0: sprout, 1: growing, 2: blooming, 3: ripe
  daysPlanted: number;
  isWatered: boolean;
  ripe: boolean;
}

export interface FarmTile {
  x: number;
  y: number;
  isTilled: boolean;
  isWatered: boolean;
  crop?: PlacedCrop;
  obstacle?: 'rock' | 'stump' | 'weed';
}

export type AnimalType = 'chicken' | 'cow' | 'sheep' | 'rabbit' | 'cat' | 'dog';

export interface Animal {
  id: string;
  type: AnimalType;
  name: string;
  x: number;
  y: number;
  dir: Direction;
  isMoving: boolean;
  happiness: number; // 0 - 100
  hunger: boolean;   // true if needs food
  isPetToday: boolean;
  productReady: boolean;
  daysAlive: number;
}

export interface NPCSchedule {
  hour: number;
  x: number;
  y: number;
  area: MapArea;
  activity: string;
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  portrait: string;
  x: number;
  y: number;
  dir: Direction;
  area: MapArea;
  friendship: number; // 0 - 100
  talkedToday: boolean;
  shopType?: 'general' | 'bakery' | 'carpenter' | 'botanist';
  defaultDialogue: string[];
  friendshipDialogue: {
    low: string[];
    med: string[];
    high: string[];
  };
}

export interface Quest {
  id: string;
  title: string;
  giverNpcId: string;
  description: string;
  targetItemId: string;
  targetQuantity: number;
  rewardCoins: number;
  rewardFriendship: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: { itemId: string; count: number }[];
  energyRestored: number;
  resultItemId: string;
  description: string;
}

export interface PlayerCustomization {
  name: string;
  gender: 'neutral' | 'girl' | 'boy';
  hairStyle: number;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  skinColor: string;
}

export interface PlayerState {
  x: number;
  y: number;
  dir: Direction;
  isMoving: boolean;
  energy: number;
  maxEnergy: number;
  money: number;
  activeHotbarIndex: number;
  customization: PlayerCustomization;
  area: MapArea;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  opacity: number;
  life: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'leaf' | 'rain' | 'sparkle' | 'heart' | 'smoke' | 'sweat';
}

export interface FishDefinition {
  id: string;
  name: string;
  sellPrice: number;
  difficulty: number; // 1 to 5
  color: string;
  description: string;
}

export interface GameSaveData {
  version: number;
  player: PlayerState;
  inventory: (InventorySlot | null)[];
  chest: (InventorySlot | null)[];
  farmTiles: Record<string, FarmTile>;
  animals: Animal[];
  npcs: Record<string, { friendship: number; talkedToday: boolean }>;
  quests: Quest[];
  day: number;
  season: Season;
  timeHour: number;
  timeMinute: number;
  weather: Weather;
  farmLevel: number;
  festivalAttended: boolean;
}
