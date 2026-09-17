import React from 'react';
import { GameController } from '../game/engine/gameController';
import { Moon, Sparkles, X } from 'lucide-react';

interface SleepConfirmModalProps {
  controller: GameController;
  onClose: () => void;
}

export const SleepConfirmModal: React.FC<SleepConfirmModalProps> = ({ controller, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none">
      <div className="pixel-box w-full max-w-sm p-5 relative flex flex-col items-center gap-4 bg-amber-100 text-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 pixel-button p-1 rounded text-amber-950"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-full bg-amber-200 border-2 border-amber-950 flex items-center justify-center text-3xl shadow-md">
          🛏️
        </div>

        <div>
          <h3 className="font-pixel text-xs text-amber-950">Tidur & Istirahat?</h3>
          <p className="text-xs text-amber-900 mt-2 leading-relaxed">
            Apakah Anda ingin tidur dan mengakhiri hari ini? Energi akan terisi penuh kembali menjadi 100%, tanaman yang disiram akan bertumbuh, dan hewan ternak akan menghasilkan produk.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full mt-2">
          <button
            onClick={onClose}
            className="pixel-button flex-1 py-2 rounded text-xs font-bold text-amber-950"
          >
            Belum, Nanti Saja
          </button>
          <button
            onClick={() => controller.advanceToNextDay()}
            className="pixel-button flex-1 py-2 rounded text-xs font-bold text-amber-950 bg-emerald-400 hover:bg-emerald-300 shadow-md"
          >
            Ya, Tidur Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};
