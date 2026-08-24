import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Edit3, Check } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Footer from '@/components/Footer';

const AVATAR_COLORS = [
  '#E50914', '#1DB954', '#0070F3', '#FF6B35',
  '#A855F7', '#EC4899', '#F59E0B', '#10B981',
];

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0 },
};

export default function Profile() {
  const { profile, setProfile, myList, continueWatching } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [color, setColor] = useState(profile.avatarColor);

  const handleSave = () => {
    setProfile({ name: name.trim() || 'Guest', avatarColor: color });
    setEditing(false);
  };

  const cwCount = Object.keys(continueWatching).filter(
    (k) => continueWatching[k].progress > 5
  ).length;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-xf-bg"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-8 pt-24 pb-16">
        {/* Profile card */}
        <div className="bg-xf-card rounded-2xl border border-white/10 overflow-hidden mb-6">
          <div className="h-24 bg-gradient-to-r from-xf-red/20 via-purple-900/20 to-blue-900/20" />

          <div className="px-6 pb-6">
            <div className="-mt-10 flex items-end justify-between mb-5">
              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-2xl border-4 border-xf-card flex items-center justify-center text-white font-black text-3xl shadow-lg"
                style={{ backgroundColor: color }}
              >
                {(name || 'G').charAt(0).toUpperCase()}
              </div>
              {/* Edit button */}
              <button
                onClick={() => editing ? handleSave() : setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-xf-secondary border border-white/10 rounded-lg text-sm text-white hover:border-white/30 transition-colors"
              >
                {editing ? <Check size={15} /> : <Edit3 size={15} />}
                {editing ? 'Save' : 'Edit Profile'}
              </button>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xf-muted text-xs uppercase tracking-wider mb-2 block">
                    Display Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-xf-secondary border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-xf-red outline-none transition-colors"
                    placeholder="Enter your name"
                    maxLength={24}
                  />
                </div>
                <div>
                  <label className="text-xf-muted text-xs uppercase tracking-wider mb-2 block">
                    Avatar Color
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {AVATAR_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className="w-9 h-9 rounded-full border-2 transition-all"
                        style={{
                          backgroundColor: c,
                          borderColor: c === color ? 'white' : 'transparent',
                          transform: c === color ? 'scale(1.15)' : 'scale(1)',
                        }}
                        aria-label={`Avatar color ${c}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="font-display font-bold text-2xl text-white mb-1">
                  {profile.name}
                </h1>
                <p className="text-xf-muted text-sm">Xilfflix Member</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: 'My List', value: myList.length, color: 'text-xf-red' },
            { label: 'Continue Watching', value: cwCount, color: 'text-blue-400' },
          ].map(({ label, value, color: c }) => (
            <div
              key={label}
              className="bg-xf-card rounded-2xl border border-white/10 p-5 flex flex-col gap-1"
            >
              <span className={`font-display font-black text-3xl ${c}`}>{value}</span>
              <span className="text-xf-muted text-sm">{label}</span>
            </div>
          ))}
        </div>

        {/* Preferences placeholder */}
        <div className="bg-xf-card rounded-2xl border border-white/10 p-5">
          <h3 className="text-white font-semibold mb-3">Preferences</h3>
          <div className="space-y-3">
            {[
              'Autoplay next episode',
              'Show maturity ratings',
              'Notify on new releases',
            ].map((pref) => (
              <div key={pref} className="flex items-center justify-between">
                <span className="text-xf-muted text-sm">{pref}</span>
                <div className="w-10 h-5 bg-xf-red rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </motion.div>
  );
}
