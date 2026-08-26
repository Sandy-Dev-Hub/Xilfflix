import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  List,
  PlayCircle,
  Settings,
} from 'lucide-react';

interface ProfileMenuProps {
  onClose: () => void;
  onNavigate: (path: string) => void;
}

const MENU_ITEMS = [
  { icon: User, label: 'My Profile', path: '/profile' },
  { icon: List, label: 'My List', path: '/my-list' },
  { icon: PlayCircle, label: 'Continue Watching', path: '/' },
  { icon: Settings, label: 'Settings', path: '/profile' },
];

export default function ProfileMenu({ onClose, onNavigate }: ProfileMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10"
      style={{ background: 'rgba(24,24,24,0.97)', backdropFilter: 'blur(16px)' }}
      role="menu"
      aria-label="Profile options"
    >
      {MENU_ITEMS.map(({ icon: Icon, label, path }) => (
        <button
          key={label}
          onClick={() => onNavigate(path)}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-xf-muted hover:text-white hover:bg-white/8 transition-colors duration-150 group"
          role="menuitem"
        >
          <Icon size={16} className="text-xf-subtle group-hover:text-xf-red transition-colors" />
          {label}
        </button>
      ))}
    </motion.div>
  );
}
