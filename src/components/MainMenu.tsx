import React, { useState } from 'react';
import { SaveSystem } from '../game/engine/saveSystem';
import { soundManager } from '../game/audio/soundManager';
import { Play, RotateCcw, HelpCircle, Volume2, VolumeX, Music, Trash2, Sparkles } from 'lucide-react';

interface MainMenuProps {
  onNewGame: () => void;
  onContinue: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onNewGame, onContinue }) => {
  const hasSave = SaveSystem.hasSave();
  const savedData = hasSave ? SaveSystem.loadSave() : null;
  const [showControls, setShowControls] = useState(false);
  const isMuted = soundManager.getIsMuted();
  const isMusic = soundManager.getIsMusicPlaying();

  const handleStartMusic = () => {
    soundManager.init();
    soundManager.startMusic();
  };

  const handleDeleteSave = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data permainan yang tersimpan?')) {
      SaveSystem.deleteSave();
      window.location.reload();
    }
  };

  return (
    <div
      onClick={handleStartMusic}
      className="relative w-full h-full flex flex-col items-center justify-between p-6 select-none bg-gradient-to-b from-sky-300 via-amber-100 to-emerald-300 overflow-hidden"
    >
      {/* Background Pixel Art Atmosphere */}
      <div className="absolute inset-0 pointer-events-none opacity-30 flex flex-col justify-between">
        <div className="w-full flex justify-between p-8">
          <div className="w-24 h-12 bg-white/70 rounded-full blur-xs animate-pulse" />
          <div className="w-32 h-14 bg-white/80 rounded-full blur-xs" />
        </div>
        <div className="w-full h-32 bg-emerald-700/40 rounded-t-full scale-125" />
      </div>

      {/* Top Bar Audio */}
      <div className="w-full flex justify-end gap-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundManager.toggleMute();
          }}
          className="pixel-button p-2 text-amber-950 rounded"
          title="Toggle SFX"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-700" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundManager.toggleMusic();
          }}
          className="pixel-button p-2 text-amber-950 rounded"
          title="Toggle Music"
        >
          <Music className={`w-4 h-4 ${isMusic ? 'text-amber-950' : 'text-amber-700/50'}`} />
        </button>
      </div>

      {/* Center Title Banner */}
      <div className="flex flex-col items-center gap-3 z-10 text-center my-auto">
        <div className="text-4xl animate-bounce">🌻</div>
        <h1 className="font-pixel text-2xl md:text-4xl text-amber-950 drop-shadow-[0_4px_0_rgba(180,83,9,0.4)] tracking-wide">
          MEADOWLIGHT
          <span className="block text-amber-900 mt-1">VILLAGE</span>
        </h1>
        <p className="font-pixel text-[10px] md:text-xs text-amber-800 bg-amber-200/80 px-3 py-1 rounded-full border border-amber-900/40 shadow-xs">
          Simulasi Pertanian & Kehidupan Santai
        </p>

        {/* Menu Buttons */}
        <div className="flex flex-col gap-3 w-72 mt-6">
          {hasSave && savedData && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playUiClick();
                onContinue();
              }}
              className="pixel-button py-3 px-4 rounded text-xs font-bold text-amber-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 fill-amber-950" />
                <span>LANJUTKAN</span>
              </div>
              <span className="font-pixel text-[9px] text-amber-900">
                Hari {savedData.day} • 🪙{savedData.player.money}
              </span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              soundManager.playUiClick();
              onNewGame();
            }}
            className="pixel-button py-3 px-4 rounded text-xs font-bold text-amber-950 bg-amber-300 hover:bg-amber-200 shadow-md flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>PERMAINAN BARU</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowControls(!showControls);
              soundManager.playUiClick();
            }}
            className="pixel-button py-2.5 px-4 rounded text-xs font-bold text-amber-950 flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            <span>PANDUAN KONTROL</span>
          </button>

          {hasSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteSave();
              }}
              className="pixel-button py-1.5 px-3 rounded text-[10px] font-bold text-rose-800 bg-rose-100 hover:bg-rose-200 flex items-center justify-center gap-1 mt-2 opacity-80 hover:opacity-100"
            >
              <Trash2 className="w-3 h-3" />
              <span>Hapus Data Simpanan</span>
            </button>
          )}
        </div>

        {/* Controls Guide Popup */}
        {showControls && (
          <div className="pixel-box p-4 bg-amber-50 text-[11px] text-amber-950 text-left max-w-sm mt-4 shadow-xl flex flex-col gap-1.5">
            <div className="font-bold border-b border-amber-900/30 pb-1 text-center font-pixel text-xs">
              KONTROL PERMAINAN
            </div>
            <div><strong>W, A, S, D / Panah:</strong> Berjalan</div>
            <div><strong>Spasi / Klik Layar:</strong> Gunakan Cangkul / Siram / Tebang / Pancing</div>
            <div><strong>E:</strong> Interaksi (Warga, Panen Tanaman, Elus Ternak, Masuk Pintu)</div>
            <div><strong>I:</strong> Buka Tas Inventori (24 Slot)</div>
            <div><strong>M:</strong> Peta Lembah</div>
            <div><strong>Q:</strong> Papan Misi / Quest</div>
            <div><strong>1 - 8:</strong> Pilih Alat di Hotbar</div>
            <div className="text-[10px] text-amber-800 italic mt-1">
              *Di HP / Tablet: Tersedia Virtual Analog & Tombol Aksi di layar secara otomatis!
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-[10px] font-pixel text-amber-950/70 z-10 text-center">
        Meadowlight Village v1.0 • Original Cozy 2D Simulation
      </div>
    </div>
  );
};
