import { motion } from "framer-motion";
import { Beef, Droplet, Eye, Flame, Info, ScanText, Wheat } from "lucide-react";

import GlassCard from "../ui/GlassCard.jsx";
import AnimatedNumber from "../ui/AnimatedNumber.jsx";
import MacroRing from "./MacroRing.jsx";
import BreakdownCard from "./BreakdownCard.jsx";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 26 } },
};

export default function ResultsDashboard({ result }) {
  const r = result;

  // Share of macro calories (protein 4, fat 9, carbs 4 kcal/g)
  const pK = r.protein_g * 4;
  const fK = r.total_fat_g * 9;
  const cK = r.total_carbs_g * 4;
  const total = pK + fK + cK || 1;

  const isLabel = r.source_type === "label";
  const SourceIcon = isLabel ? ScanText : Eye;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Summary */}
      <GlassCard variants={item} className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              <SourceIcon size={14} />
              {isLabel ? "Nutrition label (OCR)" : "Plated meal recognition"}
            </span>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
              {r.display_name}
            </h2>

            {r.foods.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {r.foods.map((f) => (
                  <li
                    key={f.name}
                    className="rounded-full bg-black/5 px-3 py-1 text-xs dark:bg-white/10"
                  >
                    {f.name}
                    {f.estimated_weight_g > 0 && (
                      <span className="text-muted"> · {Math.round(f.estimated_weight_g)} g</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="shrink-0 sm:text-right">
            <div className="flex items-center gap-2 text-muted sm:justify-end">
              <Flame size={16} className="text-orange-500" />
              <span className="text-sm">Total calories</span>
            </div>
            <p className="text-5xl font-semibold tabular-nums">
              <AnimatedNumber value={r.calories_kcal} />
              <span className="ml-1 text-lg font-medium text-muted">kcal</span>
            </p>
          </div>
        </div>

        {/* Confidence */}
        <div className="mt-6">
          <div className="mb-1.5 flex justify-between text-xs text-muted">
            <span>Confidence</span>
            <span className="tabular-nums">{Math.round(r.confidence * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(r.confidence * 100)}%` }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </GlassCard>

      {/* Core macros */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MacroRing
          variants={item}
          label="Protein"
          grams={r.protein_g}
          share={pK / total}
          color="#ff375f"
          icon={Beef}
        />
        <MacroRing
          variants={item}
          label="Total Fats"
          grams={r.total_fat_g}
          share={fK / total}
          color="#ff9f0a"
          icon={Droplet}
        />
        <MacroRing
          variants={item}
          label="Total Carbs"
          grams={r.total_carbs_g}
          share={cK / total}
          color="#30b0ff"
          icon={Wheat}
        />
      </div>

      <BreakdownCard result={r} variants={item} />

      {(r.notes || r.mode === "mock") && (
        <motion.div
          variants={item}
          className="flex items-start gap-2 px-2 text-xs text-muted"
        >
          <Info size={14} className="mt-0.5 shrink-0" />
          <p>
            {r.notes || "Demo data."} Values are AI estimates and may differ from actual nutrition.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}