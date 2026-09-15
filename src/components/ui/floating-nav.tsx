import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Film, Tv, Bookmark, Users } from "lucide-react";

const NAV_ITEMS = [
  { id: 0, icon: Home, label: "Home", path: "/" },
  { id: 1, icon: Film, label: "Movies", path: "/movies" },
  { id: 2, icon: Tv, label: "TV Shows", path: "/tv-shows" },
  { id: 3, icon: Bookmark, label: "My List", path: "/my-list" },
  { id: 4, icon: Users, label: "Movie Party", path: "/movie-party" },
];

export default function FloatingNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveIndex = () => {
    const p = location.pathname;
    if (p === "/") return 0;
    if (p.startsWith("/movies")) return 1;
    if (p.startsWith("/tv-shows")) return 2;
    if (p.startsWith("/my-list")) return 3;
    if (p.startsWith("/movie-party") || p.startsWith("/watch-party")) return 4;
    return -1;
  };

  const activeIndex = getActiveIndex();

  return (
    <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[96%] max-w-md sm:max-w-lg pointer-events-none">
      <nav
        aria-label="Mobile Bottom Navigation"
        className="relative flex items-center justify-between bg-black/40 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-full p-1.5 border border-white/15 pointer-events-auto select-none overflow-hidden"
      >
        {/* Subtle glass reflection highlight on top edge */}
        <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {NAV_ITEMS.map((item, index) => {
          const isActive = activeIndex === index;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex-1 flex flex-col items-center justify-center py-1.5 sm:py-2 px-1 rounded-full text-xs font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                isActive ? "text-white" : "text-white/60 hover:text-white/90 active:text-white"
              }`}
            >
              {/* Smooth sliding translucent active capsule */}
              {isActive && (
                <motion.div
                  layoutId="floatingNavActiveCapsule"
                  className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-md border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_4px_16px_rgba(0,0,0,0.35)]"
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 32,
                    mass: 0.8,
                  }}
                />
              )}

              {/* Content */}
              <span className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                <Icon
                  size={19}
                  className={`transition-all duration-200 ${
                    isActive
                      ? "text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]"
                      : "text-white/60"
                  }`}
                />
                <span
                  className={`text-[8.5px] sm:text-[9.5px] mt-0.5 tracking-tight uppercase whitespace-nowrap transition-all duration-200 ${
                    isActive ? "font-bold text-white tracking-normal" : "font-medium text-white/60"
                  }`}
                >
                  {item.label}
                </span>
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
