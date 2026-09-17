import React from 'react';
import { GameController } from '../game/engine/gameController';
import { soundManager } from '../game/audio/soundManager';
import { 
  Sun, 
  CloudRain, 
  Cloud, 
  Volume2, 
  VolumeX, 
  Music, 
  Map as MapIcon, 
  Backpack, 
  ScrollText, 
  Pause,
  Moon,
  Sparkles
} from 'lucide-react';

interface HUDProps {
  controller: GameController;
  onOpenModal: (modal: import('../game/engine/gameController').GameModalType) => void;
  onUseItem: () => void;
  onInteract: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  controller,
  onOpenModal,
  onUseItem,
  onInteract,
}) => {
  const { data } = controller;
  const isMuted = soundManager.getIsMuted();
  const isMusic = soundManager.getIsMusicPlaying();

  // Format time (06:00 to 24:00)
  const displayHour = data.timeHour % 24;
  const formattedHour = displayHour.toString().padStart(2, '0');
  const formattedMinute = data.timeMinute.toString().padStart(2, '0');
  const timePeriod = displayHour >= 6 && displayHour < 18 ? 'AM' : 'PM';

  // Energy percentage
  const energyPercent = Math.max(0, Math.min(100, (data.player.energy / data.player.maxEnergy) * 100));
  let energyColor = 'bg-emerald-500';
  if (energyPercent < 25) energyColor = 'bg-rose-500 animate-pulse';
  else if (energyPercent < 55) energyColor = 'bg-amber-500';

  // Find interact prompt if any facing interactable
  const { frontX, frontY } = controller.getFacingTileCoords();
  let interactPrompt = '';
  // Check if near animal
  for (const a of data.animals) {
    if (Math.hypot(a.x - frontX, a.y - frontY) < 40) {
      interactPrompt = `Elus / Rawat ${a.name}`;
      break;
    }
  }
  // Check if harvestable crop
  if (!interactPrompt && data.player.area === 'farm') {
    const { tx, ty } = controller.getFacingTileCoords();
    const tile = data.farmTiles[`${tx},${ty}`];
    if (tile?.crop && tile.crop.ripe) {
      interactPrompt = 'Panen Tanaman';
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none">
      {/* --- Top Bar --- */}
      <div className="flex justify-between items-start w-full">
        {/* Top Left: Player & Calendar */}
        <div className="pixel-box px-3.5 py-2 flex items-center gap-3 pointer-events-auto">
          {/* Avatar frame */}
          <div className="w-10 h-10 rounded bg-amber-200 border-2 border-amber-900 flex items-center justify-center overflow-hidden">
            <span className="font-pixel text-xs text-amber-950 uppercase">
              {data.player.customization.name.slice(0, 2) || 'P1'}
            </span>
          </div>
          <div>
            <div className="font-bold text-sm text-amber-950 flex items-center gap-1.5 leading-none">
              <span>{data.player.customization.name || 'Farmer'}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-300/80 font-pixel text-amber-900">
                Lv.{data.farmLevel}
              </span>
            </div>
            <div className="text-xs text-amber-800 flex items-center gap-2 mt-1">
              <span className="font-semibold">{data.season}</span>
              <span>•</span>
              <span className="font-pixel text-[11px]">Hari {data.day}</span>
            </div>
          </div>
        </div>

        {/* Top Right: Time, Weather & Coins */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Time & Weather */}
          <div className="pixel-box px-3.5 py-2 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-amber-950">
              {data.weather === 'Sunny' && <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />}
              {data.weather === 'Cloudy' && <Cloud className="w-4 h-4 text-slate-500" />}
              {data.weather === 'Rainy' && <CloudRain className="w-4 h-4 text-sky-500 animate-bounce" />}
              <span className="font-pixel text-xs">{data.weather}</span>
            </div>
            <div className="h-4 w-px bg-amber-900/30" />
            <div className="font-pixel text-xs text-amber-950">
              {formattedHour}:{formattedMinute} <span className="text-[9px] text-amber-800">{timePeriod}</span>
            </div>
          </div>

          {/* Coins */}
          <div className="pixel-box px-3.5 py-2 flex items-center gap-1.5">
            <span className="text-base leading-none">🪙</span>
            <span className="font-pixel text-xs text-amber-950 font-bold tracking-wider">
              {data.player.money}
            </span>
          </div>

          {/* Quick Menu / Audio Buttons */}
          <button
            onClick={() => soundManager.toggleMute()}
            className="pixel-button p-2 text-amber-950 rounded"
            title="Mute Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-800" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => soundManager.toggleMusic()}
            className="pixel-button p-2 text-amber-950 rounded"
            title="Toggle Music"
          >
            <Music className={`w-4 h-4 ${isMusic ? 'text-amber-950' : 'text-amber-700/50'}`} />
          </button>
          <button
            onClick={() => onOpenModal('pause')}
            className="pixel-button p-2 text-amber-950 rounded"
            title="Pause Menu (Esc)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Center Interaction Tooltip */}
      {interactPrompt && (
        <div className="self-center mb-6 pointer-events-auto animate-bounce">
          <div className="pixel-box px-4 py-1.5 flex items-center gap-2 bg-amber-100 border-amber-900 shadow-lg">
            <span className="font-pixel text-[10px] bg-amber-900 text-amber-100 px-1.5 py-0.5 rounded">E</span>
            <span className="text-xs font-bold text-amber-950">{interactPrompt}</span>
          </div>
        </div>
      )}

      {/* --- Bottom Section: Energy & Hotbar & Controls --- */}
      <div className="flex flex-col items-center gap-2 w-full">
        {/* Energy Bar */}
        <div className="w-full max-w-md flex items-center justify-between pointer-events-auto px-1">
          <div className="flex items-center gap-1.5 pixel-box px-2.5 py-1 text-xs text-amber-950 font-bold">
            <span>⚡ Energi</span>
            <span className="font-pixel text-[10px]">{Math.round(data.player.energy)}/{data.player.maxEnergy}</span>
          </div>
          <div className="flex-1 mx-2 h-4 bg-amber-950/80 p-0.5 rounded border border-amber-900 shadow-inner">
            <div
              className={`h-full rounded-sm transition-all duration-300 ${energyColor}`}
              style={{ width: `${energyPercent}%` }}
            />
          </div>
        </div>

        {/* Hotbar (1 - 8 Slots) & Utility Buttons */}
        <div className="flex items-center justify-center gap-2 pointer-events-auto w-full overflow-x-auto py-1">
          {/* Inventory Button */}
          <button
            onClick={() => onOpenModal('inventory')}
            className="pixel-button p-2 rounded flex flex-col items-center justify-center"
            title="Buka Tas (I)"
          >
            <Backpack className="w-5 h-5 text-amber-950" />
            <span className="font-pixel text-[8px] text-amber-900 mt-0.5">I</span>
          </button>

          {/* Hotbar Slots */}
          <div className="pixel-box p-1.5 flex items-center gap-1.5 bg-amber-200/95">
            {data.inventory.slice(0, 8).map((slot, index) => {
              const isActive = data.player.activeHotbarIndex === index;
              return (
                <button
                  key={index}
                  onClick={() => {
                    data.player.activeHotbarIndex = index;
                    soundManager.playUiClick();
                    controller.useActiveItem();
                  }}
                  className={`relative w-11 h-11 rounded border-2 flex items-center justify-center transition-all ${
                    isActive
                      ? 'border-amber-900 bg-amber-300 scale-105 shadow-md ring-2 ring-amber-500'
                      : 'border-amber-700/60 bg-amber-100 hover:bg-amber-200/80'
                  }`}
                  title={slot ? `${slot.item.name} (${slot.quantity})` : `Slot ${index + 1}`}
                >
                  <span className="absolute top-0.5 left-1 font-pixel text-[7px] text-amber-900/80">
                    {index + 1}
                  </span>
                  {slot ? (
                    <div className="flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl leading-none">
                        {getItemEmoji(slot.item.id)}
                      </span>
                      {slot.quantity > 1 && (
                        <span className="absolute bottom-0.5 right-1 font-pixel text-[8px] text-amber-950 font-bold bg-amber-200/90 px-0.5 rounded">
                          {slot.quantity}
                        </span>
                      )}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Map Button */}
          <button
            onClick={() => onOpenModal('map')}
            className="pixel-button p-2 rounded flex flex-col items-center justify-center"
            title="Peta Desa (M)"
          >
            <MapIcon className="w-5 h-5 text-amber-950" />
            <span className="font-pixel text-[8px] text-amber-900 mt-0.5">M</span>
          </button>

          {/* Quests Button */}
          <button
            onClick={() => onOpenModal('quests')}
            className="pixel-button p-2 rounded flex flex-col items-center justify-center relative"
            title="Daftar Misi"
          >
            <ScrollText className="w-5 h-5 text-amber-950" />
            <span className="font-pixel text-[8px] text-amber-900 mt-0.5">Q</span>
            {data.quests.some((q) => q.isCompleted && !q.isClaimed) && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export function getItemEmoji(itemId: string): string {
  switch (itemId) {
    case 'tool_hoe': return '⛏️';
    case 'tool_watering_can': return '💧';
    case 'tool_axe': return '🪓';
    case 'tool_pickaxe': return '⛏️';
    case 'tool_fishing_rod': return '🎣';
    case 'seed_carrot': return '🌱';
    case 'seed_potato': return '🥔';
    case 'seed_strawberry': return '🍓';
    case 'seed_tomato': return '🍅';
    case 'seed_corn': return '🌽';
    case 'seed_watermelon': return '🍉';
    case 'seed_pumpkin': return '🎃';
    case 'seed_mushroom': return '🍄';
    case 'crop_carrot': return '🥕';
    case 'crop_potato': return '🥔';
    case 'crop_strawberry': return '🍓';
    case 'crop_tomato': return '🍅';
    case 'crop_corn': return '🌽';
    case 'crop_watermelon': return '🍉';
    case 'crop_pumpkin': return '🎃';
    case 'crop_mushroom': return '🍄';
    case 'prod_egg': return '🥚';
    case 'prod_milk': return '🥛';
    case 'prod_wool': return '🧶';
    case 'prod_fur': return '🐰';
    case 'animal_feed': return '🌾';
    case 'mat_wood': return '🪵';
    case 'mat_stone': return '🪨';
    case 'forage_berry': return '🫐';
    case 'forage_herb': return '🌿';
    case 'fish_small': return '🐟';
    case 'fish_blue': return '🐠';
    case 'fish_catfish': return '🐡';
    case 'fish_golden': return '✨';
    case 'food_soup': return '🍲';
    case 'food_salad': return '🥗';
    case 'food_corn_soup': return '🥣';
    case 'food_bread': return '🍞';
    case 'food_pie': return '🥧';
    default: return '📦';
  }
}
