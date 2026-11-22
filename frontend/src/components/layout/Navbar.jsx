import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Leaf, Moon, ScanLine, Sun, Users } from "lucide-react";

import { useTheme } from "../../context/ThemeContext.jsx";
import { cn } from "../../lib/cn";

const LINKS = [
  { to: "/", label: "Scanner", icon: ScanLine },
  { to: "/about", label: "Mission", icon: BookOpen },
  { to: "/contributors", label: "Contributors", icon: Users },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-3">
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="glass flex items-center gap-1 rounded-full p-1.5"
        aria-label="Main navigation"
      >
        <NavLink
          to="/"
          className="flex items-center gap-2 rounded-full py-1.5 pl-3 pr-3 text-sm font-semibold"
          aria-label="Macro Lens home"
        >
          <Leaf size={18} className="text-macro-fiber" />
          <span className="hidden md:inline">Macro Lens</span>
        </NavLink>

        <span className="mx-1 hidden h-5 w-px bg-black/10 dark:bg-white/15 md:block" />

        {LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className="relative rounded-full px-3 py-2 text-sm font-medium sm:px-4"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-black/[0.07] dark:bg-white/15"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex items-center gap-2 transition-colors",
                    isActive ? "text-ink" : "text-muted hover:text-ink"
                  )}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{label}</span>
                </span>
              </>
            )}
          </NavLink>
        ))}

        <span className="mx-1 h-5 w-px bg-black/10 dark:bg-white/15" />

        <motion.button
          type="button"
          onClick={toggleTheme}
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.06 }}
          transition={{ type: "spring", stiffness: 500, damping: 24 }}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-black/5 dark:hover:bg-white/10"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18 }}
              className="flex"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </motion.nav>
    </header>
  );
}