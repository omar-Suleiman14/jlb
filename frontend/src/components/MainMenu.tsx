import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, LogIn, ChevronLeft, Apple } from 'lucide-react';
import { Client, Room } from 'colyseus.js';

const client = new Client(import.meta.env.VITE_BACKEND_URL || "ws://localhost:2567");

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function generateCode(): string {
    let result = "";
    for (let i = 0; i < 4; i++) {
        result += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
    }
    return result;
}

export const MainMenu: React.FC<{ onJoinRoom: (room: Room) => void }> = ({ onJoinRoom }) => {
  const [view, setView] = useState<'main' | 'host' | 'join'>('main');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hostedRoom, setHostedRoom] = useState<Room | null>(null);
  const [hostedCode, setHostedCode] = useState('');

  // Auto-reconnect logic
  useEffect(() => {
    const lastSession = localStorage.getItem('jlb-reconnection-token');
    
    if (lastSession) {
      setLoading(true);
      client.reconnect(lastSession)
        .then(room => {
          onJoinRoom(room);
        })
        .catch(() => {
          localStorage.removeItem('jlb-last-room');
          localStorage.removeItem('jlb-reconnection-token');
          setLoading(false);
        });
    }
  }, [onJoinRoom]);

  const handleHost = async () => {
    setLoading(true);
    setError('');
    try {
      const code = generateCode();
      const room = await client.create('game_room', { roomCode: code });
      setHostedRoom(room);
      setHostedCode(code);
      localStorage.setItem('jlb-reconnection-token', room.reconnectionToken);
      
      // We don't join immediately; we wait in a lobby for P2
      setView('host');
      
      room.onStateChange((state) => {
        if (state.players && state.players.size === 2) {
          onJoinRoom(room);
        }
      });
      
    } catch (e: any) {
      setError(e.message || 'Failed to create room');
      setView('main');
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!roomCode || roomCode.length !== 4) {
      setError('Please enter a 4-character code');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      // Look up the room's internal ID via our REST endpoint
      const backendHttp = (import.meta.env.VITE_BACKEND_URL || "ws://localhost:2567").replace("ws://", "http://").replace("wss://", "https://");
      const res = await fetch(`${backendHttp}/find-room/${roomCode.toUpperCase()}`);
      if (!res.ok) {
        throw new Error('Room not found or full');
      }
      const { roomId } = await res.json();
      const room = await client.joinById(roomId);
      localStorage.setItem('jlb-reconnection-token', room.reconnectionToken);
      onJoinRoom(room);
    } catch (e: any) {
      setError(e.message || 'Room not found or full');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
      <AnimatePresence mode="wait">
        
        {view === 'main' && (
          <motion.div key="main" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-panel" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, minWidth: 320 }}>
            <Apple size={48} color="var(--accent-color)" />
            <h1 style={{ fontSize: 32, fontWeight: 700 }}>Jim Loves Bam</h1>
            {error && <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
              <button className="apple-btn primary" onClick={handleHost} disabled={loading}>
                <UserPlus size={20} /> Host Game
              </button>
              <button className="apple-btn glass" onClick={() => { setView('join'); setError(''); }} disabled={loading}>
                <LogIn size={20} /> Join Game
              </button>
            </div>
          </motion.div>
        )}

        {view === 'host' && (
          <motion.div key="host" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="glass-panel" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, minWidth: 320 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600 }}>Lobby</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Share this code with your partner:</p>
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '16px 32px', borderRadius: 16, fontSize: 48, fontWeight: 800, letterSpacing: 8, color: 'var(--accent-color)' }}>
              {hostedCode}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <Users size={24} color="var(--text-secondary)" />
              <p>Waiting for Player 2...</p>
            </div>
            <button className="apple-btn glass" onClick={() => { hostedRoom?.leave(); setView('main'); }} style={{ marginTop: 24, width: '100%' }}>
              Cancel
            </button>
          </motion.div>
        )}

        {view === 'join' && (
          <motion.div key="join" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="glass-panel" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, minWidth: 320 }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
              <button className="apple-btn glass" style={{ padding: '8px 12px' }} onClick={() => setView('main')}>
                <ChevronLeft size={20} />
              </button>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 600 }}>Join Game</h2>
            <input 
              type="text" 
              maxLength={4}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Code"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 16,
                padding: '16px',
                fontSize: 20,
                textAlign: 'center',
                color: 'white',
                outline: 'none',
                letterSpacing: 4
              }}
            />
            {error && <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}
            
            <button className="apple-btn primary" onClick={handleJoin} disabled={loading || roomCode.length !== 4} style={{ width: '100%' }}>
              Join
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
