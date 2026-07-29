import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { Room } from 'colyseus.js';
import { Preloader } from './scenes/Preloader';
import { MainGame } from './scenes/MainGame';

interface PhaserGameProps {
  room: Room;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ room }) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 800 },
          debug: false
        }
      },
      scene: [Preloader, MainGame],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.on('ready', () => {
       game.scene.stop('Preloader');
       game.scene.start('Preloader', { room });
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [room]);

  return <div id="phaser-container" style={{ width: '100%', height: '100%' }} />;
};
