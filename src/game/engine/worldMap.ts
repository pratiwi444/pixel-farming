import { MapArea } from '../../types/game';

export interface MapTrigger {
  x: number;
  y: number;
  w: number;
  h: number;
  targetArea: MapArea;
  targetX: number;
  targetY: number;
  label: string;
}

export interface MapObject {
  id: string;
  type: 'house' | 'barn' | 'shipping_bin' | 'fountain' | 'tree' | 'rock' | 'stump' | 'berry_bush' | 'lantern' | 'bed' | 'kitchen' | 'chest' | 'fireplace';
  x: number;
  y: number;
  w: number;
  h: number;
  solid: boolean;
  solidBox?: { x: number; y: number; w: number; h: number };
  interactable?: boolean;
  interactPrompt?: string;
  interactAction?: string;
  customData?: Record<string, unknown>;
}

export interface AreaData {
  id: MapArea;
  name: string;
  width: number; // in tiles (e.g. 32)
  height: number; // in tiles (e.g. 24)
  tileSize: number; // 32 px
  tiles: string[][]; // tile ground type: 'grass', 'path', 'water', 'wood', 'sand'
  collision: boolean[][]; // true if solid
  objects: MapObject[];
  triggers: MapTrigger[];
}

export class WorldMapManager {
  private static areas: Record<MapArea, AreaData> | null = null;

  public static getAreas(): Record<MapArea, AreaData> {
    if (!this.areas) {
      this.areas = this.generateWorld();
    }
    return this.areas;
  }

  public static getArea(area: MapArea): AreaData {
    return this.getAreas()[area];
  }

  private static generateWorld(): Record<MapArea, AreaData> {
    const tileSize = 32;

    // --- 1. FARM AREA (30 x 24 tiles) ---
    const farmW = 30;
    const farmH = 24;
    const farmTiles: string[][] = [];
    const farmCollision: boolean[][] = [];

    for (let y = 0; y < farmH; y++) {
      farmTiles[y] = [];
      farmCollision[y] = [];
      for (let x = 0; x < farmW; x++) {
        // Default ground
        farmTiles[y][x] = 'grass';
        farmCollision[y][x] = false;

        // Bounds collision
        if (x === 0 || y === 0 || y === farmH - 1) {
          // Leave open exit at top (x=14..16) to Forest
          if (y === 0 && x >= 14 && x <= 16) {
            farmCollision[y][x] = false;
          } else {
            farmCollision[y][x] = true;
          }
        }
        if (x === farmW - 1) {
          // Leave open exit on right (y=10..13) to Village
          if (y >= 10 && y <= 13) {
            farmCollision[y][x] = false;
          } else {
            farmCollision[y][x] = true;
          }
        }
      }
    }

    // Cobblestone path from house to village and forest
    for (let x = 6; x < farmW; x++) {
      if (x <= 15) farmTiles[11][x] = 'path';
      if (x >= 14) farmTiles[11][x] = 'path';
      if (x >= 14) farmTiles[12][x] = 'path';
    }
    for (let y = 0; y <= 11; y++) {
      farmTiles[y][15] = 'path';
    }

    // Small pond on bottom-left of farm
    for (let py = 16; py <= 20; py++) {
      for (let px = 2; px <= 7; px++) {
        farmTiles[py][px] = 'water';
        farmCollision[py][px] = true;
      }
    }

    const farmObjects: MapObject[] = [
      // Player House (4x3 tiles at x=5, y=3)
      {
        id: 'player_house',
        type: 'house',
        x: 5 * tileSize,
        y: 3 * tileSize,
        w: 4 * tileSize,
        h: 3.5 * tileSize,
        solid: true,
        solidBox: { x: 5 * tileSize, y: 4.5 * tileSize, w: 4 * tileSize, h: 2 * tileSize },
      },
      // Shipping Bin (near house path)
      {
        id: 'farm_shipping_bin',
        type: 'shipping_bin',
        x: 10 * tileSize,
        y: 6 * tileSize,
        w: tileSize,
        h: tileSize,
        solid: true,
        interactable: true,
        interactPrompt: 'Shipping Bin (Jual Item)',
        interactAction: 'shipping_bin',
      },
      // Animal Barn / Coop (at x=20, y=3)
      {
        id: 'farm_barn',
        type: 'barn',
        x: 20 * tileSize,
        y: 3 * tileSize,
        w: 5 * tileSize,
        h: 3.5 * tileSize,
        solid: true,
        solidBox: { x: 20 * tileSize, y: 4.5 * tileSize, w: 5 * tileSize, h: 2 * tileSize },
      },
      // Farm Trees
      { id: 'tree_1', type: 'tree', x: 2 * tileSize, y: 8 * tileSize, w: tileSize, h: tileSize, solid: true },
      { id: 'tree_2', type: 'tree', x: 18 * tileSize, y: 18 * tileSize, w: tileSize, h: tileSize, solid: true },
      { id: 'tree_3', type: 'tree', x: 24 * tileSize, y: 19 * tileSize, w: tileSize, h: tileSize, solid: true },
      // Farm Rocks & Stumps for clearing
      { id: 'rock_1', type: 'rock', x: 10 * tileSize, y: 14 * tileSize, w: tileSize, h: tileSize, solid: true, interactable: true, interactAction: 'mine_rock' },
      { id: 'rock_2', type: 'rock', x: 22 * tileSize, y: 15 * tileSize, w: tileSize, h: tileSize, solid: true, interactable: true, interactAction: 'mine_rock' },
      { id: 'stump_1', type: 'stump', x: 11 * tileSize, y: 18 * tileSize, w: tileSize, h: tileSize, solid: true, interactable: true, interactAction: 'chop_stump' },
      // Lantern
      { id: 'lantern_farm', type: 'lantern', x: 9 * tileSize, y: 6 * tileSize, w: tileSize, h: tileSize, solid: false },
    ];

    const farmTriggers: MapTrigger[] = [
      // Door into Player House
      {
        x: 6.5 * tileSize,
        y: 6.2 * tileSize,
        w: tileSize,
        h: 0.6 * tileSize,
        targetArea: 'house_interior',
        targetX: 8 * tileSize,
        targetY: 10 * tileSize,
        label: 'Masuk Rumah',
      },
      // Exit North to Forest
      {
        x: 14 * tileSize,
        y: 0,
        w: 3 * tileSize,
        h: tileSize,
        targetArea: 'forest',
        targetX: 15 * tileSize,
        targetY: 22 * tileSize,
        label: 'Menuju Hutan',
      },
      // Exit East to Village
      {
        x: (farmW - 1) * tileSize,
        y: 10 * tileSize,
        w: tileSize,
        h: 4 * tileSize,
        targetArea: 'village',
        targetX: 2 * tileSize,
        targetY: 12 * tileSize,
        label: 'Menuju Desa',
      },
    ];

    // --- 2. MEADOW VILLAGE (36 x 26 tiles) ---
    const vilW = 36;
    const vilH = 26;
    const vilTiles: string[][] = [];
    const vilCollision: boolean[][] = [];

    for (let y = 0; y < vilH; y++) {
      vilTiles[y] = [];
      vilCollision[y] = [];
      for (let x = 0; x < vilW; x++) {
        vilTiles[y][x] = 'grass';
        vilCollision[y][x] = false;

        // Perimeter bounds
        if (y === 0 || y === vilH - 1 || x === vilW - 1) {
          // Bottom-right exit to Lake (x=28..31, y=vilH-1)
          if (y === vilH - 1 && x >= 28 && x <= 31) {
            vilCollision[y][x] = false;
          } else {
            vilCollision[y][x] = true;
          }
        }
        if (x === 0) {
          // West exit back to Farm (y=10..14)
          if (y >= 10 && y <= 14) {
            vilCollision[y][x] = false;
          } else {
            vilCollision[y][x] = true;
          }
        }
      }
    }

    // Plaza & stone paths in Village
    for (let py = 9; py <= 15; py++) {
      for (let px = 15; px <= 23; px++) {
        vilTiles[py][px] = 'path';
      }
    }
    // Cross pathways
    for (let px = 0; px < vilW; px++) {
      vilTiles[12][px] = 'path';
      vilTiles[13][px] = 'path';
    }
    for (let py = 3; py < vilH; py++) {
      vilTiles[py][18] = 'path';
      vilTiles[py][19] = 'path';
      if (py >= 14) {
        vilTiles[py][30] = 'path';
      }
    }

    const vilObjects: MapObject[] = [
      // Central Fountain
      {
        id: 'fountain_village',
        type: 'fountain',
        x: 18 * tileSize - 16,
        y: 11 * tileSize,
        w: 2 * tileSize + 32,
        h: 2 * tileSize,
        solid: true,
      },
      // Mira's General Store (x=12, y=4, w=5, h=3)
      {
        id: 'shop_mira',
        type: 'house',
        x: 11 * tileSize,
        y: 4 * tileSize,
        w: 5 * tileSize,
        h: 3.5 * tileSize,
        solid: true,
        solidBox: { x: 11 * tileSize, y: 5.5 * tileSize, w: 5 * tileSize, h: 2 * tileSize },
      },
      // Theo's Workshop (x=25, y=4, w=5, h=3)
      {
        id: 'shop_theo',
        type: 'house',
        x: 25 * tileSize,
        y: 4 * tileSize,
        w: 5 * tileSize,
        h: 3.5 * tileSize,
        solid: true,
        solidBox: { x: 25 * tileSize, y: 5.5 * tileSize, w: 5 * tileSize, h: 2 * tileSize },
      },
      // Lily's Bakery (x=6, y=16, w=5, h=3)
      {
        id: 'shop_lily',
        type: 'house',
        x: 6 * tileSize,
        y: 16 * tileSize,
        w: 5 * tileSize,
        h: 3.5 * tileSize,
        solid: true,
        solidBox: { x: 6 * tileSize, y: 17.5 * tileSize, w: 5 * tileSize, h: 2 * tileSize },
      },
      // Town Hall (x=16, y=1, w=6, h=3)
      {
        id: 'town_hall',
        type: 'house',
        x: 16 * tileSize,
        y: 1 * tileSize,
        w: 6 * tileSize,
        h: 3.5 * tileSize,
        solid: true,
        solidBox: { x: 16 * tileSize, y: 2.5 * tileSize, w: 6 * tileSize, h: 2 * tileSize },
      },
      // Streetlamps
      { id: 'lamp_1', type: 'lantern', x: 14 * tileSize, y: 9 * tileSize, w: tileSize, h: tileSize, solid: false },
      { id: 'lamp_2', type: 'lantern', x: 24 * tileSize, y: 9 * tileSize, w: tileSize, h: tileSize, solid: false },
      { id: 'lamp_3', type: 'lantern', x: 14 * tileSize, y: 15 * tileSize, w: tileSize, h: tileSize, solid: false },
      { id: 'lamp_4', type: 'lantern', x: 24 * tileSize, y: 15 * tileSize, w: tileSize, h: tileSize, solid: false },
    ];

    const vilTriggers: MapTrigger[] = [
      // Exit West to Farm
      {
        x: 0,
        y: 10 * tileSize,
        w: tileSize,
        h: 4 * tileSize,
        targetArea: 'farm',
        targetX: 28 * tileSize,
        targetY: 11 * tileSize,
        label: 'Menuju Kebun',
      },
      // Exit South-East to Lake
      {
        x: 28 * tileSize,
        y: (vilH - 1) * tileSize,
        w: 4 * tileSize,
        h: tileSize,
        targetArea: 'lake',
        targetX: 16 * tileSize,
        targetY: 2 * tileSize,
        label: 'Menuju Danau',
      },
    ];

    // --- 3. FOREST AREA (30 x 26 tiles) ---
    const forW = 30;
    const forH = 26;
    const forTiles: string[][] = [];
    const forCollision: boolean[][] = [];

    for (let y = 0; y < forH; y++) {
      forTiles[y] = [];
      forCollision[y] = [];
      for (let x = 0; x < forW; x++) {
        forTiles[y][x] = 'grass';
        forCollision[y][x] = false;

        // Perimeter
        if (x === 0 || y === 0 || x === forW - 1) {
          forCollision[y][x] = true;
        }
        if (y === forH - 1) {
          // South exit back to Farm (x=14..16)
          if (x >= 14 && x <= 16) {
            forCollision[y][x] = false;
          } else {
            forCollision[y][x] = true;
          }
        }
      }
    }

    // Forest dirt trail
    for (let y = 6; y < forH; y++) {
      forTiles[y][15] = 'path';
    }
    for (let x = 6; x <= 24; x++) {
      forTiles[12][x] = 'path';
    }

    // Small forest creek
    for (let y = 0; y < forH; y++) {
      const cx = 5 + Math.floor(Math.sin(y * 0.4) * 2);
      forTiles[y][cx] = 'water';
      forTiles[y][cx + 1] = 'water';
      forCollision[y][cx] = true;
      forCollision[y][cx + 1] = true;
    }
    // Wooden bridge over creek
    forTiles[12][4] = 'wood';
    forTiles[12][5] = 'wood';
    forTiles[12][6] = 'wood';
    forTiles[12][7] = 'wood';
    forCollision[12][5] = false;
    forCollision[12][6] = false;

    const forObjects: MapObject[] = [
      // Berry Bushes
      { id: 'bush_1', type: 'berry_bush', x: 10 * tileSize, y: 8 * tileSize, w: tileSize, h: tileSize, solid: true, interactable: true, interactPrompt: 'Petik Berry', interactAction: 'pick_berry', customData: { hasBerry: true } },
      { id: 'bush_2', type: 'berry_bush', x: 22 * tileSize, y: 7 * tileSize, w: tileSize, h: tileSize, solid: true, interactable: true, interactPrompt: 'Petik Berry', interactAction: 'pick_berry', customData: { hasBerry: true } },
      { id: 'bush_3', type: 'berry_bush', x: 24 * tileSize, y: 16 * tileSize, w: tileSize, h: tileSize, solid: true, interactable: true, interactAction: 'pick_berry', customData: { hasBerry: true } },
      // Choppable Trees
      { id: 'tree_f1', type: 'tree', x: 9 * tileSize, y: 15 * tileSize, w: tileSize, h: tileSize, solid: true },
      { id: 'tree_f2', type: 'tree', x: 12 * tileSize, y: 18 * tileSize, w: tileSize, h: tileSize, solid: true },
      { id: 'tree_f3', type: 'tree', x: 19 * tileSize, y: 14 * tileSize, w: tileSize, h: tileSize, solid: true },
      { id: 'tree_f4', type: 'tree', x: 22 * tileSize, y: 20 * tileSize, w: tileSize, h: tileSize, solid: true },
      { id: 'tree_f5', type: 'tree', x: 17 * tileSize, y: 6 * tileSize, w: tileSize, h: tileSize, solid: true },
      // Forest Stumps & Rocks
      { id: 'stump_f1', type: 'stump', x: 18 * tileSize, y: 9 * tileSize, w: tileSize, h: tileSize, solid: true, interactable: true, interactAction: 'chop_stump' },
      { id: 'rock_f1', type: 'rock', x: 12 * tileSize, y: 10 * tileSize, w: tileSize, h: tileSize, solid: true, interactable: true, interactAction: 'mine_rock' },
    ];

    const forTriggers: MapTrigger[] = [
      {
        x: 14 * tileSize,
        y: (forH - 1) * tileSize,
        w: 3 * tileSize,
        h: tileSize,
        targetArea: 'farm',
        targetX: 15 * tileSize,
        targetY: 2 * tileSize,
        label: 'Menuju Kebun',
      },
    ];

    // --- 4. LAKE AREA (32 x 24 tiles) ---
    const lakW = 32;
    const lakH = 24;
    const lakTiles: string[][] = [];
    const lakCollision: boolean[][] = [];

    for (let y = 0; y < lakH; y++) {
      lakTiles[y] = [];
      lakCollision[y] = [];
      for (let x = 0; x < lakW; x++) {
        // Most of lake area is water
        if (y >= 6 && x >= 4 && x <= lakW - 4 && y <= lakH - 3) {
          lakTiles[y][x] = 'water';
          lakCollision[y][x] = true;
        } else {
          lakTiles[y][x] = 'grass';
          lakCollision[y][x] = false;
        }

        // Perimeter
        if (x === 0 || y === 0 || y === lakH - 1 || x === lakW - 1) {
          // Top exit to Village (x=14..18)
          if (y === 0 && x >= 14 && x <= 18) {
            lakCollision[y][x] = false;
          } else {
            forCollision[y][x] = true;
          }
        }
      }
    }

    // Wooden Fishing Dock extending into the lake
    for (let dy = 5; dy <= 12; dy++) {
      for (let dx = 15; dx <= 17; dx++) {
        lakTiles[dy][dx] = 'wood';
        lakCollision[dy][dx] = false; // Walkable wooden pier
      }
    }
    // Pier end platform
    for (let dy = 12; dy <= 14; dy++) {
      for (let dx = 14; dx <= 18; dx++) {
        lakTiles[dy][dx] = 'wood';
        lakCollision[dy][dx] = false;
      }
    }

    const lakObjects: MapObject[] = [
      { id: 'lamp_lake', type: 'lantern', x: 14 * tileSize, y: 4 * tileSize, w: tileSize, h: tileSize, solid: false },
      { id: 'tree_l1', type: 'tree', x: 6 * tileSize, y: 2 * tileSize, w: tileSize, h: tileSize, solid: true },
      { id: 'tree_l2', type: 'tree', x: 26 * tileSize, y: 2 * tileSize, w: tileSize, h: tileSize, solid: true },
    ];

    const lakTriggers: MapTrigger[] = [
      {
        x: 14 * tileSize,
        y: 0,
        w: 5 * tileSize,
        h: tileSize,
        targetArea: 'village',
        targetX: 29 * tileSize,
        targetY: 23 * tileSize,
        label: 'Menuju Desa',
      },
    ];

    // --- 5. HOUSE INTERIOR (16 x 14 tiles) ---
    const hseW = 16;
    const hseH = 14;
    const hseTiles: string[][] = [];
    const hseCollision: boolean[][] = [];

    for (let y = 0; y < hseH; y++) {
      hseTiles[y] = [];
      hseCollision[y] = [];
      for (let x = 0; x < hseW; x++) {
        // Wooden floor interior
        hseTiles[y][x] = 'wood';
        hseCollision[y][x] = false;

        // Walls around edges
        if (x <= 1 || x >= hseW - 2 || y <= 2 || y >= hseH - 2) {
          hseCollision[y][x] = true;
        }
      }
    }
    // Doorway opening at bottom
    hseCollision[hseH - 2][7] = false;
    hseCollision[hseH - 2][8] = false;

    const hseObjects: MapObject[] = [
      // Cozy Bed (x=3, y=4)
      {
        id: 'house_bed',
        type: 'bed',
        x: 3 * tileSize,
        y: 4 * tileSize,
        w: 2 * tileSize,
        h: 2.5 * tileSize,
        solid: true,
        interactable: true,
        interactPrompt: 'Tidur (Akhiri Hari)',
        interactAction: 'sleep',
      },
      // Kitchen Stove (x=11, y=3)
      {
        id: 'house_kitchen',
        type: 'kitchen',
        x: 10 * tileSize,
        y: 3 * tileSize,
        w: 3 * tileSize,
        h: 2 * tileSize,
        solid: true,
        interactable: true,
        interactPrompt: 'Memasak (Dapur)',
        interactAction: 'cooking',
      },
      // Storage Chest (x=6, y=3)
      {
        id: 'house_chest',
        type: 'chest',
        x: 6 * tileSize,
        y: 3 * tileSize,
        w: tileSize,
        h: tileSize,
        solid: true,
        interactable: true,
        interactPrompt: 'Buka Peti Penyimpanan',
        interactAction: 'storage_chest',
      },
      // Fireplace (x=8, y=3)
      {
        id: 'house_fireplace',
        type: 'fireplace',
        x: 8 * tileSize,
        y: 3 * tileSize,
        w: 2 * tileSize,
        h: 2 * tileSize,
        solid: true,
      },
    ];

    const hseTriggers: MapTrigger[] = [
      {
        x: 7 * tileSize,
        y: (hseH - 2) * tileSize,
        w: 2 * tileSize,
        h: tileSize,
        targetArea: 'farm',
        targetX: 7 * tileSize,
        targetY: 7.2 * tileSize,
        label: 'Keluar Rumah',
      },
    ];

    return {
      farm: {
        id: 'farm',
        name: 'Meadow Farm',
        width: farmW,
        height: farmH,
        tileSize,
        tiles: farmTiles,
        collision: farmCollision,
        objects: farmObjects,
        triggers: farmTriggers,
      },
      village: {
        id: 'village',
        name: 'Meadowlight Village',
        width: vilW,
        height: vilH,
        tileSize,
        tiles: vilTiles,
        collision: vilCollision,
        objects: vilObjects,
        triggers: vilTriggers,
      },
      forest: {
        id: 'forest',
        name: 'Whispering Woods',
        width: forW,
        height: forH,
        tileSize,
        tiles: forTiles,
        collision: forCollision,
        objects: forObjects,
        triggers: forTriggers,
      },
      lake: {
        id: 'lake',
        name: 'Silverlake Dock',
        width: lakW,
        height: lakH,
        tileSize,
        tiles: lakTiles,
        collision: lakCollision,
        objects: lakObjects,
        triggers: lakTriggers,
      },
      house_interior: {
        id: 'house_interior',
        name: 'Farmhouse Cozy Interior',
        width: hseW,
        height: hseH,
        tileSize,
        tiles: hseTiles,
        collision: hseCollision,
        objects: hseObjects,
        triggers: hseTriggers,
      },
    };
  }
}
