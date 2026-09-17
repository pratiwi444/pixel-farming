import { GameSaveData, PlayerCustomization, InventorySlot } from '../../types/game';
import { ITEMS_DATABASE } from '../data/items';
import { NPCS_DATA, INITIAL_QUESTS } from '../data/npcs';

const SAVE_STORAGE_KEY = 'meadowlight_village_save_v1';

export class SaveSystem {
  public static hasSave(): boolean {
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      return !!raw;
    } catch {
      return false;
    }
  }

  public static loadSave(): GameSaveData | null {
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as GameSaveData;
      return data;
    } catch (err) {
      console.error('Failed to load save game:', err);
      return null;
    }
  }

  public static saveGame(data: GameSaveData): boolean {
    try {
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error('Failed to save game:', err);
      return false;
    }
  }

  public static deleteSave(): void {
    try {
      localStorage.removeItem(SAVE_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to remove save:', err);
    }
  }

  public static createNewGame(customization: PlayerCustomization): GameSaveData {
    // Starting Inventory: 24 slots (Hotbar is first 8 slots)
    const inventory: (InventorySlot | null)[] = new Array(24).fill(null);

    // Slot 0: Hoe
    inventory[0] = { item: ITEMS_DATABASE['tool_hoe'], quantity: 1 };
    // Slot 1: Watering Can
    inventory[1] = { item: ITEMS_DATABASE['tool_watering_can'], quantity: 1 };
    // Slot 2: Axe
    inventory[2] = { item: ITEMS_DATABASE['tool_axe'], quantity: 1 };
    // Slot 3: Pickaxe
    inventory[3] = { item: ITEMS_DATABASE['tool_pickaxe'], quantity: 1 };
    // Slot 4: Fishing Rod
    inventory[4] = { item: ITEMS_DATABASE['tool_fishing_rod'], quantity: 1 };
    // Slot 5: 3 Carrot Seeds
    inventory[5] = { item: ITEMS_DATABASE['seed_carrot'], quantity: 3 };
    // Slot 6: 3 Potato Seeds
    inventory[6] = { item: ITEMS_DATABASE['seed_potato'], quantity: 3 };

    // Chest Storage starts with empty slots (24 slots)
    const chest: (InventorySlot | null)[] = new Array(24).fill(null);

    // Initial NPCs state
    const npcs: Record<string, { friendship: number; talkedToday: boolean }> = {};
    for (const id of Object.keys(NPCS_DATA)) {
      npcs[id] = { friendship: 15, talkedToday: false };
    }

    // Initial Animals: 1 happy starting chicken + 1 companion dog!
    const animals = [
      {
        id: 'starting_chicken_1',
        type: 'chicken' as const,
        name: 'Pip',
        x: 21 * 32,
        y: 8 * 32,
        dir: 'down' as const,
        isMoving: false,
        happiness: 60,
        hunger: false,
        isPetToday: false,
        productReady: false,
        daysAlive: 1,
      },
      {
        id: 'starting_dog_1',
        type: 'dog' as const,
        name: 'Mochi',
        x: 8 * 32,
        y: 9 * 32,
        dir: 'down' as const,
        isMoving: false,
        happiness: 90,
        hunger: false,
        isPetToday: false,
        productReady: false,
        daysAlive: 1,
      },
    ];

    // Pre-tilled soil patch on farm for convenience
    const farmTiles: GameSaveData['farmTiles'] = {};
    // 3x2 initial tilled patch
    for (let ty = 9; ty <= 10; ty++) {
      for (let tx = 8; tx <= 11; tx++) {
        farmTiles[`${tx},${ty}`] = {
          x: tx,
          y: ty,
          isTilled: true,
          isWatered: false,
        };
      }
    }

    return {
      version: 1,
      player: {
        x: 7 * 32,
        y: 7.5 * 32, // in front of player house
        dir: 'down',
        isMoving: false,
        energy: 100,
        maxEnergy: 100,
        money: 100, // 100 starting coins
        activeHotbarIndex: 0,
        customization,
        area: 'farm',
      },
      inventory,
      chest,
      farmTiles,
      animals,
      npcs,
      quests: JSON.parse(JSON.stringify(INITIAL_QUESTS)),
      day: 1,
      season: 'Spring',
      timeHour: 6,
      timeMinute: 0,
      weather: 'Sunny',
      farmLevel: 1,
      festivalAttended: false,
    };
  }
}
