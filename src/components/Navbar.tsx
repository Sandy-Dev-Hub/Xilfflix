import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Menu, X, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import ProfileMenu from './ProfileMenu';
import NotificationPanel from './NotificationPanel';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Movies', to: '/movies' },
  { label: 'TV Shows', to: '/tv-shows' },
  { label: 'New & Popular', to: '/new-popular' },
  { label: 'My List', to: '/my-list' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { setSearchOpen, profile, unreadCount } = useAppStore();
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Transparent → opaque on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchClick = () => {
    setSearchOpen(true);
    setMobileOpen(false);
    setNotifOpen(false);
  };

  const unread = unreadCount();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || mobileOpen
          ? 'bg-xf-bg/95 backdrop-blur-md shadow-lg shadow-black/30'
          : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 focus-visible:outline-xf-red"
            aria-label="Xilfflix Home"
          >
            <span className="font-display font-black text-2xl lg:text-3xl tracking-tighter">
              <span className="text-xf-red">X</span>
              <span className="text-white">ILFFLIX</span>
            </span>
          </Link>
          
          <div id="navbar-addon" className="hidden md:flex items-center" />

          {/* Desktop nav links removed (using floating nav instead) */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-8" aria-label="Primary navigation">
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Search */}
            <button
              onClick={handleSearchClick}
              className="p-2 text-xf-muted hover:text-white transition-colors duration-200 rounded-full hover:bg-white/10"
              aria-label="Open search"
              id="navbar-search-btn"
            >
              <Search size={20} />
            </button>

            {/* Notifications */}
            <div className="hidden sm:block relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative p-2 text-xf-muted hover:text-white transition-colors duration-200 rounded-full hover:bg-white/10"
                aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
                aria-expanded={notifOpen}
              >
                <Bell size={20} />
                {/* Unread badge */}
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-xf-red rounded-full flex items-center justify-center text-white text-[9px] font-bold leading-none">
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

            {/* Profile */}
            <div className="relative hidden lg:block" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 group"
                aria-label="Profile menu"
                aria-expanded={profileOpen}
                id="profile-menu-btn"
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm transition-all duration-200 group-hover:ring-2 group-hover:ring-white/50"
                  style={{ backgroundColor: profile.avatarColor }}
                >
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <motion.div
                  animate={{ rotate: profileOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={14} className="text-xf-muted" />
                </motion.div>
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <ProfileMenu
                    onClose={() => setProfileOpen(false)}
                    onNavigate={(path) => { navigate(path); setProfileOpen(false); }}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-xf-muted hover:text-white transition-colors duration-200 rounded-full hover:bg-white/10"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden border-t border-white/10"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'text-white bg-white/10'
                        : 'text-xf-muted hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <div className="border-t border-white/10 mt-2 pt-3 flex items-center gap-3">
                <button
                  onClick={() => { navigate('/profile'); setMobileOpen(false); }}
                  className="flex items-center gap-2 text-sm text-xf-muted hover:text-white transition-colors"
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: profile.avatarColor }}
                  >
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  {profile.name}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
