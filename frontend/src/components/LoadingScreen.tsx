import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Apple } from 'lucide-react';

export const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate asset loading
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500); // Small delay before switching
          return 100;
        }
        // Random progress increments for realism
        return prev + Math.random() * 15;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      className="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        backgroundColor: '#000',
        color: '#fff'
      }}
    >
      <Apple size={64} color="#fff" style={{ marginBottom: 40 }} />
      <div className="apple-progress-bar">
        <div className="apple-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
    </motion.div>
  );
};
