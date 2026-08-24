import { motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
import type { Server } from '@/types/movie';

interface ServerSelectorProps {
  servers: Server[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function ServerSelector({
  servers,
  selectedIndex,
  onSelect,
}: ServerSelectorProps) {
  return (
    <div>
      <h3 className="text-xf-muted text-sm font-semibold uppercase tracking-wider mb-3">
        Select Server
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {servers.map((server, i) => {
          const online = server.status === 'online';
          const selected = i === selectedIndex;

          return (
            <motion.button
              key={server.name}
              onClick={() => online && onSelect(i)}
              whileHover={online ? { scale: 1.03 } : {}}
              whileTap={online ? { scale: 0.97 } : {}}
              disabled={!online}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200
                ${selected
                  ? 'border-xf-red bg-xf-red/10 shadow-lg shadow-xf-red/20'
                  : online
                    ? 'border-white/10 bg-xf-card hover:border-white/30 hover:bg-xf-secondary'
                    : 'border-white/5 bg-xf-card/50 opacity-40 cursor-not-allowed'
                }`}
              aria-label={`${server.name} — ${online ? 'Online' : 'Offline'}`}
              aria-pressed={selected}
              id={`server-btn-${i}`}
            >
              {/* Animated selection ring */}
              {selected && (
                <motion.div
                  layoutId="server-ring"
                  className="absolute inset-0 rounded-xl border-2 border-xf-red"
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                />
              )}

              {online ? (
                <Wifi size={18} className={selected ? 'text-xf-red' : 'text-xf-muted'} />
              ) : (
                <WifiOff size={18} className="text-xf-subtle" />
              )}

              <span className={`text-xs font-semibold ${selected ? 'text-xf-red' : online ? 'text-white' : 'text-xf-subtle'}`}>
                {server.name}
              </span>

              {/* Status dot */}
              <div className="flex items-center gap-1">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-400' : 'bg-red-500'}`}
                />
                <span className="text-[10px] text-xf-subtle">
                  {online ? 'Online' : 'Offline'}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
