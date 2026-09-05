import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowLeft, Info } from 'lucide-react';
import type { WatchPartyRoom } from '@/types/watchparty';

interface RoomEndedScreenProps {
  room: WatchPartyRoom;
  participantCount: number;
}

export default function RoomEndedScreen({ room, participantCount }: RoomEndedScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-xf-bg relative flex items-center justify-center p-4">
      {/* Background backdrop */}
      {room.moviePoster && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 grayscale"
            style={{ backgroundImage: `url(${room.moviePoster})` }}
          />
          <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl" />
        </>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 text-center max-w-md w-full"
      >
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white mb-2">
          The Party Has Ended
        </h1>
        <p className="text-xf-muted text-sm mb-8">
          The host ended the watch party. Thanks for watching!
        </p>

        <div className="bg-xf-card/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
          {room.moviePoster && (
            <img
              src={room.moviePoster}
              alt={room.movieTitle ?? 'Movie'}
              className="w-20 rounded-lg shadow-lg mx-auto mb-4"
            />
          )}
          <h2 className="text-white font-bold text-lg mb-1">{room.movieTitle}</h2>
          <p className="text-xf-subtle text-xs">
            Watched with {participantCount - 1} friend{participantCount - 1 !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={16} />
            Watch Something Else
          </button>
          
          <button
            onClick={() => navigate(`/${room.movieType}/${room.movieId}`)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-transparent text-xf-muted hover:text-white font-semibold rounded-xl transition-colors"
          >
            <Info size={16} />
            Back to Details
          </button>
        </div>
      </motion.div>
    </div>
  );
}
