import React, { useEffect, useRef, useState } from 'react';
import { GameController } from '../game/engine/gameController';
import { soundManager } from '../game/audio/soundManager';

interface FishingModalProps {
  controller: GameController;
}

export const FishingModal: React.FC<FishingModalProps> = ({ controller }) => {
  // Mini-game physics state
  const [fishY, setFishY] = useState(50); // 0 (top) to 100 (bottom)
  const [barY, setBarY] = useState(50);
  const [progress, setProgress] = useState(30); // 0 to 100
  const isPulling = useRef(false);

  // Pick random fish type based on player luck/season
  const fishTypes = ['fish_small', 'fish_blue', 'fish_catfish', 'fish_golden'];
  const chosenFish = useRef(
    Math.random() < 0.1 ? 'fish_golden' : fishTypes[Math.floor(Math.random() * (fishTypes.length - 1))]
  );

  useEffect(() => {
    let fishTargetY = 50;
    let fishSpeed = 1.2;
    let barVelocity = 0;
    let animId: number;

    const interval = setInterval(() => {
      // Fish changes swimming target randomly
      fishTargetY = 15 + Math.random() * 70;
      fishSpeed = 0.8 + Math.random() * 1.5;
    }, 900);

    const updateLoop = () => {
      // 1. Move fish toward target
      setFishY((prev) => {
        const diff = fishTargetY - prev;
        return prev + diff * 0.05 * fishSpeed;
      });

      // 2. Reel Bar physics (gravity + player pull)
      setBarY((prev) => {
        if (isPulling.current) {
          barVelocity -= 1.2; // pull up
        } else {
          barVelocity += 0.8; // gravity drop
        }
        barVelocity *= 0.88; // friction dampening
        const nextY = Math.max(10, Math.min(85, prev + barVelocity));
        return nextY;
      });

      // 3. Check overlap between bar and fish
      setBarY((currentBarY) => {
        setFishY((currentFishY) => {
          const barHeight = 26;
          const isOverlapping = Math.abs(currentBarY - currentFishY) < barHeight / 2;

          setProgress((prevProg) => {
            let nextProg = prevProg + (isOverlapping ? 0.45 : -0.35);
            nextProg = Math.max(0, Math.min(100, nextProg));

            if (nextProg >= 100) {
              controller.finishFishing(true, chosenFish.current);
            } else if (nextProg <= 0) {
              controller.finishFishing(false, chosenFish.current);
            }

            return nextProg;
          });

          return currentFishY;
        });
        return currentBarY;
      });

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animId);
    };
  }, [controller]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="pixel-box p-5 w-80 bg-amber-100 flex flex-col items-center gap-4">
        <h3 className="font-pixel text-xs text-amber-950">Memancing di Danau</h3>

        {/* Fishing Tension Meter Track */}
        <div className="flex items-center gap-4">
          {/* Vertical Fishing Track */}
          <div className="relative w-12 h-64 bg-sky-950 rounded-lg border-4 border-amber-950 overflow-hidden shadow-inner flex justify-center">
            {/* Water bubble effects */}
            <div className="absolute inset-0 bg-sky-900/60" />

            {/* Catch Bar (Green) */}
            <div
              className="absolute w-10 bg-emerald-500/80 border-2 border-emerald-300 rounded shadow-md transition-all duration-75"
              style={{
                top: `${barY}%`,
                height: '24%',
                transform: 'translateY(-50%)',
              }}
            />

            {/* Fish Icon */}
            <div
              className="absolute text-xl leading-none transition-all duration-100"
              style={{
                top: `${fishY}%`,
                transform: 'translateY(-50%)',
              }}
            >
              🐟
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex flex-col items-center gap-1">
            <span className="font-pixel text-[9px] text-amber-900">TANGKAP</span>
            <div className="w-5 h-64 bg-amber-950/70 p-0.5 rounded border-2 border-amber-950 shadow-inner flex flex-col justify-end">
              <div
                className="w-full bg-emerald-400 rounded-xs transition-all duration-100 shadow-md"
                style={{ height: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Control Button */}
        <div className="flex flex-col items-center gap-2 w-full">
          <button
            onMouseDown={() => {
              isPulling.current = true;
              soundManager.playUiClick();
            }}
            onMouseUp={() => {
              isPulling.current = false;
            }}
            onTouchStart={() => {
              isPulling.current = true;
            }}
            onTouchEnd={() => {
              isPulling.current = false;
            }}
            className="pixel-button w-full py-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-amber-950 font-bold text-sm rounded shadow-lg"
          >
            🎣 TAHAN / TEKAN UNTUK MENARIK
          </button>
          <span className="text-[10px] text-amber-800 font-medium">
            Jaga agar kotak hijau tetap berada di posisi ikan!
          </span>
        </div>
      </div>
    </div>
  );
};
