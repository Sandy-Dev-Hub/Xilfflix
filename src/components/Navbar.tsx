import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import NotificationPanel from './NotificationPanel';

export default function Navbar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const { setSearchOpen, unreadCount } = useAppStore();
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchClick = () => {
    setSearchOpen(true);
    setNotifOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const unread = unreadCount();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-transparent transition-all duration-300 pointer-events-none"
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
        <div className="flex items-center justify-between h-16 sm:h-20 pt-2">
          {/* Logo */}
          <div className="flex items-center min-w-0">
            <Link
              to="/"
              onClick={handleLogoClick}
              className="flex-shrink-0 focus-visible:outline-xf-red flex items-center transition-transform duration-200 hover:scale-105 active:scale-95 py-1"
              aria-label="Xilfflix Home"
            >
              <img
                src="/logo.png"
                alt="Xilfflix"
                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto max-w-[240px] sm:max-w-[280px] object-contain drop-shadow-xl filter"
              />
            </Link>
            
            <div id="navbar-addon" className="flex items-center min-w-0" />
          </div>

          {/* Right section: Search & Notifications only */}
          <div className="flex items-center gap-2.5 ml-auto">
            {/* Search */}
            <button
              onClick={handleSearchClick}
              className="p-2.5 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10 transition-all duration-200 rounded-full shadow-md hover:scale-105 active:scale-95"
              aria-label="Open search"
              id="navbar-search-btn"
            >
              <Search size={20} />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2.5 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10 transition-all duration-200 rounded-full shadow-md hover:scale-105 active:scale-95"
                aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
                aria-expanded={notifOpen}
              >
                <Bell size={20} />
                {/* Unread badge */}
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-xf-red rounded-full flex items-center justify-center text-white text-[9px] font-bold leading-none shadow-sm">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <NotificationPanel onClose={() => setNotifOpen(false)} />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
