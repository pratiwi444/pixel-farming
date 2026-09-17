import React, { useState } from 'react';
import { GameController } from '../game/engine/gameController';
import { COOKING_RECIPES } from '../game/data/recipes';
import { ITEMS_DATABASE } from '../game/data/items';
import { getItemEmoji } from './HUD';
import { X, Utensils, Check, AlertCircle } from 'lucide-react';
import { soundManager } from '../game/audio/soundManager';

interface CookingModalProps {
  controller: GameController;
  onClose: () => void;
}

export const CookingModal: React.FC<CookingModalProps> = ({ controller, onClose }) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('recipe_vegetable_soup');
  const { data } = controller;

  // Helper to count available items in inventory
  const getInventoryCount = (itemId: string): number => {
    let count = 0;
    for (const slot of data.inventory) {
      if (slot && slot.item.id === itemId) {
        count += slot.quantity;
      }
    }
    return count;
  };

  const selectedRecipe = COOKING_RECIPES.find((r) => r.id === selectedRecipeId) || COOKING_RECIPES[0];
  const resultItem = ITEMS_DATABASE[selectedRecipe.resultItemId];

  // Check if player has all ingredients
  const canCook = selectedRecipe.ingredients.every(
    (ing) => getInventoryCount(ing.itemId) >= ing.count
  );

  const handleCook = () => {
    if (!canCook || !resultItem) return;

    // Deduct ingredients
    for (const ing of selectedRecipe.ingredients) {
      let needed = ing.count;
      for (let i = 0; i < data.inventory.length; i++) {
        const slot = data.inventory[i];
        if (slot && slot.item.id === ing.itemId) {
          if (slot.quantity <= needed) {
            needed -= slot.quantity;
            data.inventory[i] = null;
          } else {
            slot.quantity -= needed;
            needed = 0;
          }
          if (needed <= 0) break;
        }
      }
    }

    // Add cooked dish
    controller.addItemToInventory(resultItem, 1);
    soundManager.playHarvest();
    controller.addFloatingText(`Berhasil memasak ${resultItem.name}! 🍲`, data.player.x, data.player.y - 20, '#52b788');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="pixel-box w-full max-w-xl p-5 relative flex flex-col gap-4 bg-amber-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-amber-900/40 pb-2">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-950" />
            <h2 className="font-pixel text-sm text-amber-950">Dapur Rumah (Resep Memasak)</h2>
          </div>
          <button
            onClick={onClose}
            className="pixel-button p-1 rounded text-amber-950"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recipes Grid & Detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recipes List */}
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {COOKING_RECIPES.map((recipe) => {
              const isSelected = selectedRecipeId === recipe.id;
              const hasItems = recipe.ingredients.every(
                (ing) => getInventoryCount(ing.itemId) >= ing.count
              );

              return (
                <button
                  key={recipe.id}
                  onClick={() => {
                    setSelectedRecipeId(recipe.id);
                    soundManager.playUiClick();
                  }}
                  className={`flex items-center justify-between p-2.5 rounded border-2 text-left transition-all ${
                    isSelected
                      ? 'border-amber-950 bg-amber-200'
                      : 'border-amber-800/20 bg-amber-50 hover:bg-amber-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getItemEmoji(recipe.resultItemId)}</span>
                    <div>
                      <div className="font-bold text-xs text-amber-950">{recipe.name}</div>
                      <div className="text-[10px] text-amber-800">
                        {recipe.ingredients.length} Bahan Masakan
                      </div>
                    </div>
                  </div>
                  {hasItems ? (
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-pixel px-1.5 py-0.5 rounded">
                      Siap
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-700/60 font-pixel">Kurang</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Recipe Details & Ingredients */}
          <div className="pixel-box p-3 bg-amber-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{getItemEmoji(selectedRecipe.resultItemId)}</span>
                <div>
                  <h3 className="font-bold text-amber-950 text-sm">{selectedRecipe.name}</h3>
                  <p className="text-[11px] text-amber-800">{selectedRecipe.description}</p>
                </div>
              </div>

              {/* Ingredients Checklist */}
              <div className="mt-3">
                <span className="text-xs font-bold text-amber-950">Bahan yang Dibutuhkan:</span>
                <div className="flex flex-col gap-1.5 mt-2">
                  {selectedRecipe.ingredients.map((ing) => {
                    const have = getInventoryCount(ing.itemId);
                    const isEnough = have >= ing.count;
                    const itemData = ITEMS_DATABASE[ing.itemId];

                    return (
                      <div
                        key={ing.itemId}
                        className={`flex items-center justify-between p-1.5 rounded border text-xs ${
                          isEnough
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                            : 'bg-rose-50 border-rose-200 text-rose-950'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{getItemEmoji(ing.itemId)}</span>
                          <span className="font-medium">{itemData?.name || ing.itemId}</span>
                        </div>
                        <div className="flex items-center gap-1 font-pixel text-[10px]">
                          <span>{have}/{ing.count}</span>
                          {isEnough ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Energy Bonus */}
              {resultItem?.energyRestored && (
                <div className="mt-3 text-xs text-emerald-800 font-semibold flex items-center gap-1">
                  <span>⚡ Pulihkan: +{resultItem.energyRestored} Energi saat dimakan</span>
                </div>
              )}
            </div>

            <button
              onClick={handleCook}
              disabled={!canCook}
              className={`pixel-button w-full mt-4 py-2 rounded text-xs font-bold text-amber-950 ${
                canCook
                  ? 'bg-emerald-400 hover:bg-emerald-300'
                  : 'opacity-50 cursor-not-allowed bg-amber-200'
              }`}
            >
              Masak Hidangan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
