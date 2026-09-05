import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Film, Users, Loader2, Crown } from 'lucide-react';
import type { Movie } from '@/types/movie';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w185';

const LIMIT_PRESETS = [
  { label: '2', value: 2 },
  { label: '4', value: 4 },
  { label: '6', value: 6 },
  { label: '10', value: 10 },
  { label: '∞', value: 0 },
];

interface RoomConfigStepProps {
  movie: Movie;
  onBack: () => void;
  onConfirm: (roomName: string, participantLimit: number) => void;
  loading: boolean;
}

export default function RoomConfigStep({ movie, onBack, onConfirm, loading }: RoomConfigStepProps) {
  const [roomName, setRoomName] = useState('');
  const [limit, setLimit] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(roomName.trim(), limit);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          disabled={loading}
          className="p-1.5 rounded-lg text-xf-muted hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 disabled:opacity-40"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">Configure Your Room</h2>
          <p className="text-xf-subtle text-xs">Set a name and participant limit</p>
        </div>
      </div>

      {/* Selected movie preview */}
      <div className="flex items-center gap-4 p-4 bg-xf-card border border-white/10 rounded-xl mb-6">
        {movie.poster ? (
          <img
            src={`${POSTER_BASE}${movie.poster}`}
            alt={movie.title}
            className="w-12 h-[72px] object-cover rounded-lg flex-shrink-0 border border-white/10"
          />
        ) : (
          <div className="w-12 h-[72px] bg-xf-secondary rounded-lg flex-shrink-0 flex items-center justify-center">
            <Film size={20} className="text-xf-subtle" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm leading-tight truncate">{movie.title}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-white/10 text-[10px] font-bold uppercase rounded text-xf-muted">
            {movie.type === 'tv' ? 'TV Series' : 'Movie'}
          </span>
          {movie.year && (
            <p className="text-xf-subtle text-xs mt-1">{movie.year}</p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1 text-yellow-400 flex-shrink-0">
          <Crown size={12} />
          <span className="text-xs font-semibold text-xf-muted">Host</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-5">
        {/* Room name */}
        <div>
          <label className="block text-xs font-semibold text-xf-subtle uppercase tracking-wider mb-2">
            Room Name <span className="text-xf-subtle/60 font-normal normal-case">(optional)</span>
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value.slice(0, 40))}
            placeholder="e.g. Friday Movie Night"
            className="w-full bg-xf-card border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-xf-subtle focus:outline-none focus:border-xf-red/50 transition-colors"
            id="room-config-name"
          />
          {roomName.length > 30 && (
            <p className="text-right text-xf-subtle text-[10px] mt-1">{roomName.length}/40</p>
          )}
        </div>

        {/* Participant limit */}
        <div>
          <label className="block text-xs font-semibold text-xf-subtle uppercase tracking-wider mb-2">
            <Users size={11} className="inline mr-1" />
            Participant Limit
          </label>
          <div className="flex gap-2 flex-wrap">
            {LIMIT_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setLimit(p.value)}
                className={`flex-1 min-w-[40px] py-2 rounded-xl text-sm font-bold transition-all border ${
                  limit === p.value
                    ? 'bg-xf-red border-xf-red text-white shadow-lg shadow-xf-red/20'
                    : 'bg-xf-card border-white/10 text-xf-muted hover:text-white hover:border-white/30'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="text-xf-subtle text-[11px] mt-2">
            {limit === 0
              ? 'Unlimited participants can join your room.'
              : `Up to ${limit} people including yourself. Enforced server-side.`}
          </p>
        </div>

        <div className="mt-auto">
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-xf-red hover:bg-xf-red-hover text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-xf-red/20"
            id="room-config-create"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating Room…
              </>
            ) : (
              'Create Room'
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
