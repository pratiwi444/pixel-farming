import React, { useState, useEffect, useRef } from 'react';
import { PlayerCustomization } from '../types/game';
import { PixelRenderer } from '../game/rendering/pixelRenderer';
import { soundManager } from '../game/audio/soundManager';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface CharacterCreatorProps {
  onConfirm: (customization: PlayerCustomization) => void;
  onBack: () => void;
}

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onConfirm, onBack }) => {
  const [name, setName] = useState('Robin');
  const [hairStyle, setHairStyle] = useState<number>(0);
  const [hairColor, setHairColor] = useState('#603813');
  const [shirtColor, setShirtColor] = useState('#2a9d8f');
  const [pantsColor, setPantsColor] = useState('#264653');
  const [skinColor, setSkinColor] = useState('#f8d5b8');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Palettes
  const hairColors = ['#603813', '#d4a373', '#222222', '#b7094c', '#e76f51', '#7209b7'];
  const shirtColors = ['#2a9d8f', '#e76f51', '#457b9d', '#e9c46a', '#9d4edd', '#588157'];
  const pantsColors = ['#264653', '#6f4e37', '#1d3557', '#333333', '#3a5a40'];
  const skinTones = ['#fde2e4', '#f8d5b8', '#e0a96d', '#bc6c25', '#7f4f24'];
  const hairStyles = [
    { id: 0, label: 'Pendek' },
    { id: 1, label: 'Panjang' },
    { id: 2, label: 'Topi Kebun' },
  ];

  // Render preview loop
  useEffect(() => {
    let animId: number;
    let tick = 0;

    const render = () => {
      tick++;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.imageSmoothingEnabled = false;

          // Scaled up 3x for crisp preview
          ctx.save();
          ctx.scale(3, 3);
          PixelRenderer.drawPlayer(
            ctx,
            12,
            10,
            'down',
            true, // walking idle
            tick,
            hairStyle,
            hairColor,
            shirtColor,
            pantsColor,
            skinColor,
            false
          );
          ctx.restore();
        }
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [hairStyle, hairColor, shirtColor, pantsColor, skinColor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playUiClick();
    onConfirm({
      name: name.trim() || 'Petani',
      gender: 'neutral',
      skinColor,
      hairStyle,
      hairColor,
      shirtColor,
      pantsColor,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-amber-950/80 backdrop-blur-sm p-4 select-none">
      <div className="pixel-box w-full max-w-xl p-6 relative flex flex-col gap-5 bg-amber-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-amber-900/40 pb-2">
          <button
            onClick={onBack}
            className="pixel-button px-2 py-1 rounded text-xs font-bold text-amber-950 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <h2 className="font-pixel text-sm text-amber-950">Kustomisasi Karakter</h2>
          <div className="w-16" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Avatar Live Preview */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-36 h-44 rounded-lg bg-amber-200 border-4 border-amber-950 shadow-inner flex items-center justify-center">
              <canvas ref={canvasRef} width={160} height={180} className="w-32 h-36" />
            </div>
            <div className="text-center">
              <span className="font-bold text-sm text-amber-950">{name || 'Nama Petani'}</span>
              <p className="text-[10px] text-amber-800">Warga Baru Meadowlight</p>
            </div>
          </div>

          {/* Customization Options */}
          <div className="flex-1 flex flex-col gap-3 w-full">
            {/* Name Input */}
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                Nama Karakter:
              </label>
              <input
                type="text"
                value={name}
                maxLength={14}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 rounded border-2 border-amber-900 bg-amber-50 text-amber-950 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Masukkan nama..."
              />
            </div>

            {/* Hairstyle Selector */}
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                Gaya Rambut:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {hairStyles.map((style) => (
                  <button
                    type="button"
                    key={style.id}
                    onClick={() => {
                      setHairStyle(style.id);
                      soundManager.playUiClick();
                    }}
                    className={`pixel-button px-2.5 py-1 text-xs capitalize ${
                      hairStyle === style.id ? 'bg-amber-300 text-amber-950 font-bold' : 'text-amber-800'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Color Palette */}
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                Warna Rambut:
              </label>
              <div className="flex gap-2">
                {hairColors.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => {
                      setHairColor(color);
                      soundManager.playUiClick();
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      hairColor === color ? 'border-amber-950 scale-110 ring-2 ring-amber-500' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Shirt Color Palette */}
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                Warna Baju:
              </label>
              <div className="flex gap-2">
                {shirtColors.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => {
                      setShirtColor(color);
                      soundManager.playUiClick();
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      shirtColor === color ? 'border-amber-950 scale-110 ring-2 ring-amber-500' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Pants Color Palette */}
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                Warna Celana:
              </label>
              <div className="flex gap-2">
                {pantsColors.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => {
                      setPantsColor(color);
                      soundManager.playUiClick();
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      pantsColor === color ? 'border-amber-950 scale-110 ring-2 ring-amber-500' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Skin Tone Palette */}
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                Warna Kulit:
              </label>
              <div className="flex gap-2">
                {skinTones.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => {
                      setSkinColor(color);
                      soundManager.playUiClick();
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      skinColor === color ? 'border-amber-950 scale-110 ring-2 ring-amber-500' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="pixel-button w-full mt-3 py-2.5 rounded text-xs font-bold text-amber-950 bg-emerald-400 hover:bg-emerald-300 shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Mulai Petualangan di Desa!</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
