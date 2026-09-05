"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Film, Tv, Bookmark, Users } from "lucide-react";

const items = [
  { id: 0, icon: <Home size={18} />, label: "Home", path: "/" },
  { id: 1, icon: <Film size={18} />, label: "Movies", path: "/movies" },
  { id: 2, icon: <Tv size={18} />, label: "TV Shows", path: "/tv-shows" },
  { id: 3, icon: <Bookmark size={18} />, label: "My List", path: "/my-list" },
  { id: 4, icon: <Users size={18} />, label: "Movie Party", path: "/movie-party" },
];

const FloatingNav = () => {
  const [active, setActive] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Sync active state with the current URL
  useEffect(() => {
    const currentIndex = items.findIndex((item) => item.path === location.pathname);
    if (currentIndex !== -1) {
      setActive(currentIndex);
    }
  }, [location.pathname]);

  // Update indicator position when active changes or resize
  useEffect(() => {
    const updateIndicator = () => {
      if (btnRefs.current[active] && containerRef.current) {
        const btn = btnRefs.current[active];
        const container = containerRef.current;
        if (!btn) return;
        const btnRect = btn.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setIndicatorStyle({
          width: btnRect.width,
          left: btnRect.left - containerRect.left,
        });
      }
    };

    updateIndicator();
    const timer = setTimeout(updateIndicator, 100);
    window.addEventListener("resize", updateIndicator);
    return () => {
      window.removeEventListener("resize", updateIndicator);
      clearTimeout(timer);
    };
  }, [active]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4 pointer-events-none">
      <div
        ref={containerRef}
        className="relative flex items-center justify-between bg-[#181818]/90 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-full px-1 py-0.5 border border-white/10 pointer-events-auto"
      >
        {items.map((item, index) => {
          const isActive = active === index;
          return (
            <button
              key={item.id}
              ref={(el) => (btnRefs.current[index] = el)}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center flex-1 px-1 py-2 text-sm font-medium transition-colors duration-300 ${
                isActive ? "text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              <div className="z-10">{item.icon}</div>
              <span className="text-[9px] mt-1 font-bold uppercase tracking-wider hidden sm:block z-10">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Sliding Active Indicator */}
        <motion.div
          animate={indicatorStyle}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute top-1 bottom-1 rounded-full bg-white/10 border border-white/5"
        />
      </div>
    </div>
  );
};

export default FloatingNav;
