import React, { useState } from 'react';
import { GameController } from '../game/engine/gameController';
import { NPCS_DATA } from '../game/data/npcs';
import { soundManager } from '../game/audio/soundManager';
import { MessageCircle, ShoppingBag, ScrollText, X, Heart } from 'lucide-react';

interface DialogueModalProps {
  controller: GameController;
  npcId: string;
  onClose: () => void;
  onOpenShop: (npcId: string) => void;
  onOpenQuests: () => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  controller,
  npcId,
  onClose,
  onOpenShop,
  onOpenQuests,
}) => {
  const npcDef = NPCS_DATA[npcId] || NPCS_DATA['mira'];
  const npcState = controller.data.npcs[npcId] || { friendship: 15, talkedToday: false };

  // Select dynamic dialogue based on friendship level
  let dialogueList = npcDef.defaultDialogue;
  if (npcState.friendship > 60) {
    dialogueList = npcDef.friendshipDialogue.high;
  } else if (npcState.friendship > 30) {
    dialogueList = npcDef.friendshipDialogue.med;
  } else {
    dialogueList = npcDef.friendshipDialogue.low;
  }

  const [dialogueIndex, setDialogueIndex] = useState(0);
  const currentText = dialogueList[dialogueIndex % dialogueList.length];

  const handleNextText = () => {
    soundManager.playUiClick();
    setDialogueIndex((prev) => prev + 1);
  };

  // Hearts calculation (5 hearts max)
  const filledHearts = Math.min(5, Math.floor(npcState.friendship / 20));

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none">
      <div className="pixel-box w-full max-w-2xl p-5 relative flex flex-col md:flex-row gap-5 items-center md:items-start bg-amber-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 pixel-button p-1 rounded text-amber-950"
        >
          <X className="w-4 h-4" />
        </button>

        {/* NPC Pixel Portrait Card */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-lg bg-amber-200 border-4 border-amber-950 shadow-md flex items-center justify-center overflow-hidden p-2">
            {/* High-res pixel art portrait avatar */}
            <div className="w-full h-full rounded flex flex-col items-center justify-center bg-amber-300">
              <span className="text-4xl">
                {npcId === 'mira' && '👩‍🌾'}
                {npcId === 'theo' && '🧔‍♂️'}
                {npcId === 'lily' && '👩‍🍳'}
                {npcId === 'rowan' && '🏹'}
                {npcId === 'nia' && '🌿'}
              </span>
            </div>
          </div>

          <div className="text-center">
            <h3 className="font-bold text-amber-950 text-sm leading-tight">{npcDef.name}</h3>
            <p className="font-pixel text-[8px] text-amber-800">{npcDef.role}</p>
          </div>

          {/* Friendship Hearts */}
          <div className="flex items-center gap-0.5 mt-1" title={`Persahabatan: ${npcState.friendship}/100`}>
            {[1, 2, 3, 4, 5].map((heartIdx) => (
              <Heart
                key={heartIdx}
                className={`w-3.5 h-3.5 ${
                  heartIdx <= filledHearts
                    ? 'fill-rose-500 text-rose-600'
                    : 'text-amber-900/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Dialogue Box & Options */}
        <div className="flex-1 flex flex-col justify-between w-full h-full min-h-[120px]">
          {/* Text Bubble */}
          <div
            onClick={handleNextText}
            className="pixel-box p-4 bg-amber-50/90 border-amber-900/60 rounded cursor-pointer min-h-[75px] flex items-center shadow-inner"
          >
            <p className="text-amber-950 text-sm md:text-base leading-relaxed font-medium">
              "{currentText}"
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              onClick={handleNextText}
              className="pixel-button px-3.5 py-1.5 rounded flex items-center gap-1.5 text-xs text-amber-950 font-bold"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Ngobrol Lagi</span>
            </button>

            {npcDef.shopType && (
              <button
                onClick={() => onOpenShop(npcId)}
                className="pixel-button px-3.5 py-1.5 rounded flex items-center gap-1.5 text-xs text-amber-950 font-bold bg-amber-300 hover:bg-amber-200"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Buka Toko</span>
              </button>
            )}

            <button
              onClick={onOpenQuests}
              className="pixel-button px-3.5 py-1.5 rounded flex items-center gap-1.5 text-xs text-amber-950 font-bold"
            >
              <ScrollText className="w-4 h-4" />
              <span>Daftar Misi</span>
            </button>

            <button
              onClick={onClose}
              className="pixel-button px-3.5 py-1.5 rounded text-xs text-amber-950 font-bold ml-auto"
            >
              Sampai Jumpa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
