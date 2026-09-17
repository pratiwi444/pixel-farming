import React from 'react';
import { GameController } from '../game/engine/gameController';
import { X, MapPin } from 'lucide-react';

interface MapModalProps {
  controller: GameController;
  onClose: () => void;
}

export const MapModal: React.FC<MapModalProps> = ({ controller, onClose }) => {
  const { data } = controller;
  const currentArea = data.player.area;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="pixel-box w-full max-w-xl p-5 relative flex flex-col gap-4 bg-amber-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-amber-900/40 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <h2 className="font-pixel text-sm text-amber-950">Peta Lembah Meadowlight</h2>
          </div>
          <button
            onClick={onClose}
            className="pixel-button p-1 rounded text-amber-950"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Illustrated World Map Canvas */}
        <div className="relative w-full h-72 rounded-lg border-4 border-amber-950 bg-emerald-800 overflow-hidden shadow-inner p-4 flex flex-col justify-between">
          {/* North: Whispering Woods (Forest) */}
          <div className="flex justify-center">
            <div
              className={`pixel-box px-4 py-2 flex items-center gap-2 transition-all ${
                currentArea === 'forest'
                  ? 'bg-amber-300 border-amber-950 scale-105 ring-2 ring-amber-500'
                  : 'bg-emerald-950/80 text-emerald-100 border-emerald-900'
              }`}
            >
              <span>🌲 Hutan Berbisik (Whispering Woods)</span>
              {currentArea === 'forest' && (
                <span className="font-pixel text-[9px] bg-rose-600 text-white px-1 py-0.5 rounded animate-bounce">
                  KAMU DISINI
                </span>
              )}
            </div>
          </div>

          {/* Middle: Farm (Left) and Village (Right) */}
          <div className="flex items-center justify-around">
            {/* Meadow Farm */}
            <div
              className={`pixel-box px-4 py-2 flex flex-col items-center gap-1 transition-all ${
                currentArea === 'farm' || currentArea === 'house_interior'
                  ? 'bg-amber-300 border-amber-950 scale-105 ring-2 ring-amber-500'
                  : 'bg-amber-900/80 text-amber-100 border-amber-950'
              }`}
            >
              <span className="font-bold text-xs">🏡 Kebun Petani (Farm)</span>
              <span className="text-[10px] opacity-80">Rumah, Lahan, & Kandang</span>
              {(currentArea === 'farm' || currentArea === 'house_interior') && (
                <span className="font-pixel text-[8px] bg-rose-600 text-white px-1 py-0.5 rounded animate-bounce mt-0.5">
                  KAMU DISINI
                </span>
              )}
            </div>

            {/* Path connector */}
            <div className="h-1 flex-1 bg-amber-400/40 mx-4 border-t-2 border-dashed border-amber-900" />

            {/* Meadowlight Village */}
            <div
              className={`pixel-box px-4 py-2 flex flex-col items-center gap-1 transition-all ${
                currentArea === 'village'
                  ? 'bg-amber-300 border-amber-950 scale-105 ring-2 ring-amber-500'
                  : 'bg-amber-900/80 text-amber-100 border-amber-950'
              }`}
            >
              <span className="font-bold text-xs">🏘️ Desa Meadowlight</span>
              <span className="text-[10px] opacity-80">Air Mancur, Toko, & Warga</span>
              {currentArea === 'village' && (
                <span className="font-pixel text-[8px] bg-rose-600 text-white px-1 py-0.5 rounded animate-bounce mt-0.5">
                  KAMU DISINI
                </span>
              )}
            </div>
          </div>

          {/* South-East: Silverlake Dock (Lake) */}
          <div className="flex justify-end pr-6">
            <div
              className={`pixel-box px-4 py-2 flex items-center gap-2 transition-all ${
                currentArea === 'lake'
                  ? 'bg-amber-300 border-amber-950 scale-105 ring-2 ring-amber-500'
                  : 'bg-sky-950/80 text-sky-100 border-sky-900'
              }`}
            >
              <span>🎣 Dermaga Danau Silverlake</span>
              {currentArea === 'lake' && (
                <span className="font-pixel text-[9px] bg-rose-600 text-white px-1 py-0.5 rounded animate-bounce">
                  KAMU DISINI
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="text-[11px] text-amber-900 text-center font-medium">
          Gunakan jalan setapak untuk berpindah antar wilayah dengan berjalan ke tepi peta!
        </div>
      </div>
    </div>
  );
};
