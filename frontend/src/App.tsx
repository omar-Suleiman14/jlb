import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LoadingScreen } from './components/LoadingScreen';
import { OrientationLock } from './components/OrientationLock';
import './index.css';

// Placeholder for the main menu that we'll build in Phase 2
const MainMenu = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
    <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Jim Loves Bam</h1>
    <p style={{ color: 'var(--text-secondary)' }}>Main Menu coming in Phase 2</p>
  </div>
);

type AppState = 'loading' | 'orientation' | 'menu' | 'game';

function App() {
  const [appState, setAppState] = useState<AppState>('loading');

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
          <MainMenu key="menu" />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
