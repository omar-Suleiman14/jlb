import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { Room } from 'colyseus.js';
import { Preloader } from './scenes/Preloader';
import { GameMenu } from './scenes/GameMenu';
import { Level1 } from './scenes/Level1';
import { HUD } from './scenes/HUD';
import { PauseMenu } from './scenes/PauseMenu';
import { LevelComplete } from './scenes/LevelComplete';
import { GameOver } from './scenes/GameOver';

interface PhaserGameProps {
  room: Room;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ room }) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1152,
      height: 576,
      parent: 'phaser-container',
      backgroundColor: '#0a0a1a',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 800 },
          debug: false
        }
      },
      // All scenes registered — Preloader runs first, then routes to GameMenu
      scene: [Preloader, GameMenu, Level1, HUD, PauseMenu, LevelComplete, GameOver],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Store room in the game registry so every scene can access it immediately,
    // regardless of when they start. The old setTimeout approach was racy —
    // Preloader auto-starts as the first scene and finishes before 100ms
    // when assets are already cached, causing room to be undefined.
    game.registry.set('colyseus_room', room);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [room]);

  return <div id="phaser-container" style={{ width: '100%', height: '100%' }} />;
};
