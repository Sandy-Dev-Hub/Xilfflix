import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Loader2 } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';

interface JoinRoomModalProps {
  onClose: () => void;
  // Pre-fills the room code field (e.g. when following a shared link)
  initialCode?: string;
  // If provided, the modal acts as "Create Room" for this movie
  createParams?: {
    movieId: string;
    movieType: 'movie' | 'tv';
    movieTitle: string;
    moviePoster: string;
  };
}

export default function JoinRoomModal({ onClose, createParams, initialCode }: JoinRoomModalProps) {
  const [code, setCode] = useState(initialCode ?? '');
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { createRoom, joinRoom } = useRoomStore();
  const modalRef = useRef<HTMLDivElement>(null);

  const isCreateMode = !!createParams;

  // Auto-create if createParams provided
  useEffect(() => {
    if (isCreateMode) {
      const doCreate = async () => {
        setCreating(true);
        const res = await createRoom(
          createParams.movieId,
          createParams.movieType,
          createParams.movieTitle,
          createParams.moviePoster,
          '' // Host name will be handled inside createRoom or defaulted
        );
        if ('roomId' in res) {
          navigate(`/watch-party/${res.roomId}`);
        } else {
          setError(res.error || 'Failed to create room.');
          setCreating(false);
        }
      };
      doCreate();
    }
  }, [isCreateMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 8) {
      setError('Room code must be 8 characters.');
      return;
    }
    
    setJoining(true);
    setError('');
    const res = await joinRoom(cleanCode, name);
    if ('ok' in res) {
      navigate(`/watch-party/${cleanCode}`);
    } else {
      setError(res.error || 'Failed to join room.');
      setJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10"
        style={{ background: 'rgba(20,20,20,0.98)', backdropFilter: 'blur(24px)' }}
        role="dialog"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-xf-muted hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-8 pb-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 bg-xf-red/10 rounded-full flex items-center justify-center mb-4">
              <Users size={24} className="text-xf-red" />
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-2">
              {isCreateMode ? 'Starting Watch Party' : 'Join a Watch Party'}
            </h2>
            {isCreateMode && (
              <p className="text-xf-subtle text-sm">
                Creating room for {createParams.movieTitle}...
              </p>
            )}
          </div>

          {isCreateMode ? (
            <div className="flex flex-col items-center justify-center py-6">
              {creating ? (
                <>
                  <Loader2 size={32} className="animate-spin text-xf-red mb-4" />
                  <p className="text-sm font-medium text-white">Preparing your room...</p>
                </>
              ) : error ? (
                <div className="flex flex-col items-center gap-4 w-full">
                  <p className="text-xf-red text-sm font-medium text-center">{error}</p>
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-xf-subtle uppercase tracking-wider mb-1.5">
                  Room Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. A7KR3Q9B"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  maxLength={8}
                  required
                  className="w-full bg-xf-card border border-white/10 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-white placeholder-xf-subtle/50 focus:outline-none focus:border-xf-red/60 uppercase transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-xf-subtle uppercase tracking-wider mb-1.5 mt-2">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Guest"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  className="w-full bg-xf-card border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-xf-subtle focus:outline-none focus:border-xf-red/60 transition-colors"
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xf-red text-xs px-1 text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={joining || code.length !== 8}
                className="w-full flex items-center justify-center gap-2 py-3 mt-2 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {joining ? <Loader2 size={18} className="animate-spin" /> : 'Join Room'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
