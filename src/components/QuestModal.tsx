import React from 'react';
import { GameController } from '../game/engine/gameController';
import { getItemEmoji } from './HUD';
import { X, ScrollText, Award, CheckCircle2 } from 'lucide-react';
import { NPCS_DATA } from '../game/data/npcs';

interface QuestModalProps {
  controller: GameController;
  onClose: () => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({ controller, onClose }) => {
  const { data } = controller;

  // Calculate current progress for each quest
  const getProgress = (targetItemId: string) => {
    let count = 0;
    for (const slot of data.inventory) {
      if (slot && slot.item.id === targetItemId) {
        count += slot.quantity;
      }
    }
    return count;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="pixel-box w-full max-w-xl p-5 relative flex flex-col gap-4 bg-amber-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-amber-900/40 pb-2">
          <div className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-amber-950" />
            <h2 className="font-pixel text-sm text-amber-950">Papan Misi Desa (Quests)</h2>
          </div>
          <button
            onClick={onClose}
            className="pixel-button p-1 rounded text-amber-950"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quests List */}
        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
          {data.quests.map((quest) => {
            const currentQty = getProgress(quest.targetItemId);
            const isReady = currentQty >= quest.targetQuantity;
            const npc = NPCS_DATA[quest.giverNpcId];

            return (
              <div
                key={quest.id}
                className={`pixel-box p-3.5 flex flex-col gap-2 transition-all ${
                  quest.isClaimed
                    ? 'bg-amber-200/40 opacity-70 border-amber-900/30'
                    : quest.isCompleted || isReady
                    ? 'bg-amber-200 border-amber-950 ring-2 ring-amber-500'
                    : 'bg-amber-50 border-amber-900/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs text-amber-950">{quest.title}</h3>
                      <span className="text-[10px] text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded font-medium">
                        Dari: {npc?.name || quest.giverNpcId}
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 mt-1">{quest.description}</p>
                  </div>
                  <span className="text-2xl">{getItemEmoji(quest.targetItemId)}</span>
                </div>

                {/* Progress bar & Rewards */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-900/20 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-pixel text-[10px] text-amber-950">
                      Progress: {Math.min(quest.targetQuantity, currentQty)}/{quest.targetQuantity}
                    </span>
                    <span className="font-pixel text-[10px] text-amber-900">
                      🪙 +{quest.rewardCoins} | ❤️ +{quest.rewardFriendship}
                    </span>
                  </div>

                  {quest.isClaimed ? (
                    <div className="flex items-center gap-1 text-emerald-800 font-pixel text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selesai</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => controller.claimQuest(quest.id)}
                      disabled={!isReady}
                      className={`pixel-button px-3 py-1 rounded text-xs font-bold ${
                        isReady
                          ? 'bg-emerald-400 hover:bg-emerald-300 text-amber-950 shadow-md animate-pulse'
                          : 'opacity-50 cursor-not-allowed text-amber-800 bg-amber-200'
                      }`}
                    >
                      Klaim Hadiah
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
