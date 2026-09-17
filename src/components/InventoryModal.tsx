import React, { useState } from 'react';
import { GameController } from '../game/engine/gameController';
import { InventorySlot } from '../types/game';
import { getItemEmoji } from './HUD';
import { X, ArrowRightLeft, Utensils, Coins, Trash2 } from 'lucide-react';
import { soundManager } from '../game/audio/soundManager';

interface InventoryModalProps {
  controller: GameController;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ controller, onClose }) => {
  const { data } = controller;
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const selectedSlot = data.inventory[selectedIndex] || null;

  const handleUseItem = () => {
    if (!selectedSlot) return;
    if (selectedSlot.item.category === 'Food') {
      controller.restoreEnergy(selectedSlot.item.energyRestored || 20);
      selectedSlot.quantity--;
      if (selectedSlot.quantity <= 0) {
        data.inventory[selectedIndex] = null;
      }
      soundManager.playHarvest();
      controller.addFloatingText(`+${selectedSlot.item.energyRestored} Energi!`, data.player.x, data.player.y - 15, '#52b788');
    }
  };

  const handleQuickSell = () => {
    if (!selectedSlot) return;
    controller.sellItem(selectedIndex, 1);
  };

  const handleTrash = () => {
    if (!selectedSlot) return;
    data.inventory[selectedIndex] = null;
    soundManager.playUiClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="pixel-box w-full max-w-xl p-5 relative flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-amber-900/40 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎒</span>
            <h2 className="font-pixel text-sm text-amber-950">Tas Petani (24 Slot)</h2>
          </div>
          <button
            onClick={onClose}
            className="pixel-button p-1 rounded text-amber-950"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 24-Slot Grid (3 Rows of 8) */}
        <div className="grid grid-cols-8 gap-2 bg-amber-200/50 p-3 rounded border border-amber-900/30">
          {data.inventory.map((slot, idx) => {
            const isSelected = selectedIndex === idx;
            const isHotbar = idx < 8;

            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedIndex(idx);
                  soundManager.playUiClick();
                }}
                className={`relative w-12 h-12 rounded border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'border-amber-950 bg-amber-300 ring-2 ring-amber-500 scale-105'
                    : 'border-amber-800/40 bg-amber-100/90 hover:bg-amber-200'
                }`}
              >
                {/* Hotbar index badge */}
                {isHotbar && (
                  <span className="absolute top-0.5 left-1 font-pixel text-[7px] text-amber-900/60">
                    {idx + 1}
                  </span>
                )}

                {slot ? (
                  <div className="flex flex-col items-center">
                    <span className="text-2xl leading-none">
                      {getItemEmoji(slot.item.id)}
                    </span>
                    {slot.quantity > 1 && (
                      <span className="absolute bottom-0.5 right-1 font-pixel text-[8px] font-bold text-amber-950 bg-amber-200/90 px-0.5 rounded">
                        {slot.quantity}
                      </span>
                    )}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Selected Item Details Card */}
        <div className="pixel-box p-3 bg-amber-100 border-amber-900/50 flex flex-col md:flex-row gap-4 justify-between items-start">
          {selectedSlot ? (
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getItemEmoji(selectedSlot.item.id)}</span>
                <div>
                  <h3 className="font-bold text-amber-950 text-sm">{selectedSlot.item.name}</h3>
                  <span className="font-pixel text-[9px] text-amber-800 bg-amber-200/70 px-1.5 py-0.5 rounded">
                    {selectedSlot.item.category}
                  </span>
                </div>
              </div>
              <p className="text-xs text-amber-900 mt-2 leading-relaxed">
                {selectedSlot.item.description}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-amber-950">
                <span>Harga Jual: 🪙 {selectedSlot.item.sellPrice}</span>
                {selectedSlot.item.energyRestored && (
                  <span className="text-emerald-700">Pulihkan: +{selectedSlot.item.energyRestored}⚡</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-4 text-xs text-amber-800 italic">
              Pilih salah satu slot di atas untuk melihat detail item
            </div>
          )}

          {/* Action buttons */}
          {selectedSlot && (
            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
              {selectedSlot.item.category === 'Food' && (
                <button
                  onClick={handleUseItem}
                  className="pixel-button px-3 py-1.5 rounded flex items-center justify-center gap-1.5 text-xs text-amber-950 font-bold bg-emerald-400 hover:bg-emerald-300"
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Makan</span>
                </button>
              )}
              {selectedSlot.item.sellPrice > 0 && (
                <button
                  onClick={handleQuickSell}
                  className="pixel-button px-3 py-1.5 rounded flex items-center justify-center gap-1.5 text-xs text-amber-950 font-bold"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Jual 1x</span>
                </button>
              )}
              <button
                onClick={handleTrash}
                className="pixel-button px-3 py-1.5 rounded flex items-center justify-center gap-1.5 text-xs text-rose-900 font-bold bg-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Buang</span>
              </button>
            </div>
          )}
        </div>

        {/* Hotbar Hint */}
        <div className="text-[10px] text-amber-900/80 text-center font-medium">
          💡 Tips: 8 slot baris pertama otomatis muncul di Hotbar bagian bawah layar Anda!
        </div>
      </div>
    </div>
  );
};
