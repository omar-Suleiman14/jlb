import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Apple } from 'lucide-react';

export const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const assetsToLoad = [
      'assets/jim.png',
      'assets/pam.png',
      'assets/jlp.ldtk'
    ];
    let loaded = 0;
    const total = assetsToLoad.length;

    const onLoadAsset = () => {
      loaded++;
      setProgress(Math.min((loaded / total) * 100, 100));
      if (loaded === total) {
        setTimeout(onComplete, 500);
      }
    };

    assetsToLoad.forEach(src => {
      if (src.endsWith('.json') || src.endsWith('.ldtk')) {
        fetch(src).then(onLoadAsset).catch(onLoadAsset);
      } else {
        const img = new Image();
        img.onload = onLoadAsset;
        img.onerror = onLoadAsset;
        img.src = src;
      }
    });
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
