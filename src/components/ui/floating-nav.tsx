import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Film, Tv, Bookmark, Users } from "lucide-react";

interface NavItem {
  id: number;
  icon: typeof Home;
  label: string;
  path: string;
}

export default function FloatingNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const NAV_ITEMS: NavItem[] = [
    { id: 0, icon: Home, label: "HOME", path: "/" },
    { id: 1, icon: Film, label: "MOVIES", path: "/movies" },
    { id: 2, icon: Tv, label: "TV SHOWS", path: "/tv-shows" },
    { id: 3, icon: Bookmark, label: "MY LIST", path: "/my-list" },
    { id: 4, icon: Users, label: "MOVIE PARTY", path: "/movie-party" },
  ];

  const getActiveIndex = () => {
    const p = location.pathname;
    if (p === "/") return 0;
    if (p.startsWith("/movies") || p.startsWith("/movie/")) return 1;
    if (p.startsWith("/tv-shows") || p.startsWith("/tv/")) return 2;
    if (p.startsWith("/my-list")) return 3;
    if (p.startsWith("/movie-party") || p.startsWith("/watch-party")) return 4;
    return -1;
  };

  const activeIndex = getActiveIndex();

  return (
    <div className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-md pointer-events-none">
      <nav
        aria-label="Mobile Bottom Navigation"
        className="relative flex items-center justify-between bg-[#0e1217]/90 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-full px-1.5 py-1.5 border border-white/12 pointer-events-auto select-none"
      >
        {/* Subtle glass reflection highlight on top edge */}
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

        {NAV_ITEMS.map((item, index) => {
          const isActive = activeIndex === index;
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 sm:px-3 rounded-full transition-all duration-200 outline-none cursor-pointer active:scale-95 flex-1 min-w-0 ${
                isActive ? "text-white" : "text-zinc-400 hover:text-white/80"
              }`}
            >
              {/* Smooth sliding translucent active capsule */}
              {isActive && (
                <motion.div
                  layoutId="floatingNavActiveCapsule"
                  className="absolute inset-0 rounded-full bg-white/15 backdrop-blur-md border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_4px_12px_rgba(0,0,0,0.4)]"
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 32,
                    mass: 0.8,
                  }}
                />
              )}

              {/* Icon */}
              <Icon
                size={18}
                className={`relative z-10 transition-transform duration-200 ${
                  isActive
                    ? "text-white scale-105 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                    : "text-zinc-400"
                }`}
              />

              {/* Label */}
              <span
                className={`relative z-10 text-[9px] sm:text-[10px] tracking-wider font-extrabold uppercase mt-1 leading-none truncate ${
                  isActive ? "text-white font-black" : "text-zinc-400"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
