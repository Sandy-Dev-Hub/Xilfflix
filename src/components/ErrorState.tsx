import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Server } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: 'general' | 'player';
  onTryServer?: () => void;
}

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error loading this content. Please try again.',
  onRetry,
  variant = 'general',
  onTryServer,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center text-center py-20 px-4 gap-5"
    >
      <div className="w-16 h-16 rounded-full bg-xf-card border border-white/10 flex items-center justify-center">
        <AlertTriangle size={28} className="text-xf-red" />
      </div>

      <div>
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <p className="text-xf-muted text-sm mt-2 max-w-sm">{message}</p>
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-semibold rounded-lg text-sm hover:bg-white/90 transition-colors"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        )}
        {variant === 'player' && onTryServer && (
          <button
            onClick={onTryServer}
            className="flex items-center gap-2 px-5 py-2.5 bg-xf-card border border-white/10 text-white rounded-lg text-sm hover:bg-xf-secondary transition-colors"
          >
            <Server size={16} className="text-xf-muted" />
            Try Another Server
          </button>
        )}
      </div>
    </motion.div>
  );
}
