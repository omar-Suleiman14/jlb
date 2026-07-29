import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Maximize } from 'lucide-react';
import { LoadingScreen } from './components/LoadingScreen';
import { OrientationLock } from './components/OrientationLock';
import { MainMenu } from './components/MainMenu';
import { PhaserGame } from './game/PhaserGame';
import { Room } from 'colyseus.js';
import './index.css';

type AppState = 'loading' | 'orientation' | 'menu' | 'game';

function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [room, setRoom] = useState<Room | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(true);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleReturnFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      if ('orientation' in screen && 'lock' in screen.orientation) {
        await (screen.orientation as any).lock('landscape').catch(() => {});
      }
    } catch (e) {
      console.error(e);
    }
  };

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
        {appState === 'game' && room && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', height: '100%' }}>
            <PhaserGame room={room} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isFullscreen && (appState === 'menu' || appState === 'game') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '400px', textAlign: 'center' }}>
              <Maximize size={48} style={{ marginBottom: 16, opacity: 0.8 }} color="white" />
              <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: 'white' }}>Fullscreen Required</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Please return to fullscreen to continue playing.</p>
              <button className="apple-btn primary" onClick={handleReturnFullscreen}>
                Return to Game
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
