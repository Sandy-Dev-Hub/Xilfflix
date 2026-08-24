import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Film } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-xf-bg flex flex-col items-center justify-center px-4 text-center">
      {/* Cinematic number */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative mb-6"
      >
        <span className="font-display font-black text-[160px] sm:text-[220px] leading-none text-white/5 select-none">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <Film size={64} className="text-xf-red opacity-80" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-center gap-4"
      >
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white">
          Scene Not Found
        </h1>
        <p className="text-xf-muted max-w-sm text-base">
          Looks like this reel went missing. The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-4 flex items-center gap-2 px-6 py-3 bg-xf-red text-white font-semibold rounded-lg hover:bg-xf-red-hover transition-colors shadow-lg shadow-xf-red/20"
        >
          <Home size={18} />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
