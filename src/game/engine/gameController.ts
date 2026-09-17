import {
  Animal,
  Direction,
  FarmTile,
  FloatingText,
  GameSaveData,
  InventorySlot,
  MapArea,
  Particle,
  PlacedCrop,
  Season,
  ToolType,
  Weather
} from '../../types/game';
import { CROP_DEFINITIONS, ITEMS_DATABASE } from '../data/items';
import { soundManager } from '../audio/soundManager';
import { SaveSystem } from './saveSystem';
import { WorldMapManager } from './worldMap';

export type GameModalType =
  | 'none'
  | 'inventory'
  | 'dialogue'
  | 'shop'
  | 'fishing'
  | 'cooking'
  | 'chest'
  | 'quests'
  | 'map'
  | 'pause'
  | 'sleep_confirm'
  | 'shipping_bin';

export class GameController {
  public data: GameSaveData;
  public activeModal: GameModalType = 'none';
  public modalData: Record<string, unknown> = {};

  // Action states
  public isToolSwinging: boolean = false;
  public toolSwingTimer: number = 0;
  public floatingTexts: FloatingText[] = [];
  public particles: Particle[] = [];

  // Callbacks for UI sync
  private onStateChange: (() => void) | null = null;
  private animTick: number = 0;
  private timeAccumulator: number = 0;

  constructor(initialData: GameSaveData, onStateChange?: () => void) {
    this.data = initialData;
    this.onStateChange = onStateChange || null;
  }

  public setListener(cb: () => void) {
    this.onStateChange = cb;
  }

  private notify() {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }

  public getAnimTick(): number {
    return this.animTick;
  }

  // --- Interaction Target Detection ---

  public getFacingTileCoords(): { tx: number; ty: number; frontX: number; frontY: number } {
    const tileSize = 32;
    const px = this.data.player.x + 16;
    const py = this.data.player.y + 20;

    let fx = px;
    let fy = py;
    const dist = 28;

    switch (this.data.player.dir) {
      case 'up': fy -= dist; break;
      case 'down': fy += dist; break;
      case 'left': fx -= dist; break;
      case 'right': fx += dist; break;
    }

    return {
      tx: Math.floor(fx / tileSize),
      ty: Math.floor(fy / tileSize),
      frontX: fx,
      frontY: fy,
    };
  }

  // --- Movement & Collision ---

  public movePlayer(dx: number, dy: number, dt: number) {
    if (this.activeModal !== 'none') return;

    const speed = 130; // px per second
    const moveX = dx * speed * (dt / 1000);
    const moveY = dy * speed * (dt / 1000);

    if (dx !== 0 || dy !== 0) {
      this.data.player.isMoving = true;
      if (Math.abs(dx) > Math.abs(dy)) {
        this.data.player.dir = dx > 0 ? 'right' : 'left';
      } else {
        this.data.player.dir = dy > 0 ? 'down' : 'up';
      }
    } else {
      this.data.player.isMoving = false;
      return;
    }

    // Attempt X movement with collision
    const newX = this.data.player.x + moveX;
    if (!this.checkPlayerCollision(newX, this.data.player.y)) {
      this.data.player.x = newX;
    }

    // Attempt Y movement with collision
    const newY = this.data.player.y + moveY;
    if (!this.checkPlayerCollision(this.data.player.x, newY)) {
      this.data.player.y = newY;
    }

    // Check map transition triggers
    this.checkMapTriggers();

    // Occasional footstep sound
    if (Math.random() < 0.08) {
      soundManager.playFootstep();
    }
  }

  private checkPlayerCollision(targetX: number, targetY: number): boolean {
    const area = WorldMapManager.getArea(this.data.player.area);
    if (!area) return false;

    // Player collision bounding box (centered on bottom half)
    const box = {
      x: targetX + 8,
      y: targetY + 16,
      w: 16,
      h: 14,
    };

    // 1. Check world bounds & tile collision
    const minTx = Math.max(0, Math.floor(box.x / area.tileSize));
    const maxTx = Math.min(area.width - 1, Math.floor((box.x + box.w) / area.tileSize));
    const minTy = Math.max(0, Math.floor(box.y / area.tileSize));
    const maxTy = Math.min(area.height - 1, Math.floor((box.y + box.h) / area.tileSize));

    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        if (area.collision[ty]?.[tx]) {
          return true; // Collided with solid tile
        }
      }
    }

    // 2. Check solid map objects
    for (const obj of area.objects) {
      if (!obj.solid) continue;
      const sBox = obj.solidBox || { x: obj.x, y: obj.y, w: obj.w, h: obj.h };
      if (
        box.x < sBox.x + sBox.w &&
        box.x + box.w > sBox.x &&
        box.y < sBox.y + sBox.h &&
        box.y + box.h > sBox.y
      ) {
        return true;
      }
    }

    return false;
  }

  private checkMapTriggers() {
    const area = WorldMapManager.getArea(this.data.player.area);
    if (!area) return;

    const px = this.data.player.x + 16;
    const py = this.data.player.y + 24;

    for (const trig of area.triggers) {
      if (
        px >= trig.x &&
        px <= trig.x + trig.w &&
        py >= trig.y &&
        py <= trig.y + trig.h
      ) {
        // Trigger area transition!
        this.transitionArea(trig.targetArea, trig.targetX, trig.targetY);
        this.addFloatingText(trig.label, this.data.player.x, this.data.player.y - 10, '#fefae0');
        break;
      }
    }
  }

  public transitionArea(targetArea: MapArea, targetX: number, targetY: number) {
    this.data.player.area = targetArea;
    this.data.player.x = targetX;
    this.data.player.y = targetY;
    this.data.player.isMoving = false;
    soundManager.playUiClick();
    this.notify();
  }

  // --- Primary Action (Space / Left Click / Hotbar Tool Use) ---

  public useActiveItem() {
    if (this.activeModal !== 'none') return;
    if (this.data.player.energy <= 0) {
      this.addFloatingText('Terlalu Lelah! Butuh Istirahat.', this.data.player.x, this.data.player.y - 20, '#e63946');
      return;
    }

    const activeSlot = this.data.inventory[this.data.player.activeHotbarIndex];
    const { tx, ty, frontX, frontY } = this.getFacingTileCoords();

    this.isToolSwinging = true;
    this.toolSwingTimer = 180; // ms

    // Case A: Using Tool
    if (activeSlot?.item.category === 'Tools') {
      const tool = activeSlot.item.toolType;
      this.handleToolAction(tool, tx, ty, frontX, frontY);
      return;
    }

    // Case B: Planting Seeds
    if (activeSlot?.item.category === 'Seeds' && activeSlot.item.seedCropId) {
      this.handlePlantSeed(activeSlot, tx, ty);
      return;
    }

    // Case C: Eating Food
    if (activeSlot?.item.category === 'Food' && activeSlot.item.energyRestored) {
      this.handleEatFood(activeSlot);
      return;
    }

    // Default: Check if interacting with crop in front
    this.interact();
  }

  private handleToolAction(
    tool: ToolType | undefined,
    tx: number,
    ty: number,
    frontX: number,
    frontY: number
  ) {
    if (!tool) return;
    const tileKey = `${tx},${ty}`;

    switch (tool) {
      case 'hoe': {
        // Can till grass into farmland on Farm
        if (this.data.player.area !== 'farm') {
          this.addFloatingText('Hanya bisa mencangkul di Kebun!', frontX, frontY, '#f4a261');
          return;
        }
        if (ty < 5 || ty > 22 || tx < 1 || tx > 28) return; // farm playable bounds

        const existing = this.data.farmTiles[tileKey] || { x: tx, y: ty, isTilled: false, isWatered: false };
        if (!existing.isTilled) {
          existing.isTilled = true;
          this.data.farmTiles[tileKey] = existing;
          this.consumeEnergy(5);
          soundManager.playHoe();
          this.addFloatingText('Tanah Dicangkul!', frontX, frontY, '#d4a373');
          this.spawnDirtParticles(frontX, frontY);
          this.notify();
        }
        break;
      }

      case 'watering_can': {
        // Waters tilled farmland
        if (this.data.player.area !== 'farm') return;
        const tile = this.data.farmTiles[tileKey];
        if (tile && tile.isTilled && !tile.isWatered) {
          tile.isWatered = true;
          this.consumeEnergy(2);
          soundManager.playWater();
          this.addFloatingText('Disiram! 💧', frontX, frontY, '#48cae4');
          this.spawnWaterParticles(frontX, frontY);
          this.notify();
        } else {
          soundManager.playWater();
        }
        break;
      }

      case 'axe': {
        // Chops trees or stumps in Farm/Forest
        const chopped = this.tryChopObstacle(frontX, frontY);
        if (chopped) {
          this.consumeEnergy(6);
          soundManager.playAxe();
          this.addItemToInventory(ITEMS_DATABASE['mat_wood'], 3);
          this.addFloatingText('+3 Kayu (Wood)', frontX, frontY, '#d4a373');
          this.notify();
        } else {
          soundManager.playAxe();
        }
        break;
      }

      case 'pickaxe': {
        // Breaks rocks for stone
        const mined = this.tryMineRock(frontX, frontY);
        if (mined) {
          this.consumeEnergy(6);
          soundManager.playPickaxe();
          this.addItemToInventory(ITEMS_DATABASE['mat_stone'], 2);
          this.addFloatingText('+2 Batu (Stone)', frontX, frontY, '#adb5bd');
          this.notify();
        } else {
          soundManager.playPickaxe();
        }
        break;
      }

      case 'fishing_rod': {
        // Check if facing water in Farm or Lake
        const area = WorldMapManager.getArea(this.data.player.area);
        if (area && area.tiles[ty]?.[tx] === 'water') {
          this.consumeEnergy(5);
          this.startFishingSequence();
        } else {
          this.addFloatingText('Arahkan ke air untuk memancing!', frontX, frontY, '#f4a261');
        }
        break;
      }
    }
  }

  private handlePlantSeed(slot: InventorySlot, tx: number, ty: number) {
    if (this.data.player.area !== 'farm') {
      this.addFloatingText('Hanya bisa menanam di Kebun!', tx * 32, ty * 32, '#f4a261');
      return;
    }

    const tileKey = `${tx},${ty}`;
    const tile = this.data.farmTiles[tileKey];

    if (!tile || !tile.isTilled) {
      this.addFloatingText('Cangkul tanah dulu!', tx * 32, ty * 32, '#f4a261');
      return;
    }

    if (tile.crop) {
      this.addFloatingText('Sudah ada tanaman!', tx * 32, ty * 32, '#f4a261');
      return;
    }

    const cropId = slot.item.seedCropId;
    if (!cropId) return;

    tile.crop = {
      cropId,
      stage: 0,
      daysPlanted: 0,
      isWatered: tile.isWatered,
      ripe: false,
    };

    // Deduct seed
    slot.quantity--;
    if (slot.quantity <= 0) {
      this.data.inventory[this.data.player.activeHotbarIndex] = null;
    }

    soundManager.playHoe();
    this.addFloatingText(`Menanam ${slot.item.name}! 🌱`, tx * 32, ty * 32, '#52b788');
    this.notify();
  }

  private handleEatFood(slot: InventorySlot) {
    const energy = slot.item.energyRestored || 20;
    this.restoreEnergy(energy);
    slot.quantity--;
    if (slot.quantity <= 0) {
      this.data.inventory[this.data.player.activeHotbarIndex] = null;
    }
    soundManager.playHarvest();
    this.addFloatingText(`+${energy} Energi! 🍲`, this.data.player.x, this.data.player.y - 15, '#52b788');
    this.notify();
  }

  // --- Interaction (Key: E or Tap) ---

  public interact() {
    if (this.activeModal !== 'none') return;
    const { tx, ty, frontX, frontY } = this.getFacingTileCoords();
    const tileKey = `${tx},${ty}`;

    // 1. Check Harvestable Crop on Farm
    if (this.data.player.area === 'farm') {
      const tile = this.data.farmTiles[tileKey];
      if (tile?.crop && tile.crop.ripe) {
        this.harvestCrop(tile);
        return;
      }
    }

    // 2. Check Animals nearby (Petting / Collecting eggs, milk, wool)
    for (const animal of this.data.animals) {
      const dist = Math.hypot(animal.x - frontX, animal.y - frontY);
      if (dist < 40) {
        this.interactWithAnimal(animal);
        return;
      }
    }

    // 3. Check NPCs nearby in current area
    const area = this.data.player.area;
    for (const [npcId, npcData] of Object.entries(this.data.npcs)) {
      // Find npc in world map area
      if (npcId === 'mira' && area === 'village' && Math.hypot(14 * 32 - frontX, 12 * 32 - frontY) < 45) {
        this.openDialogue('mira');
        return;
      }
      if (npcId === 'theo' && area === 'village' && Math.hypot(26 * 32 - frontX, 10 * 32 - frontY) < 45) {
        this.openDialogue('theo');
        return;
      }
      if (npcId === 'lily' && area === 'village' && Math.hypot(8 * 32 - frontX, 18 * 32 - frontY) < 45) {
        this.openDialogue('lily');
        return;
      }
      if (npcId === 'rowan' && area === 'village' && Math.hypot(20 * 32 - frontX, 6 * 32 - frontY) < 45) {
        this.openDialogue('rowan');
        return;
      }
      if (npcId === 'nia' && area === 'village' && Math.hypot(18 * 32 - frontX, 22 * 32 - frontY) < 45) {
        this.openDialogue('nia');
        return;
      }
    }

    // 4. Check Map Objects (Bed, Kitchen, Chest, Shipping Bin, Berry Bush)
    const mapArea = WorldMapManager.getArea(this.data.player.area);
    if (mapArea) {
      for (const obj of mapArea.objects) {
        if (!obj.interactable) continue;
        const ox = obj.x + obj.w / 2;
        const oy = obj.y + obj.h / 2;
        if (Math.hypot(ox - frontX, oy - frontY) < 45) {
          this.handleObjectInteraction(obj);
          return;
        }
      }
    }
  }

  private harvestCrop(tile: FarmTile) {
    if (!tile.crop) return;
    const cropDef = CROP_DEFINITIONS[tile.crop.cropId];
    if (!cropDef) return;

    const yieldQty = Math.floor(Math.random() * (cropDef.harvestYieldMax - cropDef.harvestYieldMin + 1)) + cropDef.harvestYieldMin;
    const harvestItem = ITEMS_DATABASE[cropDef.harvestItemId];

    if (harvestItem) {
      this.addItemToInventory(harvestItem, yieldQty);
      soundManager.playHarvest();
      this.addFloatingText(`+${yieldQty} ${harvestItem.name}! ✨`, tile.x * 32, tile.y * 32, '#ffd166');
      this.checkQuestProgress(cropDef.harvestItemId, yieldQty);
    }

    // Clear crop from tile
    tile.crop = undefined;
    this.notify();
  }

  private interactWithAnimal(animal: Animal) {
    soundManager.playAnimalSound(animal.type);

    // Pet animal if not petted today
    if (!animal.isPetToday) {
      animal.isPetToday = true;
      animal.happiness = Math.min(100, animal.happiness + 15);
      this.addFloatingText(`❤️ ${animal.name} sangat senang!`, animal.x, animal.y - 12, '#ff4d6d');
    }

    // Collect product if ready
    if (animal.productReady) {
      animal.productReady = false;
      let prodItem = null;
      if (animal.type === 'chicken') prodItem = ITEMS_DATABASE['prod_egg'];
      else if (animal.type === 'cow') prodItem = ITEMS_DATABASE['prod_milk'];
      else if (animal.type === 'sheep') prodItem = ITEMS_DATABASE['prod_wool'];
      else if (animal.type === 'rabbit') prodItem = ITEMS_DATABASE['prod_fur'];

      if (prodItem) {
        this.addItemToInventory(prodItem, 1);
        soundManager.playHarvest();
        this.addFloatingText(`+1 ${prodItem.name}! 🌟`, animal.x, animal.y - 20, '#ffd166');
        this.checkQuestProgress(prodItem.id, 1);
      }
    }

    this.notify();
  }

  private handleObjectInteraction(obj: { interactAction?: string; id: string; customData?: Record<string, unknown> }) {
    switch (obj.interactAction) {
      case 'sleep':
        this.openModal('sleep_confirm');
        break;
      case 'cooking':
        this.openModal('cooking');
        break;
      case 'storage_chest':
        this.openModal('chest');
        break;
      case 'shipping_bin':
        this.openModal('shipping_bin');
        break;
      case 'pick_berry': {
        soundManager.playHarvest();
        this.addItemToInventory(ITEMS_DATABASE['forage_berry'], 2);
        this.addFloatingText('+2 Berry Hutan! 🍓', this.data.player.x, this.data.player.y - 10, '#ff4d6d');
        this.checkQuestProgress('forage_berry', 2);
        this.notify();
        break;
      }
    }
  }

  // --- Fishing Sequence ---

  private startFishingSequence() {
    soundManager.playUiClick();
    this.addFloatingText('Melempar pancingan... 🎣', this.data.player.x, this.data.player.y - 15, '#3a86ff');
    
    // After 1.2 to 2.5 seconds, bite alert!
    const delay = 1200 + Math.random() * 1500;
    setTimeout(() => {
      soundManager.playBiteAlert();
      this.addFloatingText('Ikan menggigit! Tekan CEPAT! ❗', this.data.player.x, this.data.player.y - 25, '#ffbe0b');
      this.openModal('fishing');
    }, delay);
  }

  public finishFishing(success: boolean, fishId: string) {
    this.closeModal();
    if (success) {
      const fishItem = ITEMS_DATABASE[fishId];
      if (fishItem) {
        this.addItemToInventory(fishItem, 1);
        soundManager.playFishingCatch();
        this.addFloatingText(`Berhasil menangkap ${fishItem.name}! 🐟`, this.data.player.x, this.data.player.y - 20, '#3a86ff');
        this.checkQuestProgress(fishId, 1);
      }
    } else {
      this.addFloatingText('Ikan terlepas...', this.data.player.x, this.data.player.y - 15, '#e63946');
    }
    this.notify();
  }

  // --- Day & Time Engine ---

  public updateTime(dt: number) {
    if (this.activeModal !== 'none') return;

    this.animTick++;
    this.timeAccumulator += dt;

    // Advance 1 in-game minute every 700ms
    if (this.timeAccumulator >= 700) {
      this.timeAccumulator = 0;
      this.data.timeMinute += 10;
      if (this.data.timeMinute >= 60) {
        this.data.timeMinute = 0;
        this.data.timeHour += 1;

        // Auto collapse if staying up past 02:00 AM!
        if (this.data.timeHour >= 26 || (this.data.timeHour === 2 && this.data.timeMinute === 0)) {
          this.exhaustionCollapse();
          return;
        }
      }
      this.notify();
    }

    // Tool swinging timer
    if (this.isToolSwinging) {
      this.toolSwingTimer -= dt;
      if (this.toolSwingTimer <= 0) {
        this.isToolSwinging = false;
      }
    }

    // Animals gentle wander
    if (this.animTick % 60 === 0) {
      this.updateAnimalWander();
    }

    // Update floating texts and particles
    this.updateParticles(dt);
  }

  private updateAnimalWander() {
    for (const a of this.data.animals) {
      if (Math.random() < 0.4) {
        const dirs: Direction[] = ['up', 'down', 'left', 'right'];
        a.dir = dirs[Math.floor(Math.random() * dirs.length)];
        const dist = 12;
        if (a.dir === 'left') a.x = Math.max(18 * 32, a.x - dist);
        if (a.dir === 'right') a.x = Math.min(26 * 32, a.x + dist);
        if (a.dir === 'up') a.y = Math.max(6 * 32, a.y - dist);
        if (a.dir === 'down') a.y = Math.min(12 * 32, a.y + dist);
      }
    }
  }

  public advanceToNextDay() {
    soundManager.playSleep();
    this.closeModal();

    // 1. Advance Day Counter
    this.data.day++;
    if (this.data.day > 28) {
      this.data.day = 1;
      const seasons: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
      const curIdx = seasons.indexOf(this.data.season);
      this.data.season = seasons[(curIdx + 1) % seasons.length];
      this.addFloatingText(`Musim Baru: ${this.data.season}! 🌸`, this.data.player.x, this.data.player.y - 30, '#ff70a6');
    }

    // 2. Reset clock to 06:00 AM
    this.data.timeHour = 6;
    this.data.timeMinute = 0;

    // 3. Roll next day weather
    const roll = Math.random();
    if (roll < 0.2) this.data.weather = 'Rainy';
    else if (roll < 0.35) this.data.weather = 'Cloudy';
    else this.data.weather = 'Sunny';

    // 4. Update Crops Growth
    for (const tile of Object.values(this.data.farmTiles)) {
      if (tile.crop && !tile.crop.ripe) {
        // If watered today or rainy, crop grows!
        if (tile.crop.isWatered || this.data.weather === 'Rainy') {
          tile.crop.daysPlanted++;
          const cropDef = CROP_DEFINITIONS[tile.crop.cropId];
          if (cropDef) {
            const progress = tile.crop.daysPlanted / cropDef.growthDays;
            if (progress >= 1) {
              tile.crop.stage = 3;
              tile.crop.ripe = true;
            } else if (progress >= 0.66) {
              tile.crop.stage = 2;
            } else if (progress >= 0.33) {
              tile.crop.stage = 1;
            }
          }
        }
      }

      // Reset soil watered state (unless rainy day)
      tile.isWatered = this.data.weather === 'Rainy';
      if (tile.crop) {
        tile.crop.isWatered = tile.isWatered;
      }
    }

    // 5. Update Animals (Happiness, Produce)
    for (const animal of this.data.animals) {
      animal.isPetToday = false;
      // Animals produce if reasonably happy
      if (animal.happiness >= 40 && animal.type !== 'dog' && animal.type !== 'cat') {
        animal.productReady = true;
      }
    }

    // 6. Reset NPCs talked today
    for (const npc of Object.values(this.data.npcs)) {
      npc.talkedToday = false;
    }

    // 7. Restore Player Energy
    this.data.player.energy = this.data.player.maxEnergy;

    // Move player inside house bedroom
    this.data.player.area = 'house_interior';
    this.data.player.x = 4 * 32;
    this.data.player.y = 5 * 32;
    this.data.player.dir = 'down';

    // Auto-Save
    SaveSystem.saveGame(this.data);
    this.addFloatingText(`Hari ${this.data.day} ${this.data.season} Dimulai! ☀️`, this.data.player.x, this.data.player.y - 20, '#ffd166');
    this.notify();
  }

  private exhaustionCollapse() {
    this.addFloatingText('Pingsan karena kelelahan! 💤', this.data.player.x, this.data.player.y - 20, '#e63946');
    this.advanceToNextDay();
    this.data.player.energy = Math.floor(this.data.player.maxEnergy * 0.6); // 60% penalty
  }

  // --- Inventory & Economy ---

  public addItemToInventory(item: typeof ITEMS_DATABASE[string], quantity: number = 1): boolean {
    // 1. Try stacking with existing slot
    if (item.stackable) {
      for (const slot of this.data.inventory) {
        if (slot && slot.item.id === item.id) {
          slot.quantity += quantity;
          this.notify();
          return true;
        }
      }
    }

    // 2. Find empty slot
    for (let i = 0; i < this.data.inventory.length; i++) {
      if (!this.data.inventory[i]) {
        this.data.inventory[i] = { item, quantity };
        this.notify();
        return true;
      }
    }

    this.addFloatingText('Tas Penuh! (Inventory Full)', this.data.player.x, this.data.player.y - 20, '#e63946');
    return false;
  }

  public checkQuestProgress(itemId: string, qty: number) {
    for (const q of this.data.quests) {
      if (!q.isCompleted && q.targetItemId === itemId) {
        // Count total item in inventory
        let total = 0;
        for (const slot of this.data.inventory) {
          if (slot && slot.item.id === itemId) total += slot.quantity;
        }
        if (total >= q.targetQuantity) {
          q.isCompleted = true;
          soundManager.playHarvest();
          this.addFloatingText(`Quest Selesai: ${q.title}! 🎉`, this.data.player.x, this.data.player.y - 30, '#ffd166');
        }
      }
    }
  }

  public claimQuest(questId: string) {
    const q = this.data.quests.find((x) => x.id === questId);
    if (!q || !q.isCompleted || q.isClaimed) return;

    // Deduct items from inventory
    let remaining = q.targetQuantity;
    for (let i = 0; i < this.data.inventory.length; i++) {
      const slot = this.data.inventory[i];
      if (slot && slot.item.id === q.targetItemId) {
        if (slot.quantity <= remaining) {
          remaining -= slot.quantity;
          this.data.inventory[i] = null;
        } else {
          slot.quantity -= remaining;
          remaining = 0;
        }
        if (remaining <= 0) break;
      }
    }

    // Award reward
    q.isClaimed = true;
    this.data.player.money += q.rewardCoins;
    const npcState = this.data.npcs[q.giverNpcId];
    if (npcState) {
      npcState.friendship = Math.min(100, npcState.friendship + q.rewardFriendship);
    }

    soundManager.playCoin();
    this.addFloatingText(`+${q.rewardCoins} Koin! 🪙`, this.data.player.x, this.data.player.y - 20, '#ffd166');
    this.notify();
  }

  public buyItem(item: typeof ITEMS_DATABASE[string], quantity: number = 1): boolean {
    const totalCost = (item.buyPrice || 10) * quantity;
    if (this.data.player.money < totalCost) {
      this.addFloatingText('Uang koin tidak cukup!', this.data.player.x, this.data.player.y - 20, '#e63946');
      return false;
    }

    const added = this.addItemToInventory(item, quantity);
    if (added) {
      this.data.player.money -= totalCost;
      soundManager.playCoin();
      this.addFloatingText(`-${totalCost} Koin 🪙`, this.data.player.x, this.data.player.y - 15, '#f4a261');
      this.notify();
      return true;
    }
    return false;
  }

  public buyAnimal(type: Animal['type'], name: string, cost: number): boolean {
    if (this.data.player.money < cost) {
      this.addFloatingText('Uang koin tidak cukup!', this.data.player.x, this.data.player.y - 20, '#e63946');
      return false;
    }

    this.data.player.money -= cost;
    soundManager.playCoin();

    const newAnimal: Animal = {
      id: `animal_${Date.now()}`,
      type,
      name: name || (type.charAt(0).toUpperCase() + type.slice(1)),
      x: 21 * 32,
      y: 8 * 32,
      dir: 'down',
      isMoving: false,
      happiness: 70,
      hunger: false,
      isPetToday: false,
      productReady: false,
      daysAlive: 1,
    };

    this.data.animals.push(newAnimal);
    soundManager.playAnimalSound(type);
    this.addFloatingText(`${newAnimal.name} telah bergabung di kandang! 🐾`, this.data.player.x, this.data.player.y - 20, '#ffd166');
    this.notify();
    return true;
  }

  public sellItem(slotIndex: number, quantity: number = 1): boolean {
    const slot = this.data.inventory[slotIndex];
    if (!slot || slot.quantity < quantity) return false;

    const earned = slot.item.sellPrice * quantity;
    this.data.player.money += earned;
    slot.quantity -= quantity;

    if (slot.quantity <= 0) {
      this.data.inventory[slotIndex] = null;
    }

    soundManager.playCoin();
    this.addFloatingText(`+${earned} Koin! 🪙`, this.data.player.x, this.data.player.y - 15, '#ffd166');
    this.notify();
    return true;
  }

  // --- Energy Management ---

  public consumeEnergy(amount: number) {
    this.data.player.energy = Math.max(0, this.data.player.energy - amount);
    this.addFloatingText(`-${amount} Energi`, this.data.player.x, this.data.player.y - 12, '#e76f51');
    if (this.data.player.energy <= 15) {
      this.addFloatingText('Energi menipis! Istirahatlah.', this.data.player.x, this.data.player.y - 25, '#d62828');
    }
  }

  public restoreEnergy(amount: number) {
    this.data.player.energy = Math.min(this.data.player.maxEnergy, this.data.player.energy + amount);
  }

  // --- Modals Management ---

  public openModal(modal: GameModalType, data: Record<string, unknown> = {}) {
    this.activeModal = modal;
    this.modalData = data;
    soundManager.playUiClick();
    this.notify();
  }

  public closeModal() {
    this.activeModal = 'none';
    this.modalData = {};
    soundManager.playUiClick();
    this.notify();
  }

  public openDialogue(npcId: string) {
    const npcState = this.data.npcs[npcId];
    if (npcState && !npcState.talkedToday) {
      npcState.talkedToday = true;
      npcState.friendship = Math.min(100, npcState.friendship + 5);
      this.addFloatingText('Persahabatan +5! ❤️', this.data.player.x, this.data.player.y - 20, '#ff4d6d');
    }
    this.openModal('dialogue', { npcId });
  }

  // --- Particles & Floating Text ---

  public addFloatingText(text: string, x: number, y: number, color: string = '#fff') {
    this.floatingTexts.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      text,
      x,
      y,
      color,
      opacity: 1,
      life: 1.4, // seconds
    });
  }

  private updateParticles(dt: number) {
    const deltaSec = dt / 1000;

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= deltaSec;
      ft.y -= 25 * deltaSec; // floats upward
      ft.opacity = Math.max(0, ft.life / 1.4);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update ambient particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= deltaSec;
      p.x += p.vx * deltaSec;
      p.y += p.vy * deltaSec;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private spawnDirtParticles(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x + (Math.random() * 12 - 6),
        y: y + (Math.random() * 12 - 6),
        vx: (Math.random() * 40 - 20),
        vy: -30 - Math.random() * 30,
        life: 0.4,
        maxLife: 0.4,
        color: '#693f19',
        size: 3,
        type: 'smoke',
      });
    }
  }

  private spawnWaterParticles(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() * 10 - 5),
        y: y + (Math.random() * 10 - 5),
        vx: (Math.random() * 30 - 15),
        vy: -20 - Math.random() * 20,
        life: 0.35,
        maxLife: 0.35,
        color: '#74c69d',
        size: 2.5,
        type: 'sparkle',
      });
    }
  }

  private tryChopObstacle(fx: number, fy: number): boolean {
    const area = WorldMapManager.getArea(this.data.player.area);
    if (!area) return false;
    for (let i = 0; i < area.objects.length; i++) {
      const obj = area.objects[i];
      if (obj.type === 'stump' || obj.type === 'tree') {
        if (Math.hypot(obj.x + 16 - fx, obj.y + 16 - fy) < 30) {
          if (obj.type === 'stump') {
            area.objects.splice(i, 1); // remove stump permanently
          }
          return true;
        }
      }
    }
    return false;
  }

  private tryMineRock(fx: number, fy: number): boolean {
    const area = WorldMapManager.getArea(this.data.player.area);
    if (!area) return false;
    for (let i = 0; i < area.objects.length; i++) {
      const obj = area.objects[i];
      if (obj.type === 'rock') {
        if (Math.hypot(obj.x + 16 - fx, obj.y + 16 - fy) < 30) {
          area.objects.splice(i, 1); // remove rock permanently
          return true;
        }
      }
    }
    return false;
  }
}
