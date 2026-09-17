import React, { useState, useEffect, useReducer } from 'react';
import { GameController, GameModalType } from './game/engine/gameController';
import { SaveSystem } from './game/engine/saveSystem';
import { soundManager } from './game/audio/soundManager';
import { PlayerCustomization } from './types/game';

// Components
import { MainMenu } from './components/MainMenu';
import { CharacterCreator } from './components/CharacterCreator';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { InventoryModal } from './components/InventoryModal';
import { DialogueModal } from './components/DialogueModal';
import { ShopModal } from './components/ShopModal';
import { FishingModal } from './components/FishingModal';
import { CookingModal } from './components/CookingModal';
import { ChestStorageModal } from './components/ChestStorageModal';
import { QuestModal } from './components/QuestModal';
import { MapModal } from './components/MapModal';
import { SleepConfirmModal } from './components/SleepConfirmModal';
import { ShippingBinModal } from './components/ShippingBinModal';
import { PauseModal } from './components/PauseModal';

type AppView = 'menu' | 'creator' | 'game';

export default function App() {
  const [view, setView] = useState<AppView>('menu');
  const [controller, setController] = useState<GameController | null>(null);
  // Force update trigger for UI when controller state changes
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // Initialize Audio upon first user interaction
  useEffect(() => {
    const handleFirstClick = () => {
      soundManager.init();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, []);

  const handleStartNewGame = (customization: PlayerCustomization) => {
    const newSave = SaveSystem.createNewGame(customization);
    SaveSystem.saveGame(newSave);
    const ctrl = new GameController(newSave, () => forceUpdate());
    setController(ctrl);
    setView('game');
    soundManager.startMusic();
  };

  const handleContinueGame = () => {
    const save = SaveSystem.loadSave();
    if (save) {
      const ctrl = new GameController(save, () => forceUpdate());
      setController(ctrl);
      setView('game');
      soundManager.startMusic();
    }
  };

  const handleOpenModal = (modal: GameModalType, data: Record<string, unknown> = {}) => {
    if (!controller) return;
    controller.openModal(modal, data);
  };

  const handleCloseModal = () => {
    if (!controller) return;
    controller.closeModal();
  };

  return (
    <div className="w-screen h-screen overflow-hidden font-sans bg-amber-950 flex flex-col justify-center items-center select-none">
      {/* 1. Main Menu View */}
      {view === 'menu' && (
        <MainMenu
          onNewGame={() => setView('creator')}
          onContinue={handleContinueGame}
        />
      )}

      {/* 2. Character Creator View */}
      {view === 'creator' && (
        <CharacterCreator
          onConfirm={handleStartNewGame}
          onBack={() => setView('menu')}
        />
      )}

      {/* 3. In-Game View */}
      {view === 'game' && controller && (
        <div className="relative w-full h-full">
          {/* Main 60 FPS Pixel Art Game Canvas */}
          <GameCanvas
            controller={controller}
            onOpenModal={handleOpenModal}
          />

          {/* HUD Overlay */}
          <HUD
            controller={controller}
            onOpenModal={handleOpenModal}
            onUseItem={() => controller.useActiveItem()}
            onInteract={() => controller.interact()}
          />

          {/* Modals & Dialogues */}
          {controller.activeModal === 'inventory' && (
            <InventoryModal
              controller={controller}
              onClose={handleCloseModal}
            />
          )}

          {controller.activeModal === 'dialogue' && (
            <DialogueModal
              controller={controller}
              npcId={(controller.modalData.npcId as string) || 'mira'}
              onClose={handleCloseModal}
              onOpenShop={(npcId) => controller.openModal('shop', { npcId })}
              onOpenQuests={() => controller.openModal('quests')}
            />
          )}

          {controller.activeModal === 'shop' && (
            <ShopModal
              controller={controller}
              npcId={(controller.modalData.npcId as string) || 'mira'}
              onClose={handleCloseModal}
            />
          )}

          {controller.activeModal === 'fishing' && (
            <FishingModal controller={controller} />
          )}

          {controller.activeModal === 'cooking' && (
            <CookingModal
              controller={controller}
              onClose={handleCloseModal}
            />
          )}

          {controller.activeModal === 'chest' && (
            <ChestStorageModal
              controller={controller}
              onClose={handleCloseModal}
            />
          )}

          {controller.activeModal === 'quests' && (
            <QuestModal
              controller={controller}
              onClose={handleCloseModal}
            />
          )}

          {controller.activeModal === 'map' && (
            <MapModal
              controller={controller}
              onClose={handleCloseModal}
            />
          )}

          {controller.activeModal === 'shipping_bin' && (
            <ShippingBinModal
              controller={controller}
              onClose={handleCloseModal}
            />
          )}

          {controller.activeModal === 'sleep_confirm' && (
            <SleepConfirmModal
              controller={controller}
              onClose={handleCloseModal}
            />
          )}

          {controller.activeModal === 'pause' && (
            <PauseModal
              controller={controller}
              onClose={handleCloseModal}
              onReturnToMainMenu={() => {
                SaveSystem.saveGame(controller.data);
                setView('menu');
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
