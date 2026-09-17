import React, { useState } from 'react';
import { GameController } from '../game/engine/gameController';
import { ITEMS_DATABASE } from '../game/data/items';
import { getItemEmoji } from './HUD';
import { X, ShoppingCart, Plus, Minus } from 'lucide-react';
import { soundManager } from '../game/audio/soundManager';
import { Animal } from '../types/game';

interface ShopModalProps {
  controller: GameController;
  npcId: string;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ controller, npcId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'animals'>('buy');
  const [selectedItemId, setSelectedItemId] = useState<string>('seed_carrot');
  const [quantity, setQuantity] = useState<number>(1);
  const { data } = controller;

  // Catalog based on NPC
  let shopItems: (typeof ITEMS_DATABASE[string])[] = [];
  let shopTitle = "Toko Bibit Mira";

  if (npcId === 'mira') {
    shopTitle = "Toko Bibit & Pertanian Mira";
    shopItems = [
      ITEMS_DATABASE['seed_carrot'],
      ITEMS_DATABASE['seed_potato'],
      ITEMS_DATABASE['seed_strawberry'],
      ITEMS_DATABASE['seed_tomato'],
      ITEMS_DATABASE['seed_corn'],
      ITEMS_DATABASE['seed_watermelon'],
      ITEMS_DATABASE['seed_pumpkin'],
      ITEMS_DATABASE['seed_mushroom'],
      ITEMS_DATABASE['animal_feed'],
    ];
  } else if (npcId === 'theo') {
    shopTitle = "Bengkel & Peternakan Theo";
    shopItems = [
      ITEMS_DATABASE['mat_wood'],
      ITEMS_DATABASE['mat_stone'],
    ];
  } else if (npcId === 'lily') {
    shopTitle = "Toko Roti & Kue Lily";
    shopItems = [
      ITEMS_DATABASE['food_bread'],
      ITEMS_DATABASE['food_pie'],
      ITEMS_DATABASE['food_soup'],
      ITEMS_DATABASE['food_salad'],
    ];
  }

  const selectedItem = ITEMS_DATABASE[selectedItemId] || shopItems[0];
  const totalPrice = (selectedItem?.buyPrice || 10) * quantity;

  const handleBuy = () => {
    if (!selectedItem) return;
    controller.buyItem(selectedItem, quantity);
  };

  const handleBuyAnimal = (type: Animal['type'], name: string, price: number) => {
    controller.buyAnimal(type, name, price);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="pixel-box w-full max-w-2xl p-5 relative flex flex-col gap-4 bg-amber-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-amber-900/40 pb-2">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-950" />
            <h2 className="font-pixel text-sm text-amber-950">{shopTitle}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 font-pixel text-xs text-amber-950 bg-amber-200 px-2 py-1 rounded border border-amber-900/40">
              <span>🪙</span>
              <span>{data.player.money} Koin</span>
            </div>
            <button
              onClick={onClose}
              className="pixel-button p-1 rounded text-amber-950"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-amber-900/30 pb-2">
          <button
            onClick={() => {
              setActiveTab('buy');
              soundManager.playUiClick();
            }}
            className={`pixel-button px-4 py-1 rounded text-xs font-bold ${
              activeTab === 'buy' ? 'bg-amber-300 text-amber-950' : 'text-amber-800'
            }`}
          >
            Beli Barang
          </button>
          {npcId === 'theo' && (
            <button
              onClick={() => {
                setActiveTab('animals');
                soundManager.playUiClick();
              }}
              className={`pixel-button px-4 py-1 rounded text-xs font-bold ${
                activeTab === 'animals' ? 'bg-amber-300 text-amber-950' : 'text-amber-800'
              }`}
            >
              Adopsi Hewan Ternak
            </button>
          )}
          <button
            onClick={() => {
              setActiveTab('sell');
              soundManager.playUiClick();
            }}
            className={`pixel-button px-4 py-1 rounded text-xs font-bold ${
              activeTab === 'sell' ? 'bg-amber-300 text-amber-950' : 'text-amber-800'
            }`}
          >
            Jual Hasil Panen
          </button>
        </div>

        {/* Tab 1: Buy Items */}
        {activeTab === 'buy' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Items List */}
            <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
              {shopItems.map((item) => {
                const isSelected = selectedItemId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedItemId(item.id);
                      soundManager.playUiClick();
                    }}
                    className={`flex items-center justify-between p-2 rounded border-2 text-left transition-all ${
                      isSelected
                        ? 'border-amber-950 bg-amber-200'
                        : 'border-amber-800/20 bg-amber-50 hover:bg-amber-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getItemEmoji(item.id)}</span>
                      <div>
                        <div className="font-bold text-xs text-amber-950">{item.name}</div>
                        <div className="text-[10px] text-amber-800">{item.category}</div>
                      </div>
                    </div>
                    <div className="font-pixel text-[11px] text-amber-900 font-bold">
                      🪙 {item.buyPrice}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Item Buy Detail & Counter */}
            {selectedItem && (
              <div className="pixel-box p-3 bg-amber-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">{getItemEmoji(selectedItem.id)}</span>
                    <div>
                      <h3 className="font-bold text-amber-950 text-sm">{selectedItem.name}</h3>
                      <p className="text-[11px] text-amber-800">{selectedItem.description}</p>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between mt-4 bg-amber-200/60 p-2 rounded border border-amber-900/30">
                    <span className="text-xs font-bold text-amber-950">Jumlah:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="pixel-button p-1 rounded"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-pixel text-xs px-2 text-amber-950">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="pixel-button p-1 rounded"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between mt-3 font-bold text-xs text-amber-950">
                    <span>Total Biaya:</span>
                    <span className="font-pixel text-sm text-amber-900">🪙 {totalPrice} Koin</span>
                  </div>
                </div>

                <button
                  onClick={handleBuy}
                  disabled={data.player.money < totalPrice}
                  className={`pixel-button w-full mt-4 py-2 rounded text-xs font-bold text-amber-950 ${
                    data.player.money >= totalPrice
                      ? 'bg-emerald-400 hover:bg-emerald-300'
                      : 'opacity-50 cursor-not-allowed bg-amber-200'
                  }`}
                >
                  Beli Sekarang
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Adopt Animals (Theo) */}
        {activeTab === 'animals' && (
          <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto">
            <div className="pixel-box p-3 bg-amber-50 flex flex-col justify-between items-center text-center">
              <span className="text-3xl">🐔</span>
              <h4 className="font-bold text-xs text-amber-950 mt-1">Ayam (Chicken)</h4>
              <p className="text-[10px] text-amber-800">Menghasilkan telur setiap pagi saat bahagia.</p>
              <div className="font-pixel text-[11px] text-amber-900 mt-2 font-bold">🪙 200 Koin</div>
              <button
                onClick={() => handleBuyAnimal('chicken', 'Chicky', 200)}
                disabled={data.player.money < 200}
                className="pixel-button w-full mt-2 py-1 rounded text-xs font-bold text-amber-950 bg-amber-300"
              >
                Adopsi
              </button>
            </div>

            <div className="pixel-box p-3 bg-amber-50 flex flex-col justify-between items-center text-center">
              <span className="text-3xl">🐮</span>
              <h4 className="font-bold text-xs text-amber-950 mt-1">Sapi (Cow)</h4>
              <p className="text-[10px] text-amber-800">Menghasilkan susu segar berkualitas tinggi.</p>
              <div className="font-pixel text-[11px] text-amber-900 mt-2 font-bold">🪙 500 Koin</div>
              <button
                onClick={() => handleBuyAnimal('cow', 'Bessie', 500)}
                disabled={data.player.money < 500}
                className="pixel-button w-full mt-2 py-1 rounded text-xs font-bold text-amber-950 bg-amber-300"
              >
                Adopsi
              </button>
            </div>

            <div className="pixel-box p-3 bg-amber-50 flex flex-col justify-between items-center text-center">
              <span className="text-3xl">🐑</span>
              <h4 className="font-bold text-xs text-amber-950 mt-1">Domba (Sheep)</h4>
              <p className="text-[10px] text-amber-800">Menghasilkan wol hangat untuk kerajinan.</p>
              <div className="font-pixel text-[11px] text-amber-900 mt-2 font-bold">🪙 400 Koin</div>
              <button
                onClick={() => handleBuyAnimal('sheep', 'Woolly', 400)}
                disabled={data.player.money < 400}
                className="pixel-button w-full mt-2 py-1 rounded text-xs font-bold text-amber-950 bg-amber-300"
              >
                Adopsi
              </button>
            </div>

            <div className="pixel-box p-3 bg-amber-50 flex flex-col justify-between items-center text-center">
              <span className="text-3xl">🐰</span>
              <h4 className="font-bold text-xs text-amber-950 mt-1">Kelinci (Rabbit)</h4>
              <p className="text-[10px] text-amber-800">Menghasilkan bulu halus yang langka dan berharga.</p>
              <div className="font-pixel text-[11px] text-amber-900 mt-2 font-bold">🪙 300 Koin</div>
              <button
                onClick={() => handleBuyAnimal('rabbit', 'Fluffy', 300)}
                disabled={data.player.money < 300}
                className="pixel-button w-full mt-2 py-1 rounded text-xs font-bold text-amber-950 bg-amber-300"
              >
                Adopsi
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Sell Items from Player Bag */}
        {activeTab === 'sell' && (
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {data.inventory.filter((s) => s !== null && s.item.sellPrice > 0).length === 0 ? (
              <div className="text-center py-8 text-xs text-amber-800 italic">
                Tidak ada barang yang bisa dijual di dalam tas Anda saat ini.
              </div>
            ) : (
              data.inventory.map((slot, idx) => {
                if (!slot || slot.item.sellPrice <= 0) return null;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded bg-amber-50 border border-amber-900/30"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getItemEmoji(slot.item.id)}</span>
                      <div>
                        <div className="font-bold text-xs text-amber-950">{slot.item.name}</div>
                        <div className="text-[10px] text-amber-800">
                          Tersedia: {slot.quantity}x
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-pixel text-xs text-amber-900 font-bold">
                        🪙 {slot.item.sellPrice} / unit
                      </div>
                      <button
                        onClick={() => controller.sellItem(idx, 1)}
                        className="pixel-button px-3 py-1 rounded text-xs font-bold text-amber-950 bg-amber-300"
                      >
                        Jual 1x
                      </button>
                      {slot.quantity > 1 && (
                        <button
                          onClick={() => controller.sellItem(idx, slot.quantity)}
                          className="pixel-button px-3 py-1 rounded text-xs font-bold text-amber-950 bg-amber-400"
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
        )}
      </div>
    </div>
  );
};
