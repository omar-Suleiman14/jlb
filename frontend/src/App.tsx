import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LoadingScreen } from './components/LoadingScreen';
import { OrientationLock } from './components/OrientationLock';
import { MainMenu } from './components/MainMenu';
import { Room } from 'colyseus.js';
import './index.css';

type AppState = 'loading' | 'orientation' | 'menu' | 'game';

function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [room, setRoom] = useState<Room | null>(null);

  const handleJoinRoom = (joinedRoom: Room) => {
    setRoom(joinedRoom);
    setAppState('game');
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {appState === 'loading' && (
          <LoadingScreen key="loading" onComplete={() => setAppState('orientation')} />
        )}
        {appState === 'orientation' && (
          <OrientationLock key="orientation" onUnlock={() => setAppState('menu')} />
        )}
        {appState === 'menu' && (
          <MainMenu key="menu" onJoinRoom={handleJoinRoom} />
        )}
        {appState === 'game' && (
          <div key="game" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white' }}>
            <h1>Game Scene connected to room {room?.id}</h1>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
