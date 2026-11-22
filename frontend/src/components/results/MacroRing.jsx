import { motion } from "framer-motion";

import GlassCard from "../ui/GlassCard.jsx";
import AnimatedNumber from "../ui/AnimatedNumber.jsx";

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Interactive nutrition ring.
 * `share` (0..1) = this macro's share of total macro calories.
 */
export default function MacroRing({ label, grams, share, color, icon: Icon, variants }) {
  const pct = Math.min(1, Math.max(0, share));

  return (
    <GlassCard hover variants={variants} className="flex flex-col items-center gap-3 p-6">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            strokeWidth="9"
            className="stroke-black/10 dark:stroke-white/10"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            strokeWidth="9"
            strokeLinecap="round"
            stroke={color}
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - pct) }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon size={18} style={{ color }} />
          <span className="mt-0.5 text-3xl font-semibold tabular-nums leading-none">
            <AnimatedNumber value={grams} decimals={1} />
          </span>
          <span className="text-xs text-muted">grams</span>
        </div>
      </div>

      <div className="text-center">
        <p className="font-semibold">{label}</p>
        <p className="text-xs text-muted">{Math.round(pct * 100)}% of macro calories</p>
      </div>
    </GlassCard>
  );
}