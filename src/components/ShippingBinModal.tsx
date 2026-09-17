import React from 'react';
import { GameController } from '../game/engine/gameController';
import { getItemEmoji } from './HUD';
import { X, Coins } from 'lucide-react';

interface ShippingBinModalProps {
  controller: GameController;
  onClose: () => void;
}

export const ShippingBinModal: React.FC<ShippingBinModalProps> = ({ controller, onClose }) => {
  const { data } = controller;

  const handleSell = (index: number, quantity: number) => {
    controller.sellItem(index, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="pixel-box w-full max-w-lg p-5 relative flex flex-col gap-4 bg-amber-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-amber-900/40 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">📮</span>
            <h2 className="font-pixel text-sm text-amber-950">Kotak Penjualan (Shipping Bin)</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="font-pixel text-xs text-amber-950 bg-amber-200 px-2 py-1 rounded border border-amber-900/30">
              🪙 {data.player.money} Koin
            </div>
            <button
              onClick={onClose}
              className="pixel-button p-1 rounded text-amber-950"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-amber-900">
          Masukkan hasil panen, ikan, kayu, atau hasil ternak untuk langsung dijual dan mendapatkan koin emas!
        </p>

        {/* Sellable Inventory List */}
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          {data.inventory.filter((s) => s !== null && s.item.sellPrice > 0).length === 0 ? (
            <div className="text-center py-8 text-xs text-amber-800 italic">
              Tidak ada hasil panen atau barang bernilai jual di dalam tas Anda saat ini.
            </div>
          ) : (
            data.inventory.map((slot, idx) => {
              if (!slot || slot.item.sellPrice <= 0) return null;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded bg-amber-50 border border-amber-900/30"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getItemEmoji(slot.item.id)}</span>
                    <div>
                      <div className="font-bold text-xs text-amber-950">{slot.item.name}</div>
                      <div className="text-[10px] text-amber-800">
                        {slot.item.category} • Jumlah: {slot.quantity}x
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="font-pixel text-xs text-amber-900 font-bold mr-2">
                      🪙 {slot.item.sellPrice}
                    </div>
                    <button
                      onClick={() => handleSell(idx, 1)}
                      className="pixel-button px-2.5 py-1 rounded text-xs font-bold text-amber-950 bg-amber-300"
                    >
                      Jual 1x
                    </button>
                    {slot.quantity > 1 && (
                      <button
                        onClick={() => handleSell(idx, slot.quantity)}
                        className="pixel-button px-2.5 py-1 rounded text-xs font-bold text-amber-950 bg-amber-400"
                      >
                        Jual Semua
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
