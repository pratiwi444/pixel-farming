import React, { useState } from 'react';
import { GameController } from '../game/engine/gameController';
import { SaveSystem } from '../game/engine/saveSystem';
import { soundManager } from '../game/audio/soundManager';
import { X, Play, Save, Volume2, VolumeX, Music, HelpCircle, LogOut } from 'lucide-react';

interface PauseModalProps {
  controller: GameController;
  onClose: () => void;
  onReturnToMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  controller,
  onClose,
  onReturnToMainMenu,
}) => {
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const isMuted = soundManager.getIsMuted();
  const isMusic = soundManager.getIsMusicPlaying();

  const handleSave = () => {
    const success = SaveSystem.saveGame(controller.data);
    soundManager.playUiClick();
    if (success) {
      setSaveMessage('Progres Permainan Berhasil Disimpan!');
      setTimeout(() => setSaveMessage(''), 3000);
    } else {
      setSaveMessage('Gagal menyimpan permainan.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none">
      <div className="pixel-box w-full max-w-md p-6 relative flex flex-col gap-4 bg-amber-100">
        <div className="flex items-center justify-between border-b-2 border-amber-900/40 pb-2">
          <h2 className="font-pixel text-sm text-amber-950">Menu Jeda (Pause)</h2>
          <button
            onClick={onClose}
            className="pixel-button p-1 rounded text-amber-950"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {saveMessage && (
          <div className="bg-emerald-100 border-2 border-emerald-600 p-2 rounded text-center font-bold text-xs text-emerald-950 animate-pulse">
            {saveMessage}
          </div>
        )}

        {/* Buttons List */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onClose}
            className="pixel-button py-2.5 px-4 rounded flex items-center justify-center gap-2 text-xs font-bold text-amber-950 bg-amber-300 hover:bg-amber-200"
          >
            <Play className="w-4 h-4" />
            <span>Lanjutkan Permainan (Resume)</span>
          </button>

          <button
            onClick={handleSave}
            className="pixel-button py-2.5 px-4 rounded flex items-center justify-center gap-2 text-xs font-bold text-amber-950 bg-emerald-400 hover:bg-emerald-300"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Permainan (Save Game)</span>
          </button>

          {/* Sound & Music Controls */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => soundManager.toggleMute()}
              className="pixel-button py-2 px-3 rounded flex items-center justify-center gap-1.5 text-xs font-bold text-amber-950"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-700" /> : <Volume2 className="w-4 h-4" />}
              <span>{isMuted ? 'Suara Mati' : 'Suara Nyala'}</span>
            </button>

            <button
              onClick={() => soundManager.toggleMusic()}
              className="pixel-button py-2 px-3 rounded flex items-center justify-center gap-1.5 text-xs font-bold text-amber-950"
            >
              <Music className="w-4 h-4" />
              <span>{isMusic ? 'Musik Nyala' : 'Musik Mati'}</span>
            </button>
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="pixel-button py-2 px-4 rounded flex items-center justify-center gap-2 text-xs font-bold text-amber-950"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Panduan Tombol Kontrol</span>
          </button>

          {showGuide && (
            <div className="pixel-box p-3 bg-amber-50 text-[11px] text-amber-950 flex flex-col gap-1 leading-relaxed">
              <div><strong>W, A, S, D / Tombol Panah:</strong> Bergerak</div>
              <div><strong>Spasi / Klik Layar:</strong> Gunakan Alat / Tanam Bibit / Memancing</div>
              <div><strong>E:</strong> Berinteraksi (Bicara NPC, Panen, Elus Hewan, Buka Pintu)</div>
              <div><strong>I:</strong> Buka Tas Inventori (24 Slot)</div>
              <div><strong>M:</strong> Buka Peta Lembah</div>
              <div><strong>Q:</strong> Papan Misi (Quests)</div>
              <div><strong>Angka 1 - 8:</strong> Pilih slot Hotbar</div>
              <div><strong>ESC:</strong> Menu Jeda</div>
            </div>
          )}

          <button
            onClick={onReturnToMainMenu}
            className="pixel-button py-2 px-4 rounded flex items-center justify-center gap-2 text-xs font-bold text-rose-950 bg-rose-200 hover:bg-rose-300 mt-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Kembali ke Menu Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
};
