import { Direction, MapArea, Season, Weather } from '../../types/game';
import { CROP_DEFINITIONS } from '../data/items';

export class PixelRenderer {
  // Color Palettes
  private static colors = {
    // Terrain
    grassSpring: '#60a441',
    grassSummer: '#4f9435',
    grassAutumn: '#a68a35',
    grassWinter: '#7fa487',
    grassDark: '#437c2a',
    grassLight: '#78bf55',
    
    tilledSoil: '#693f19',
    tilledSoilBorder: '#482a0e',
    wateredSoil: '#38200d',
    wateredSoilBorder: '#231307',
    
    waterDeep: '#296b99',
    waterMid: '#3984b8',
    waterLight: '#5fb5e8',
    waterFoam: '#d4f1ff',
    
    stonePath: '#8a857a',
    stoneBorder: '#5c5850',
    woodFloor: '#a87139',
    woodFloorDark: '#754b20',
    woodWall: '#523419',
    
    // Foliage
    woodTrunk: '#5c3a1d',
    woodBarkDark: '#3b220e',
    foliageSpring: '#458c35',
    foliageSpringLight: '#65b252',
    foliageAutumn: '#cb6623',
    foliageAutumnLight: '#e78a3c',
    
    // Rock
    rockLight: '#9e9e9e',
    rockDark: '#5e5e5e',
    
    // Highlights & Shadows
    shadow: 'rgba(20, 10, 5, 0.28)',
  };

  /**
   * Helper to draw a pixelated rectangle with outline
   */
  public static drawPixelRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    fill: string,
    stroke?: string
  ) {
    ctx.fillStyle = fill;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w) - 1, Math.round(h) - 1);
    }
  }

  // --- Terrain Tile Drawing ---

  public static drawGrassTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tileSize: number,
    season: Season,
    seed: number = 0
  ) {
    let baseGrass = this.colors.grassSpring;
    if (season === 'Summer') baseGrass = this.colors.grassSummer;
    else if (season === 'Autumn') baseGrass = this.colors.grassAutumn;
    else if (season === 'Winter') baseGrass = this.colors.grassWinter;

    ctx.fillStyle = baseGrass;
    ctx.fillRect(x, y, tileSize, tileSize);

    // Subtle texture noise based on pseudo-random coordinates
    const p1 = (Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453) % 1;
    const p2 = (Math.cos(x * 4.1414 + y * 9.8765) * 12345.6789) % 1;

    if (Math.abs(p1) > 0.6) {
      ctx.fillStyle = this.colors.grassLight;
      ctx.fillRect(x + 4, y + 4, 3, 2);
      ctx.fillRect(x + 5, y + 6, 2, 3);
    }
    if (Math.abs(p2) > 0.7) {
      ctx.fillStyle = this.colors.grassDark;
      ctx.fillRect(x + 18, y + 16, 3, 3);
      ctx.fillRect(x + 19, y + 14, 2, 2);
    }

    // Occasional tiny wild flower
    if (Math.abs(p1) > 0.88) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 12, y + 10, 3, 3);
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(x + 13, y + 11, 1, 1);
    } else if (Math.abs(p2) > 0.88) {
      ctx.fillStyle = '#ff70a6';
      ctx.fillRect(x + 22, y + 20, 3, 3);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 23, y + 21, 1, 1);
    }
  }

  public static drawTilledSoilTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tileSize: number,
    isWatered: boolean
  ) {
    const bg = isWatered ? this.colors.wateredSoil : this.colors.tilledSoil;
    const border = isWatered ? this.colors.wateredSoilBorder : this.colors.tilledSoilBorder;

    // Outer furrow
    ctx.fillStyle = border;
    ctx.fillRect(x, y, tileSize, tileSize);

    // Inner mound
    ctx.fillStyle = bg;
    ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

    // Tilled ridges
    ctx.fillStyle = border;
    ctx.fillRect(x + 4, y + 8, tileSize - 8, 2);
    ctx.fillRect(x + 4, y + 18, tileSize - 8, 2);

    if (isWatered) {
      // Shiny water gleam
      ctx.fillStyle = 'rgba(180, 225, 255, 0.45)';
      ctx.fillRect(x + 6, y + 5, 4, 2);
      ctx.fillRect(x + 18, y + 14, 5, 2);
    }
  }

  public static drawWaterTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tileSize: number,
    animTime: number
  ) {
    ctx.fillStyle = this.colors.waterMid;
    ctx.fillRect(x, y, tileSize, tileSize);

    // Deep water band
    ctx.fillStyle = this.colors.waterDeep;
    ctx.fillRect(x, y + 6, tileSize, tileSize - 12);

    // Animated ripple highlights
    const waveOffset = Math.sin(animTime * 0.003 + (x + y) * 0.05) * 4;
    ctx.fillStyle = this.colors.waterLight;
    ctx.fillRect(x + 4 + waveOffset, y + 8, 10, 2);
    ctx.fillRect(x + 18 - waveOffset, y + 18, 8, 2);

    ctx.fillStyle = this.colors.waterFoam;
    ctx.fillRect(x + 6 + waveOffset, y + 9, 4, 1);
  }

  public static drawStonePathTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tileSize: number
  ) {
    ctx.fillStyle = this.colors.stoneBorder;
    ctx.fillRect(x, y, tileSize, tileSize);

    ctx.fillStyle = this.colors.stonePath;
    ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

    // Cobblestone grooves
    ctx.fillStyle = '#6e6961';
    ctx.fillRect(x + 4, y + 14, tileSize - 8, 2);
    ctx.fillRect(x + 14, y + 4, 2, 10);
    ctx.fillRect(x + 20, y + 16, 2, 12);

    ctx.fillStyle = '#aba598';
    ctx.fillRect(x + 4, y + 4, 8, 2);
    ctx.fillRect(x + 18, y + 6, 8, 2);
  }

  public static drawWoodFloorTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tileSize: number
  ) {
    ctx.fillStyle = this.colors.woodFloorDark;
    ctx.fillRect(x, y, tileSize, tileSize);

    ctx.fillStyle = this.colors.woodFloor;
    ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

    // Planks
    ctx.fillStyle = this.colors.woodFloorDark;
    ctx.fillRect(x, y + 10, tileSize, 1);
    ctx.fillRect(x, y + 21, tileSize, 1);
    ctx.fillRect(x + 14, y + 1, 1, 9);
    ctx.fillRect(x + 20, y + 11, 1, 10);

    // Nail spots
    ctx.fillStyle = '#3c2410';
    ctx.fillRect(x + 3, y + 4, 1, 1);
    ctx.fillRect(x + tileSize - 4, y + 4, 1, 1);
  }

  public static drawWoodenFence(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tileSize: number
  ) {
    // Post
    ctx.fillStyle = '#4a2d14';
    ctx.fillRect(x + 12, y + 4, 8, 24);
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(x + 13, y + 5, 6, 22);

    // Rails
    ctx.fillStyle = '#4a2d14';
    ctx.fillRect(x, y + 8, tileSize, 5);
    ctx.fillRect(x, y + 18, tileSize, 5);
    ctx.fillStyle = '#a6723e';
    ctx.fillRect(x, y + 9, tileSize, 3);
    ctx.fillRect(x, y + 19, tileSize, 3);
  }

  // --- Crops Drawing (4 Stages) ---

  public static drawCrop(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tileSize: number,
    cropId: string,
    stage: number, // 0 to 3
    isRipe: boolean
  ) {
    const cropDef = CROP_DEFINITIONS[cropId];
    if (!cropDef) return;

    const cx = x + tileSize / 2;
    const cy = y + tileSize / 2 + 6;

    if (stage === 0) {
      // Sprout
      ctx.fillStyle = '#55a630';
      ctx.fillRect(cx - 1, cy - 6, 2, 6);
      ctx.fillRect(cx - 3, cy - 7, 2, 2);
      ctx.fillRect(cx + 1, cy - 8, 3, 2);
    } else if (stage === 1) {
      // Growing stalk
      ctx.fillStyle = '#40916c';
      ctx.fillRect(cx - 2, cy - 10, 4, 10);
      ctx.fillStyle = '#74c69d';
      ctx.fillRect(cx - 6, cy - 9, 4, 3);
      ctx.fillRect(cx + 2, cy - 11, 5, 3);
      ctx.fillRect(cx - 1, cy - 14, 3, 4);
    } else if (stage === 2) {
      // Blooming / near ready
      ctx.fillStyle = '#2d6a4f';
      ctx.fillRect(cx - 2, cy - 14, 4, 14);
      // Large leafy bush
      ctx.fillStyle = '#52b788';
      ctx.fillRect(cx - 8, cy - 12, 16, 8);
      ctx.fillRect(cx - 6, cy - 16, 12, 6);
      // Unripe fruit bud
      ctx.fillStyle = '#b7e4c7';
      ctx.fillRect(cx - 2, cy - 10, 4, 4);
    } else {
      // Stage 3: Fully ripe
      ctx.fillStyle = '#2d6a4f';
      ctx.fillRect(cx - 3, cy - 16, 6, 16);
      // Full foliage
      ctx.fillStyle = '#40916c';
      ctx.fillRect(cx - 10, cy - 14, 20, 10);
      ctx.fillRect(cx - 7, cy - 18, 14, 6);

      // Render custom ripe crop fruit!
      ctx.fillStyle = cropDef.color;
      switch (cropId) {
        case 'carrot':
          // Crisp orange carrot top protruding
          ctx.fillStyle = '#ff7700';
          ctx.fillRect(cx - 4, cy - 10, 8, 9);
          ctx.fillRect(cx - 2, cy - 1, 4, 4);
          ctx.fillStyle = '#ffd166';
          ctx.fillRect(cx - 2, cy - 8, 2, 6);
          break;
        case 'potato':
          ctx.fillStyle = '#c49a45';
          ctx.fillRect(cx - 5, cy - 8, 10, 8);
          ctx.fillStyle = '#8a6521';
          ctx.fillRect(cx - 2, cy - 6, 2, 2);
          ctx.fillRect(cx + 2, cy - 4, 2, 2);
          break;
        case 'strawberry':
          ctx.fillStyle = '#ff2a55';
          ctx.fillRect(cx - 5, cy - 10, 10, 10);
          ctx.fillRect(cx - 2, cy, 4, 3);
          ctx.fillStyle = '#ffeaa7';
          ctx.fillRect(cx - 2, cy - 7, 2, 2);
          ctx.fillRect(cx + 1, cy - 5, 2, 2);
          break;
        case 'tomato':
          ctx.fillStyle = '#e63946';
          ctx.beginPath();
          ctx.arc(cx, cy - 6, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#2d6a4f';
          ctx.fillRect(cx - 2, cy - 14, 4, 3);
          ctx.fillStyle = '#ff758f';
          ctx.fillRect(cx - 3, cy - 8, 2, 2);
          break;
        case 'corn':
          ctx.fillStyle = '#ffd166';
          ctx.fillRect(cx - 3, cy - 18, 6, 16);
          ctx.fillStyle = '#f4a261';
          ctx.fillRect(cx - 2, cy - 16, 4, 2);
          ctx.fillRect(cx - 2, cy - 12, 4, 2);
          ctx.fillRect(cx - 2, cy - 8, 4, 2);
          ctx.fillStyle = '#2a9d8f';
          ctx.fillRect(cx - 7, cy - 10, 4, 8);
          ctx.fillRect(cx + 3, cy - 8, 4, 8);
          break;
        case 'watermelon':
          ctx.fillStyle = '#1b4332';
          ctx.fillRect(cx - 7, cy - 8, 14, 11);
          ctx.fillStyle = '#40916c';
          ctx.fillRect(cx - 5, cy - 7, 2, 9);
          ctx.fillRect(cx, cy - 7, 2, 9);
          ctx.fillRect(cx + 3, cy - 7, 2, 9);
          break;
        case 'pumpkin':
          ctx.fillStyle = '#e85d04';
          ctx.fillRect(cx - 8, cy - 10, 16, 12);
          ctx.fillRect(cx - 6, cy - 12, 12, 2);
          ctx.fillStyle = '#dc2f02';
          ctx.fillRect(cx - 3, cy - 10, 2, 12);
          ctx.fillRect(cx + 2, cy - 10, 2, 12);
          ctx.fillStyle = '#588157';
          ctx.fillRect(cx - 1, cy - 15, 3, 4);
          break;
        case 'mushroom':
          ctx.fillStyle = '#d4a373';
          ctx.fillRect(cx - 2, cy - 6, 4, 8);
          ctx.fillStyle = '#7f4f24';
          ctx.fillRect(cx - 7, cy - 14, 14, 8);
          ctx.fillRect(cx - 5, cy - 16, 10, 3);
          ctx.fillStyle = '#fefae0';
          ctx.fillRect(cx - 4, cy - 12, 2, 2);
          ctx.fillRect(cx + 2, cy - 13, 2, 2);
          break;
      }

      // Sparkle indicator for ripe harvest!
      if (isRipe) {
        ctx.fillStyle = '#fff';
        const bounce = Math.sin(Date.now() * 0.008) * 2;
        ctx.fillRect(cx - 1, cy - 22 + bounce, 3, 3);
        ctx.fillRect(cx, cy - 23 + bounce, 1, 5);
        ctx.fillRect(cx - 2, cy - 21 + bounce, 5, 1);
      }
    }
  }

  // --- Trees, Rocks, Forage ---

  public static drawTree(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tileSize: number,
    season: Season,
    type: 'oak' | 'pine' = 'oak'
  ) {
    const tx = x;
    const ty = y - tileSize; // 2 tiles high

    // Shadow
    ctx.fillStyle = this.colors.shadow;
    ctx.beginPath();
    ctx.ellipse(tx + tileSize / 2, y + tileSize - 4, tileSize * 0.6, tileSize * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk
    ctx.fillStyle = this.colors.woodBarkDark;
    ctx.fillRect(tx + 11, ty + 24, 10, 28);
    ctx.fillStyle = this.colors.woodTrunk;
    ctx.fillRect(tx + 12, ty + 25, 7, 26);

    let leafColor = season === 'Autumn' ? this.colors.foliageAutumn : this.colors.foliageSpring;
    let leafLight = season === 'Autumn' ? this.colors.foliageAutumnLight : this.colors.foliageSpringLight;

    if (type === 'pine') {
      // Triangular pine canopy
      ctx.fillStyle = '#1b4332';
      ctx.beginPath();
      ctx.moveTo(tx + 16, ty - 4);
      ctx.lineTo(tx + 30, ty + 28);
      ctx.lineTo(tx + 2, ty + 28);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#2d6a4f';
      ctx.beginPath();
      ctx.moveTo(tx + 16, ty);
      ctx.lineTo(tx + 27, ty + 24);
      ctx.lineTo(tx + 5, ty + 24);
      ctx.closePath();
      ctx.fill();
    } else {
      // Rounded lush oak canopy
      ctx.fillStyle = '#234a1a';
      ctx.beginPath();
      ctx.arc(tx + 16, ty + 14, 19, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = leafColor;
      ctx.beginPath();
      ctx.arc(tx + 16, ty + 13, 17, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = leafLight;
      ctx.beginPath();
      ctx.arc(tx + 13, ty + 10, 11, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  public static drawRock(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tileSize: number
  ) {
    // Shadow
    ctx.fillStyle = this.colors.shadow;
    ctx.fillRect(x + 4, y + 20, 24, 8);

    // Dark border
    ctx.fillStyle = this.colors.rockDark;
    ctx.fillRect(x + 5, y + 8, 22, 16);
    ctx.fillRect(x + 8, y + 5, 16, 22);

    // Light rock mass
    ctx.fillStyle = this.colors.rockLight;
    ctx.fillRect(x + 7, y + 8, 18, 16);

    // Highlights & Chisel marks
    ctx.fillStyle = '#d6d6d6';
    ctx.fillRect(x + 8, y + 7, 8, 4);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x + 14, y + 14, 6, 2);
    ctx.fillRect(x + 10, y + 18, 5, 2);
  }

  public static drawStump(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) {
    ctx.fillStyle = this.colors.shadow;
    ctx.fillRect(x + 4, y + 18, 24, 8);

    ctx.fillStyle = this.colors.woodBarkDark;
    ctx.fillRect(x + 6, y + 8, 20, 16);
    ctx.fillStyle = this.colors.woodTrunk;
    ctx.fillRect(x + 7, y + 9, 18, 14);

    // Top tree rings
    ctx.fillStyle = '#d4a373';
    ctx.fillRect(x + 8, y + 6, 16, 6);
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(x + 11, y + 8, 10, 3);
    ctx.fillStyle = '#d4a373';
    ctx.fillRect(x + 14, y + 9, 4, 1);
  }

  public static drawWeed(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) {
    ctx.fillStyle = '#40916c';
    ctx.fillRect(x + 6, y + 14, 4, 12);
    ctx.fillRect(x + 14, y + 8, 4, 18);
    ctx.fillRect(x + 22, y + 12, 4, 14);

    ctx.fillStyle = '#74c69d';
    ctx.fillRect(x + 4, y + 12, 4, 4);
    ctx.fillRect(x + 14, y + 6, 4, 4);
    ctx.fillRect(x + 24, y + 10, 4, 4);

    // Yellow flower bud
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(x + 15, y + 5, 2, 2);
  }

  public static drawBerryBush(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    hasBerries: boolean
  ) {
    ctx.fillStyle = this.colors.shadow;
    ctx.fillRect(x + 4, y + 20, 24, 8);

    ctx.fillStyle = '#1b4332';
    ctx.fillRect(x + 4, y + 6, 24, 20);
    ctx.fillStyle = '#2d6a4f';
    ctx.fillRect(x + 6, y + 4, 20, 22);
    ctx.fillStyle = '#52b788';
    ctx.fillRect(x + 8, y + 6, 16, 12);

    if (hasBerries) {
      // Red sweet wild berries
      ctx.fillStyle = '#ff2a55';
      ctx.fillRect(x + 8, y + 10, 4, 4);
      ctx.fillRect(x + 18, y + 8, 4, 4);
      ctx.fillRect(x + 12, y + 16, 4, 4);
      ctx.fillRect(x + 22, y + 17, 3, 3);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 9, y + 10, 1, 1);
      ctx.fillRect(x + 19, y + 8, 1, 1);
    }
  }

  // --- Buildings & Houses ---

  public static drawFarmHouse(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 8, y + h - 6, w - 16, 12);

    // Main walls
    ctx.fillStyle = '#5a3825';
    ctx.fillRect(x + 8, y + 36, w - 16, h - 36);
    ctx.fillStyle = '#d4b896';
    ctx.fillRect(x + 12, y + 40, w - 24, h - 42);

    // Timber beams
    ctx.fillStyle = '#5a3825';
    ctx.fillRect(x + 12, y + 40, 6, h - 42);
    ctx.fillRect(x + w - 18, y + 40, 6, h - 42);
    ctx.fillRect(x + 12, y + 40, w - 24, 4);

    // Gabled Roof
    ctx.fillStyle = '#7a1f1d';
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 4);
    ctx.lineTo(x + w, y + 42);
    ctx.lineTo(x, y + 42);
    ctx.closePath();
    ctx.fill();

    // Roof shingles highlight
    ctx.fillStyle = '#a63330';
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 8);
    ctx.lineTo(x + w - 8, y + 40);
    ctx.lineTo(x + 8, y + 40);
    ctx.closePath();
    ctx.fill();

    // Chimney with smoke
    ctx.fillStyle = '#5c5850';
    ctx.fillRect(x + w - 28, y + 2, 10, 20);
    ctx.fillStyle = '#8a857a';
    ctx.fillRect(x + w - 30, y, 14, 4);

    // Door
    ctx.fillStyle = '#482a0e';
    ctx.fillRect(x + w / 2 - 10, y + h - 28, 20, 28);
    ctx.fillStyle = '#754b20';
    ctx.fillRect(x + w / 2 - 8, y + h - 26, 16, 26);
    // Brass handle
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(x + w / 2 + 3, y + h - 14, 3, 3);

    // Window with cozy warm light
    ctx.fillStyle = '#482a0e';
    ctx.fillRect(x + 22, y + 50, 18, 18);
    ctx.fillStyle = '#ffeaa7';
    ctx.fillRect(x + 24, y + 52, 14, 14);
    ctx.fillStyle = '#482a0e';
    ctx.fillRect(x + 30, y + 52, 2, 14);
    ctx.fillRect(x + 24, y + 58, 14, 2);

    // Farmhouse Sign
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(x + w / 2 - 16, y + 36, 32, 7);
    ctx.fillStyle = '#fff';
    ctx.font = '6px monospace';
    ctx.fillText('HOME', x + w / 2 - 10, y + 42);
  }

  public static drawAnimalBarn(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    // Red barn style
    ctx.fillStyle = '#661b1b';
    ctx.fillRect(x + 6, y + 30, w - 12, h - 30);
    ctx.fillStyle = '#9e2a2b';
    ctx.fillRect(x + 10, y + 34, w - 20, h - 36);

    // White X braces on walls
    ctx.strokeStyle = '#f5ebe0';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 14, y + 38, 22, 24);
    ctx.strokeRect(x + w - 36, y + 38, 22, 24);

    // Straw gambrel roof
    ctx.fillStyle = '#d4a373';
    ctx.fillRect(x, y + 16, w, 18);
    ctx.fillStyle = '#e9c46a';
    ctx.fillRect(x + 4, y + 12, w - 8, 10);
    ctx.fillStyle = '#faedcd';
    ctx.fillRect(x + 12, y + 6, w - 24, 8);

    // Double barn gate
    ctx.fillStyle = '#3c2410';
    ctx.fillRect(x + w / 2 - 14, y + h - 28, 28, 28);
    ctx.fillStyle = '#5c3a1d';
    ctx.fillRect(x + w / 2 - 12, y + h - 26, 11, 26);
    ctx.fillRect(x + w / 2 + 1, y + h - 26, 11, 26);

    // Hay pile on side
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(x - 6, y + h - 14, 12, 14);
  }

  public static drawShippingBin(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 2, y + 20, 28, 8);

    // Wooden chest bin
    ctx.fillStyle = '#482a0e';
    ctx.fillRect(x + 4, y + 8, 24, 18);
    ctx.fillStyle = '#754b20';
    ctx.fillRect(x + 6, y + 10, 20, 14);

    // Metal hinges
    ctx.fillStyle = '#adb5bd';
    ctx.fillRect(x + 8, y + 10, 3, 14);
    ctx.fillRect(x + 21, y + 10, 3, 14);

    // Shipping symbol (gold coin icon)
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(x + 16, y + 17, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  public static drawVillageShop(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    shopName: string,
    color: string
  ) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 8, y + h - 6, w - 16, 12);

    // Cobblestone/plaster wall
    ctx.fillStyle = '#d5c7b6';
    ctx.fillRect(x + 8, y + 36, w - 16, h - 36);

    // Striped Awning
    const stripes = 6;
    const stripeW = (w - 8) / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? color : '#ffffff';
      ctx.fillRect(x + 4 + i * stripeW, y + 32, stripeW, 14);
    }

    // Roof
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(x + 4, y + 14, w - 8, 20);
    ctx.fillStyle = '#718096';
    ctx.fillRect(x + 8, y + 16, w - 16, 16);

    // Door
    ctx.fillStyle = '#5c3a1d';
    ctx.fillRect(x + w / 2 - 10, y + h - 28, 20, 28);
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(x + w / 2 - 8, y + h - 26, 16, 26);

    // Shop sign
    ctx.fillStyle = '#482a0e';
    ctx.fillRect(x + w / 2 - 28, y + 10, 56, 14);
    ctx.fillStyle = '#fefae0';
    ctx.fillRect(x + w / 2 - 26, y + 12, 52, 10);
    ctx.fillStyle = '#283618';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(shopName, x + w / 2, y + 20);
    ctx.textAlign = 'left';

    // Display Window
    ctx.fillStyle = '#5c3a1d';
    ctx.fillRect(x + 16, y + 54, 20, 18);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(x + 18, y + 56, 16, 14);
  }

  public static drawTownFountain(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    animTime: number
  ) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x + 32, y + 36, 32, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Basin stone
    ctx.fillStyle = '#6c757d';
    ctx.beginPath();
    ctx.ellipse(x + 32, y + 32, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Water pool
    ctx.fillStyle = '#3a86ff';
    ctx.beginPath();
    ctx.ellipse(x + 32, y + 30, 24, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Center pillar
    ctx.fillStyle = '#adb5bd';
    ctx.fillRect(x + 28, y + 14, 8, 18);
    ctx.fillStyle = '#dee2e6';
    ctx.beginPath();
    ctx.ellipse(x + 32, y + 14, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spouting water particles
    const spoutY = Math.sin(animTime * 0.01) * 3;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 31, y + 4 + spoutY, 2, 8);
    ctx.fillRect(x + 28, y + 8, 2, 3);
    ctx.fillRect(x + 34, y + 8, 2, 3);
  }

  public static drawLantern(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isNight: boolean
  ) {
    // Post
    ctx.fillStyle = '#212529';
    ctx.fillRect(x + 14, y + 10, 4, 22);
    ctx.fillRect(x + 12, y + 30, 8, 2);

    // Lamp cage
    ctx.fillStyle = '#343a40';
    ctx.fillRect(x + 11, y + 4, 10, 10);
    // Glow inside
    ctx.fillStyle = isNight ? '#ffb703' : '#fff3b0';
    ctx.fillRect(x + 13, y + 6, 6, 6);
  }

  // --- Player Sprite Drawing (4 Directions & Walking Frames) ---

  public static drawPlayer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    dir: Direction,
    isMoving: boolean,
    frame: number,
    hairStyle: number,
    hairColor: string,
    shirtColor: string,
    pantsColor: string,
    skinColor: string,
    isToolSwinging: boolean = false
  ) {
    const px = Math.round(x);
    const py = Math.round(y);

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(px + 16, py + 28, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Walking leg bob
    const legOffset = isMoving ? (frame % 2 === 0 ? -2 : 2) : 0;
    const bodyBob = isMoving ? (frame % 2 === 0 ? 1 : 0) : 0;

    // 1. Legs / Shoes
    ctx.fillStyle = '#342517'; // shoes
    if (dir === 'left' || dir === 'right') {
      ctx.fillRect(px + 11, py + 25 + legOffset, 5, 4);
      ctx.fillRect(px + 16, py + 25 - legOffset, 5, 4);
    } else {
      ctx.fillRect(px + 11, py + 26 + legOffset, 4, 4);
      ctx.fillRect(px + 17, py + 26 - legOffset, 4, 4);
    }

    // 2. Pants
    ctx.fillStyle = pantsColor;
    ctx.fillRect(px + 11, py + 20 + bodyBob, 10, 6);

    // 3. Torso / Shirt
    ctx.fillStyle = shirtColor;
    ctx.fillRect(px + 10, py + 12 + bodyBob, 12, 9);
    // Collar detail
    ctx.fillStyle = '#ffffff';
    if (dir === 'down') {
      ctx.fillRect(px + 14, py + 12 + bodyBob, 4, 2);
    }

    // 4. Arms
    ctx.fillStyle = skinColor;
    if (dir === 'down') {
      ctx.fillRect(px + 7, py + 14 + bodyBob, 3, 7);
      ctx.fillRect(px + 22, py + 14 + bodyBob, 3, 7);
    } else if (dir === 'up') {
      ctx.fillRect(px + 8, py + 14 + bodyBob, 3, 7);
      ctx.fillRect(px + 21, py + 14 + bodyBob, 3, 7);
    } else if (dir === 'left') {
      ctx.fillRect(px + 9, py + 14 + bodyBob + legOffset, 3, 7);
    } else if (dir === 'right') {
      ctx.fillRect(px + 20, py + 14 + bodyBob - legOffset, 3, 7);
    }

    // Tool swinging gesture
    if (isToolSwinging) {
      ctx.fillStyle = '#8b5a2b';
      if (dir === 'down') ctx.fillRect(px + 18, py + 18, 12, 3);
      else if (dir === 'up') ctx.fillRect(px + 18, py + 2, 12, 3);
      else if (dir === 'left') ctx.fillRect(px + 2, py + 16, 8, 3);
      else if (dir === 'right') ctx.fillRect(px + 22, py + 16, 8, 3);
    }

    // 5. Head / Face
    ctx.fillStyle = skinColor;
    ctx.fillRect(px + 10, py + 3 + bodyBob, 12, 10);

    // Eyes
    ctx.fillStyle = '#212529';
    if (dir === 'down') {
      ctx.fillRect(px + 12, py + 7 + bodyBob, 2, 3);
      ctx.fillRect(px + 18, py + 7 + bodyBob, 2, 3);
      // Blush cheeks
      ctx.fillStyle = '#ff70a6';
      ctx.fillRect(px + 11, py + 9 + bodyBob, 2, 2);
      ctx.fillRect(px + 19, py + 9 + bodyBob, 2, 2);
    } else if (dir === 'left') {
      ctx.fillRect(px + 10, py + 7 + bodyBob, 2, 3);
      ctx.fillStyle = '#ff70a6';
      ctx.fillRect(px + 11, py + 9 + bodyBob, 2, 2);
    } else if (dir === 'right') {
      ctx.fillRect(px + 20, py + 7 + bodyBob, 2, 3);
      ctx.fillStyle = '#ff70a6';
      ctx.fillRect(px + 19, py + 9 + bodyBob, 2, 2);
    }

    // 6. Hair
    ctx.fillStyle = hairColor;
    if (hairStyle === 0) {
      // Short farmer messy hair
      ctx.fillRect(px + 9, py + 1 + bodyBob, 14, 5);
      if (dir === 'up') {
        ctx.fillRect(px + 9, py + 3 + bodyBob, 14, 9);
      } else {
        ctx.fillRect(px + 8, py + 3 + bodyBob, 3, 6);
        ctx.fillRect(px + 21, py + 3 + bodyBob, 3, 6);
      }
    } else if (hairStyle === 1) {
      // Long ponytail / locks
      ctx.fillRect(px + 8, py + 1 + bodyBob, 16, 5);
      ctx.fillRect(px + 8, py + 3 + bodyBob, 4, 10);
      ctx.fillRect(px + 20, py + 3 + bodyBob, 4, 10);
      if (dir === 'up' || dir === 'left' || dir === 'right') {
        ctx.fillRect(px + 14, py + 12 + bodyBob, 4, 8); // braid/ponytail
      }
    } else {
      // Cozy beanie / farm hat
      ctx.fillStyle = '#b08968';
      ctx.fillRect(px + 7, py - 2 + bodyBob, 18, 7);
      ctx.fillRect(px + 5, py + 4 + bodyBob, 22, 2); // brim
    }
  }

  // --- Animals Drawing ---

  public static drawAnimal(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: string,
    dir: Direction,
    isMoving: boolean,
    animTick: number,
    happiness: number
  ) {
    const ax = Math.round(x);
    const ay = Math.round(y);
    const bob = isMoving ? (animTick % 2 === 0 ? 1 : -1) : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(ax + 16, ay + 26, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    switch (type) {
      case 'chicken': {
        // Cute White Chicken
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ax + 10, ay + 14 + bob, 12, 10);
        ctx.fillStyle = '#e9ecef';
        ctx.fillRect(ax + 9, ay + 16 + bob, 4, 6);

        // Head
        const hx = dir === 'left' ? ax + 8 : ax + 18;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(hx, ay + 10 + bob, 7, 7);
        // Beak
        ctx.fillStyle = '#f4a261';
        ctx.fillRect(dir === 'left' ? hx - 3 : hx + 7, ay + 13 + bob, 3, 2);
        // Red Comb
        ctx.fillStyle = '#e63946';
        ctx.fillRect(hx + 2, ay + 7 + bob, 3, 3);
        // Eye
        ctx.fillStyle = '#000000';
        ctx.fillRect(dir === 'left' ? hx + 1 : hx + 4, ay + 12 + bob, 2, 2);
        // Legs
        ctx.fillStyle = '#f4a261';
        ctx.fillRect(ax + 12, ay + 24, 2, 3);
        ctx.fillRect(ax + 18, ay + 24, 2, 3);
        break;
      }
      case 'cow': {
        // Spotted Dairy Cow
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ax + 6, ay + 10 + bob, 20, 14);
        // Black spots
        ctx.fillStyle = '#212529';
        ctx.fillRect(ax + 9, ay + 12 + bob, 6, 6);
        ctx.fillRect(ax + 19, ay + 15 + bob, 5, 5);
        // Head
        const chx = dir === 'left' ? ax + 2 : ax + 22;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(chx, ay + 8 + bob, 10, 10);
        // Pink muzzle
        ctx.fillStyle = '#ffb5a7';
        ctx.fillRect(dir === 'left' ? chx - 2 : chx + 4, ay + 13 + bob, 6, 5);
        // Ears/Horns
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(chx + 2, ay + 6 + bob, 2, 2);
        ctx.fillRect(chx + 6, ay + 6 + bob, 2, 2);
        // Legs
        ctx.fillStyle = '#212529';
        ctx.fillRect(ax + 7, ay + 24, 3, 4);
        ctx.fillRect(ax + 13, ay + 24, 3, 4);
        ctx.fillRect(ax + 18, ay + 24, 3, 4);
        ctx.fillRect(ax + 23, ay + 24, 3, 4);
        break;
      }
      case 'sheep': {
        // Fluffy Sheep
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(ax + 6, ay + 8 + bob, 20, 16);
        ctx.fillStyle = '#dee2e6';
        ctx.fillRect(ax + 8, ay + 10 + bob, 16, 12);
        // Black face
        const shx = dir === 'left' ? ax + 3 : ax + 23;
        ctx.fillStyle = '#343a40';
        ctx.fillRect(shx, ay + 10 + bob, 8, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(dir === 'left' ? shx + 1 : shx + 4, ay + 12 + bob, 2, 2);
        // Legs
        ctx.fillStyle = '#343a40';
        ctx.fillRect(ax + 8, ay + 24, 3, 4);
        ctx.fillRect(ax + 21, ay + 24, 3, 4);
        break;
      }
      case 'rabbit': {
        // Cute Brown/White Bunny
        ctx.fillStyle = '#ddb892';
        ctx.fillRect(ax + 10, ay + 16 + bob, 12, 9);
        // Head
        const rx = dir === 'left' ? ax + 8 : ax + 16;
        ctx.fillStyle = '#ddb892';
        ctx.fillRect(rx, ay + 12 + bob, 8, 8);
        // Long Ears
        ctx.fillRect(rx + 1, ay + 5 + bob, 2, 7);
        ctx.fillRect(rx + 4, ay + 5 + bob, 2, 7);
        ctx.fillStyle = '#ffb5a7';
        ctx.fillRect(rx + 2, ay + 6 + bob, 1, 5);
        ctx.fillRect(rx + 5, ay + 6 + bob, 1, 5);
        // Eye
        ctx.fillStyle = '#6b4423';
        ctx.fillRect(dir === 'left' ? rx + 2 : rx + 5, ay + 14 + bob, 2, 2);
        break;
      }
      case 'cat': {
        // Ginger Tabby Cat
        ctx.fillStyle = '#f77f00';
        ctx.fillRect(ax + 8, ay + 15 + bob, 14, 9);
        // Ears
        const cx = dir === 'left' ? ax + 6 : ax + 18;
        ctx.fillRect(cx, ay + 11 + bob, 8, 8);
        ctx.fillRect(cx + 1, ay + 8 + bob, 2, 3);
        ctx.fillRect(cx + 5, ay + 8 + bob, 2, 3);
        // Tail
        ctx.fillStyle = '#d62828';
        ctx.fillRect(dir === 'left' ? ax + 22 : ax + 6, ay + 12 + bob, 2, 8);
        // Eyes
        ctx.fillStyle = '#52b788';
        ctx.fillRect(dir === 'left' ? cx + 1 : cx + 4, ay + 13 + bob, 2, 2);
        break;
      }
      case 'dog': {
        // Golden Retriever Dog
        ctx.fillStyle = '#e9c46a';
        ctx.fillRect(ax + 7, ay + 13 + bob, 18, 11);
        // Head
        const dx = dir === 'left' ? ax + 4 : ax + 20;
        ctx.fillRect(dx, ay + 9 + bob, 9, 9);
        // Floppy ears
        ctx.fillStyle = '#b08968';
        ctx.fillRect(dx + 1, ay + 10 + bob, 2, 6);
        ctx.fillRect(dx + 6, ay + 10 + bob, 2, 6);
        // Tail wag
        const wag = Math.sin(animTick * 0.2) * 3;
        ctx.fillRect(dir === 'left' ? ax + 25 : ax + 4, ay + 12 + wag, 2, 6);
        // Nose
        ctx.fillStyle = '#264653';
        ctx.fillRect(dir === 'left' ? dx - 1 : dx + 7, ay + 13 + bob, 3, 3);
        break;
      }
    }

    // Floating heart when very happy
    if (happiness > 80 && Math.sin(animTick * 0.05) > 0.7) {
      ctx.fillStyle = '#ff2a55';
      ctx.fillRect(ax + 14, ay + 2, 4, 3);
      ctx.fillRect(ax + 12, ay, 3, 3);
      ctx.fillRect(ax + 17, ay, 3, 3);
    }
  }

  // --- NPC World Sprite Drawing ---

  public static drawNPC(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    id: string,
    dir: Direction
  ) {
    const nx = Math.round(x);
    const ny = Math.round(y);

    let shirt = '#2a9d8f';
    let pants = '#264653';
    let hair = '#e76f51';
    let skin = '#ffeaa7';

    if (id === 'mira') {
      shirt = '#e76f51'; // warm coral apron
      pants = '#f4a261';
      hair = '#4a2810';
    } else if (id === 'theo') {
      shirt = '#457b9d'; // carpenter denim
      pants = '#1d3557';
      hair = '#d4a373';
    } else if (id === 'lily') {
      shirt = '#ffb5a7'; // pastel pink bakery
      pants = '#f8edeb';
      hair = '#d4a373';
    } else if (id === 'rowan') {
      shirt = '#2d6a4f'; // forest ranger green
      pants = '#1b4332';
      hair = '#333333';
    } else if (id === 'nia') {
      shirt = '#52b788'; // herbalist mint
      pants = '#40916c';
      hair = '#a37081';
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(nx + 16, ny + 28, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = pants;
    ctx.fillRect(nx + 11, ny + 20, 10, 8);
    ctx.fillStyle = '#342517';
    ctx.fillRect(nx + 11, ny + 26, 4, 3);
    ctx.fillRect(nx + 17, ny + 26, 4, 3);

    // Torso
    ctx.fillStyle = shirt;
    ctx.fillRect(nx + 10, ny + 12, 12, 9);

    // Head & Hair
    ctx.fillStyle = skin;
    ctx.fillRect(nx + 11, ny + 4, 10, 9);
    ctx.fillStyle = hair;
    ctx.fillRect(nx + 10, ny + 2, 12, 5);
    ctx.fillRect(nx + 9, ny + 4, 3, 6);
    ctx.fillRect(nx + 20, ny + 4, 3, 6);

    // Face eyes
    ctx.fillStyle = '#1a0f0a';
    if (dir === 'down') {
      ctx.fillRect(nx + 13, ny + 8, 2, 2);
      ctx.fillRect(nx + 17, ny + 8, 2, 2);
    } else if (dir === 'left') {
      ctx.fillRect(nx + 11, ny + 8, 2, 2);
    } else if (dir === 'right') {
      ctx.fillRect(nx + 19, ny + 8, 2, 2);
    }
  }

  // --- Day / Night Ambient Lighting Pass ---

  public static applyDayNightLighting(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    hour: number,
    minute: number,
    lightSources: { x: number; y: number; radius: number }[]
  ) {
    const timeVal = hour + minute / 60;
    let darkness = 0;
    let r = 0;
    let g = 0;
    let b = 0;

    if (timeVal >= 6 && timeVal < 8) {
      // Dawn / Sunrise: soft peach-gold tint
      const t = (timeVal - 6) / 2;
      darkness = (1 - t) * 0.35;
      r = 255; g = 180; b = 120;
    } else if (timeVal >= 8 && timeVal < 17) {
      // Daytime: clear
      darkness = 0;
    } else if (timeVal >= 17 && timeVal < 20) {
      // Golden hour sunset: warm amber
      const t = (timeVal - 17) / 3;
      darkness = t * 0.45;
      r = 240; g = 130; b = 60;
    } else if (timeVal >= 20 || timeVal < 4) {
      // Deep Night: cozy navy blue
      darkness = 0.72;
      r = 15; g = 25; b = 65;
    } else {
      // 4 to 6 AM: pre-dawn
      const t = (timeVal - 4) / 2;
      darkness = (1 - t) * 0.65;
      r = 40; g = 40; b = 90;
    }

    if (darkness <= 0.05) return;

    // Create dark tint overlay
    ctx.save();
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${darkness})`;
    ctx.fillRect(0, 0, width, height);

    // Cut radial light holes for lamps, windows, and player lantern
    if (darkness > 0.3 && lightSources.length > 0) {
      ctx.globalCompositeOperation = 'destination-out';
      for (const light of lightSources) {
        const radGrad = ctx.createRadialGradient(
          light.x,
          light.y,
          0,
          light.x,
          light.y,
          light.radius
        );
        radGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
        radGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.7)');
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add warm orange center glow back
      ctx.globalCompositeOperation = 'source-over';
      for (const light of lightSources) {
        const warmGrad = ctx.createRadialGradient(
          light.x,
          light.y,
          0,
          light.x,
          light.y,
          light.radius * 0.7
        );
        warmGrad.addColorStop(0, 'rgba(255, 200, 100, 0.35)');
        warmGrad.addColorStop(1, 'rgba(255, 180, 50, 0)');
        ctx.fillStyle = warmGrad;
        ctx.beginPath();
        ctx.arc(light.x, light.y, light.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}
