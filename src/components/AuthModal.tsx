import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface AuthModalProps {
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
}

export default function AuthModal({ onClose, defaultTab = 'login' }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const { signIn, signUp, loading, error, clearError, user } = useAuthStore();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on successful auth
  useEffect(() => {
    if (user) onClose();
  }, [user, onClose]);

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

  const switchTab = (t: 'login' | 'signup') => {
    setTab(t);
    clearError();
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    clearError();

    if (tab === 'login') {
      await signIn(email, password);
    } else {
      await signUp(email, password, displayName);
      if (!useAuthStore.getState().error) {
        setSuccessMsg('Account created! Check your email to confirm, then sign in.');
        switchTab('login');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10"
        style={{ background: 'rgba(20,20,20,0.98)', backdropFilter: 'blur(24px)' }}
        role="dialog"
        aria-modal="true"
        aria-label={tab === 'login' ? 'Sign in' : 'Create account'}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-xf-muted hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <span className="font-display font-black text-2xl">
            <span className="text-xf-red">X</span>
            <span className="text-white">ILFFLIX</span>
          </span>
          <p className="text-xf-muted text-sm mt-2">
            {tab === 'login'
              ? 'Sign in to your account'
              : 'Create a free account'}
          </p>
          <p className="text-xf-subtle text-xs mt-1">
            Login is optional — you can browse and watch without an account.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mx-8">
          {(['login', 'signup'] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors relative ${
                tab === t ? 'text-white' : 'text-xf-muted hover:text-white'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Sign Up'}
              {tab === t && (
                <motion.div
                  layoutId="auth-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-xf-red"
                />
              )}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          {tab === 'signup' && (
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-xf-subtle" />
              <input
                type="text"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full bg-xf-card border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-xf-subtle focus:outline-none focus:border-xf-red/60 transition-colors"
                id="auth-displayname"
              />
            </div>
          )}

          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-xf-subtle" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-xf-card border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-xf-subtle focus:outline-none focus:border-xf-red/60 transition-colors"
              id="auth-email"
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-xf-subtle" />
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-xf-card border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-xf-subtle focus:outline-none focus:border-xf-red/60 transition-colors"
              id="auth-password"
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xf-subtle hover:text-xf-muted transition-colors"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xf-red text-xs px-1"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Success */}
          <AnimatePresence>
            {successMsg && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-green-400 text-xs px-1"
              >
                {successMsg}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-xf-red hover:bg-xf-red-hover text-white font-bold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            id={`auth-submit-${tab}`}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : tab === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-xf-subtle pb-6 px-8">
          By continuing, you agree to our{' '}
          <a href="/legal" className="underline hover:text-xf-muted transition-colors">
            Terms of Service
          </a>
          .
        </p>
      </motion.div>
    </div>
  );
}
