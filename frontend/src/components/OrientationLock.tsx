import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Play } from 'lucide-react';

export const OrientationLock: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {

  const handlePlay = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      // Attempt to lock orientation (only works on mobile devices)
      if ('orientation' in screen && 'lock' in screen.orientation) {
        await (screen.orientation as any).lock('landscape').catch(() => {
          console.warn("Orientation lock not supported on this device/browser");
        });
      }
      onUnlock();
    } catch (e) {
      console.error(e);
      // Still allow them to play even if fullscreen fails
      onUnlock();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        padding: 24,
        textAlign: 'center'
      }}
    >
      <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '400px' }}>
        <motion.div
          animate={{ rotate: 90 }}
          transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
        >
          <Smartphone size={64} style={{ marginBottom: '24px', opacity: 0.8 }} />
        </motion.div>
        
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>Ready to Play?</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px', lineHeight: '1.5' }}>
          For the best experience, this game is played in landscape mode and full screen.
        </p>

        <button className="apple-btn primary" onClick={handlePlay}>
          <Play size={18} fill="currentColor" /> Let's Go
        </button>
      </div>
    </motion.div>
  );
};
