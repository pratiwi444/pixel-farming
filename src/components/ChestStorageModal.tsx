import React, { useState } from 'react';
import { GameController } from '../game/engine/gameController';
import { getItemEmoji } from './HUD';
import { X, ArrowRightLeft } from 'lucide-react';
import { soundManager } from '../game/audio/soundManager';

interface ChestStorageModalProps {
  controller: GameController;
  onClose: () => void;
}

export const ChestStorageModal: React.FC<ChestStorageModalProps> = ({ controller, onClose }) => {
  const { data } = controller;
  const [selectedInvIdx, setSelectedInvIdx] = useState<number | null>(null);
  const [selectedChestIdx, setSelectedChestIdx] = useState<number | null>(null);

  // Transfer item from Inventory to Chest
  const transferToChest = (invIndex: number) => {
    const slot = data.inventory[invIndex];
    if (!slot) return;

    // Find empty chest slot
    for (let i = 0; i < data.chest.length; i++) {
      if (!data.chest[i]) {
        data.chest[i] = { ...slot };
        data.inventory[invIndex] = null;
        soundManager.playUiClick();
        return;
      }
    }
    controller.addFloatingText('Peti Penuh!', data.player.x, data.player.y - 15, '#e63946');
  };

  // Transfer item from Chest to Inventory
  const transferToInventory = (chestIndex: number) => {
    const slot = data.chest[chestIndex];
    if (!slot) return;

    // Find empty inventory slot
    for (let i = 0; i < data.inventory.length; i++) {
      if (!data.inventory[i]) {
        data.inventory[i] = { ...slot };
        data.chest[chestIndex] = null;
        soundManager.playUiClick();
        return;
      }
    }
    controller.addFloatingText('Tas Penuh!', data.player.x, data.player.y - 15, '#e63946');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="pixel-box w-full max-w-2xl p-5 relative flex flex-col gap-4 bg-amber-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-amber-900/40 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">📦</span>
            <h2 className="font-pixel text-sm text-amber-950">Peti Penyimpanan Rumah</h2>
          </div>
          <button
            onClick={onClose}
            className="pixel-button p-1 rounded text-amber-950"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Inventory Box (Left) */}
          <div className="pixel-box p-3 bg-amber-50">
            <h3 className="font-bold text-xs text-amber-950 mb-2 flex items-center gap-1.5">
              <span>🎒 Tas Petani</span>
              <span className="text-[10px] text-amber-800 font-normal">(Klik untuk simpan ke peti)</span>
            </h3>
            <div className="grid grid-cols-6 gap-1.5">
              {data.inventory.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => transferToChest(idx)}
                  className="w-10 h-10 rounded border-2 border-amber-800/30 bg-amber-100 hover:bg-amber-200 flex items-center justify-center relative"
                >
                  {slot ? (
                    <>
                      <span className="text-lg">{getItemEmoji(slot.item.id)}</span>
                      {slot.quantity > 1 && (
                        <span className="absolute bottom-0.5 right-0.5 font-pixel text-[7px] text-amber-950 font-bold bg-amber-200/90 px-0.5 rounded">
                          {slot.quantity}
                        </span>
                      )}
                    </>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {/* Chest Box (Right) */}
          <div className="pixel-box p-3 bg-amber-50">
            <h3 className="font-bold text-xs text-amber-950 mb-2 flex items-center gap-1.5">
              <span>📦 Isi Peti</span>
              <span className="text-[10px] text-amber-800 font-normal">(Klik untuk ambil ke tas)</span>
            </h3>
            <div className="grid grid-cols-6 gap-1.5">
              {data.chest.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => transferToInventory(idx)}
                  className="w-10 h-10 rounded border-2 border-amber-800/30 bg-amber-200/60 hover:bg-amber-300/80 flex items-center justify-center relative"
                >
                  {slot ? (
                    <>
                      <span className="text-lg">{getItemEmoji(slot.item.id)}</span>
                      {slot.quantity > 1 && (
                        <span className="absolute bottom-0.5 right-0.5 font-pixel text-[7px] text-amber-950 font-bold bg-amber-100 px-0.5 rounded">
                          {slot.quantity}
                        </span>
                      )}
                    </>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-[10px] text-amber-800 text-center">
          Barang yang disimpan di dalam peti akan tetap aman tersimpan selamanya.
        </div>
      </div>
    </div>
  );
};
