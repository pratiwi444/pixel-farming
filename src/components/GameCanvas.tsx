import React, { useEffect, useRef, useState } from 'react';
import { GameController } from '../game/engine/gameController';
import { PixelRenderer } from '../game/rendering/pixelRenderer';
import { WorldMapManager } from '../game/engine/worldMap';
import { NPCS_DATA } from '../game/data/npcs';
import { FarmTile } from '../types/game';

interface GameCanvasProps {
  controller: GameController;
  onOpenModal: (modal: import('../game/engine/gameController').GameModalType, data?: Record<string, unknown>) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ controller, onOpenModal }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const keysPressed = useRef<Record<string, boolean>>({});

  // Touch controls state
  const [touchActive, setTouchActive] = useState(false);
  const touchStick = useRef<{ active: boolean; startX: number; startY: number; curX: number; curY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    curX: 0,
    curY: 0,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on arrow keys or space
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      keysPressed.current[e.code] = true;

      // Quick key bindings
      if (e.code === 'KeyE') {
        controller.interact();
      } else if (e.code === 'Space') {
        controller.useActiveItem();
      } else if (e.code === 'KeyI') {
        onOpenModal(controller.activeModal === 'inventory' ? 'none' : 'inventory');
      } else if (e.code === 'KeyM') {
        onOpenModal(controller.activeModal === 'map' ? 'none' : 'map');
      } else if (e.code === 'KeyQ') {
        onOpenModal(controller.activeModal === 'quests' ? 'none' : 'quests');
      } else if (e.code === 'Escape') {
        onOpenModal(controller.activeModal === 'pause' ? 'none' : 'pause');
      } else if (e.code.startsWith('Digit')) {
        const num = parseInt(e.code.replace('Digit', ''), 10);
        if (num >= 1 && num <= 8) {
          controller.data.player.activeHotbarIndex = num - 1;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [controller, onOpenModal]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(100, currentTime - lastTime);
      lastTime = currentTime;

      // 1. Process movement inputs
      let dx = 0;
      let dy = 0;

      if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) dy -= 1;
      if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) dy += 1;
      if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) dx -= 1;
      if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) dx += 1;

      // Touch joystick input
      if (touchStick.current.active) {
        const deltaX = touchStick.current.curX - touchStick.current.startX;
        const deltaY = touchStick.current.curY - touchStick.current.startY;
        const dist = Math.hypot(deltaX, deltaY);
        if (dist > 10) {
          dx = deltaX / dist;
          dy = deltaY / dist;
        }
      }

      // Move player
      controller.movePlayer(dx, dy, dt);

      // Advance game time
      controller.updateTime(dt);

      // Render frame
      render();

      animationFrameId = requestAnimationFrame(loop);
    };

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { data } = controller;
      const area = WorldMapManager.getArea(data.player.area);
      if (!area) return;

      const tileSize = area.tileSize;
      const viewW = canvas.width;
      const viewH = canvas.height;

      // Smooth camera centered on player, clamped to area boundaries
      const targetCamX = data.player.x + 16 - viewW / 2;
      const targetCamY = data.player.y + 20 - viewH / 2;
      const maxCamX = Math.max(0, area.width * tileSize - viewW);
      const maxCamY = Math.max(0, area.height * tileSize - viewH);

      const camX = Math.max(0, Math.min(maxCamX, targetCamX));
      const camY = Math.max(0, Math.min(maxCamY, targetCamY));

      ctx.clearRect(0, 0, viewW, viewH);

      // Disable image smoothing for crisp pixel art
      ctx.imageSmoothingEnabled = false;

      ctx.save();
      ctx.translate(-Math.round(camX), -Math.round(camY));

      const minCol = Math.max(0, Math.floor(camX / tileSize));
      const maxCol = Math.min(area.width - 1, Math.floor((camX + viewW) / tileSize) + 1);
      const minRow = Math.max(0, Math.floor(camY / tileSize));
      const maxRow = Math.min(area.height - 1, Math.floor((camY + viewH) / tileSize) + 1);

      // 1. Draw Base Terrain Tiles
      for (let y = minRow; y <= maxRow; y++) {
        for (let x = minCol; x <= maxCol; x++) {
          const type = area.tiles[y]?.[x] || 'grass';
          const rx = x * tileSize;
          const ry = y * tileSize;

          if (type === 'grass') {
            PixelRenderer.drawGrassTile(ctx, rx, ry, tileSize, data.season, x + y * 31);
          } else if (type === 'path') {
            PixelRenderer.drawStonePathTile(ctx, rx, ry, tileSize);
          } else if (type === 'water') {
            PixelRenderer.drawWaterTile(ctx, rx, ry, tileSize, currentTime);
          } else if (type === 'wood') {
            PixelRenderer.drawWoodFloorTile(ctx, rx, ry, tileSize);
          }
        }
      }

      // 2. Draw Tilled Soil and Crops (on Farm)
      if (data.player.area === 'farm') {
        const farmTiles = Object.values(data.farmTiles) as FarmTile[];
        for (const tile of farmTiles) {
          if (tile.isTilled) {
            const rx = tile.x * tileSize;
            const ry = tile.y * tileSize;
            PixelRenderer.drawTilledSoilTile(ctx, rx, ry, tileSize, tile.isWatered);

            if (tile.crop) {
              PixelRenderer.drawCrop(
                ctx,
                rx,
                ry,
                tileSize,
                tile.crop.cropId,
                tile.crop.stage,
                tile.crop.ripe
              );
            }
          }
        }
      }

      // 3. Y-Sorted Entities & Objects Rendering
      const renderList: {
        y: number;
        render: () => void;
      }[] = [];

      // Add map static objects
      for (const obj of area.objects) {
        renderList.push({
          y: obj.y + obj.h,
          render: () => {
            switch (obj.type) {
              case 'house':
                if (obj.id === 'player_house') {
                  PixelRenderer.drawFarmHouse(ctx, obj.x, obj.y, obj.w, obj.h);
                } else if (obj.id === 'shop_mira') {
                  PixelRenderer.drawVillageShop(ctx, obj.x, obj.y, obj.w, obj.h, "MIRA'S SEEDS", '#e76f51');
                } else if (obj.id === 'shop_theo') {
                  PixelRenderer.drawVillageShop(ctx, obj.x, obj.y, obj.w, obj.h, 'WORKSHOP', '#457b9d');
                } else if (obj.id === 'shop_lily') {
                  PixelRenderer.drawVillageShop(ctx, obj.x, obj.y, obj.w, obj.h, 'BAKERY', '#ffb5a7');
                } else {
                  PixelRenderer.drawFarmHouse(ctx, obj.x, obj.y, obj.w, obj.h);
                }
                break;
              case 'barn':
                PixelRenderer.drawAnimalBarn(ctx, obj.x, obj.y, obj.w, obj.h);
                break;
              case 'shipping_bin':
                PixelRenderer.drawShippingBin(ctx, obj.x, obj.y);
                break;
              case 'fountain':
                PixelRenderer.drawTownFountain(ctx, obj.x, obj.y, currentTime);
                break;
              case 'tree':
                PixelRenderer.drawTree(ctx, obj.x, obj.y, tileSize, data.season);
                break;
              case 'rock':
                PixelRenderer.drawRock(ctx, obj.x, obj.y, tileSize);
                break;
              case 'stump':
                PixelRenderer.drawStump(ctx, obj.x, obj.y);
                break;
              case 'berry_bush':
                PixelRenderer.drawBerryBush(ctx, obj.x, obj.y, true);
                break;
              case 'lantern':
                PixelRenderer.drawLantern(ctx, obj.x, obj.y, data.timeHour >= 19 || data.timeHour < 6);
                break;
              case 'bed':
                // Cozy house bed
                ctx.fillStyle = '#7a1f1d';
                ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
                ctx.fillStyle = '#fdf0d5';
                ctx.fillRect(obj.x + 2, obj.y + 2, obj.w - 4, 16); // pillow
                ctx.fillStyle = '#c1121f';
                ctx.fillRect(obj.x + 2, obj.y + 18, obj.w - 4, obj.h - 20); // blanket
                break;
              case 'kitchen':
                ctx.fillStyle = '#5c5850';
                ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
                ctx.fillStyle = '#adb5bd';
                ctx.fillRect(obj.x + 4, obj.y + 4, obj.w - 8, 12);
                // Stove burners
                ctx.fillStyle = '#ff7b00';
                ctx.fillRect(obj.x + 8, obj.y + 8, 8, 4);
                ctx.fillRect(obj.x + obj.w - 16, obj.y + 8, 8, 4);
                break;
              case 'chest':
                ctx.fillStyle = '#8b5a2b';
                ctx.fillRect(obj.x + 4, obj.y + 8, 24, 18);
                ctx.fillStyle = '#ffd166';
                ctx.fillRect(obj.x + 14, obj.y + 14, 4, 4);
                break;
              case 'fireplace':
                ctx.fillStyle = '#495057';
                ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
                ctx.fillStyle = '#d90429';
                ctx.fillRect(obj.x + 8, obj.y + 12, obj.w - 16, obj.h - 14);
                ctx.fillStyle = '#ffbe0b';
                ctx.fillRect(obj.x + 12, obj.y + 16, obj.w - 24, obj.h - 20);
                break;
            }
          },
        });
      }

      // Add Animals (if in farm)
      if (data.player.area === 'farm') {
        for (const a of data.animals) {
          renderList.push({
            y: a.y + 28,
            render: () => {
              PixelRenderer.drawAnimal(
                ctx,
                a.x,
                a.y,
                a.type,
                a.dir,
                a.isMoving,
                controller.getAnimTick(),
                a.happiness
              );
            },
          });
        }
      }

      // Add NPCs (if in village)
      if (data.player.area === 'village') {
        for (const [npcId] of Object.entries(data.npcs)) {
          const npcDef = NPCS_DATA[npcId];
          if (npcDef && npcDef.area === 'village') {
            renderList.push({
              y: npcDef.y * tileSize + 28,
              render: () => {
                PixelRenderer.drawNPC(ctx, npcDef.x * tileSize, npcDef.y * tileSize, npcId, npcDef.dir);
              },
            });
          }
        }
      }

      // Add Player
      renderList.push({
        y: data.player.y + 28,
        render: () => {
          PixelRenderer.drawPlayer(
            ctx,
            data.player.x,
            data.player.y,
            data.player.dir,
            data.player.isMoving,
            controller.getAnimTick(),
            data.player.customization.hairStyle,
            data.player.customization.hairColor,
            data.player.customization.shirtColor,
            data.player.customization.pantsColor,
            data.player.customization.skinColor,
            controller.isToolSwinging
          );
        },
      });

      // Sort by Y position and render
      renderList.sort((a, b) => a.y - b.y);
      for (const item of renderList) {
        item.render();
      }

      // 4. Draw Floating Texts
      for (const ft of controller.floatingTexts) {
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 12px monospace';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillText(ft.text, ft.x, ft.y);
      }

      // 5. Draw Particles
      for (const p of controller.particles) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      ctx.restore();

      // 6. Day / Night Ambient Lighting Pass
      const lightSources: { x: number; y: number; radius: number }[] = [];
      const isDark = data.timeHour >= 18 || data.timeHour < 6;

      if (isDark) {
        // Player holds a cozy lantern at night
        lightSources.push({
          x: data.player.x + 16 - camX,
          y: data.player.y + 20 - camY,
          radius: 95,
        });

        // Add streetlamps / fireplace lights
        for (const obj of area.objects) {
          if (obj.type === 'lantern' || obj.type === 'fireplace') {
            lightSources.push({
              x: obj.x + 16 - camX,
              y: obj.y + 16 - camY,
              radius: 120,
            });
          }
        }
      }

      PixelRenderer.applyDayNightLighting(
        ctx,
        viewW,
        viewH,
        data.timeHour,
        data.timeMinute,
        lightSources
      );

      // Weather effects (Rain streaks)
      if (data.weather === 'Rainy') {
        ctx.strokeStyle = 'rgba(174, 217, 224, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 40; i++) {
          const rx = (Math.sin(i * 99 + currentTime * 0.05) * 0.5 + 0.5) * viewW;
          const ry = ((currentTime * 0.8 + i * 47) % viewH);
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 4, ry + 16);
        }
        ctx.stroke();
      }
    };

    let currentTime = performance.now();
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [controller]);

  // Window Resize Listener
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      canvas.width = Math.floor(rect.width);
      canvas.height = Math.floor(rect.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle canvas click to use tool or interact
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (controller.activeModal !== 'none') return;
    controller.useActiveItem();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-amber-950">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-crosshair"
      />

      {/* Mobile / Tablet Virtual Touch Controls */}
      <div className="absolute inset-0 pointer-events-none md:hidden flex justify-between items-end p-5">
        {/* Virtual Joystick Base */}
        <div
          className="w-32 h-32 rounded-full border-4 border-amber-900/60 bg-amber-950/30 backdrop-blur-sm pointer-events-auto relative flex items-center justify-center touch-none"
          onTouchStart={(e) => {
            const touch = e.touches[0];
            const rect = e.currentTarget.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            touchStick.current = {
              active: true,
              startX: centerX,
              startY: centerY,
              curX: touch.clientX,
              curY: touch.clientY,
            };
            setTouchActive(true);
          }}
          onTouchMove={(e) => {
            if (!touchStick.current.active) return;
            const touch = e.touches[0];
            touchStick.current.curX = touch.clientX;
            touchStick.current.curY = touch.clientY;
          }}
          onTouchEnd={() => {
            touchStick.current.active = false;
            setTouchActive(false);
          }}
        >
          <div className="w-12 h-12 rounded-full bg-amber-400 border-2 border-amber-900 shadow-lg flex items-center justify-center opacity-85">
            <div className="w-4 h-4 rounded-full bg-amber-700/50" />
          </div>
        </div>

        {/* Action Buttons: A (Use Tool) and E (Interact) */}
        <div className="flex flex-col gap-3 pointer-events-auto items-end">
          <button
            onTouchStart={() => controller.interact()}
            onClick={() => controller.interact()}
            className="w-16 h-16 rounded-full pixel-button flex flex-col items-center justify-center text-amber-950 font-bold shadow-xl active:scale-95"
          >
            <span className="font-pixel text-xs">E</span>
            <span className="text-[9px] font-pixel">Aksi</span>
          </button>
          <button
            onTouchStart={() => controller.useActiveItem()}
            onClick={() => controller.useActiveItem()}
            className="w-16 h-16 rounded-full pixel-button bg-emerald-500 hover:bg-emerald-400 border-emerald-950 flex flex-col items-center justify-center text-amber-950 font-bold shadow-xl active:scale-95"
          >
            <span className="font-pixel text-xs">SPACE</span>
            <span className="text-[9px] font-pixel">Alat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
