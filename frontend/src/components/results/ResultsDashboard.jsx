import { motion } from "framer-motion";
import {
  Beef,
  Droplet,
  Eye,
  Flame,
  Info,
  ScanText,
  Wheat,
  Utensils,
  Globe,
  Scale,
  Sparkles,
  Layers,
  Award,
  CheckCircle2,
} from "lucide-react";

import GlassCard from "../ui/GlassCard.jsx";
import AnimatedNumber from "../ui/AnimatedNumber.jsx";
import MacroRing from "./MacroRing.jsx";
import BreakdownCard from "./BreakdownCard.jsx";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 220, damping: 24 } },
};

const bottomBanner = {
  hidden: { opacity: 0, scale: 0.94, y: 35 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 180, damping: 20, delay: 0.2 },
  },
};

const fmt = (n) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 1 });

export default function ResultsDashboard({ result }) {
  const r = result;

  // Share of macro calories (protein 4, fat 9, carbs 4 kcal/g)
  const pK = r.protein_g * 4;
  const fK = r.total_fat_g * 9;
  const cK = r.total_carbs_g * 4;
  const totalMacroCals = pK + fK + cK || 1;

  const pPct = Math.round((pK / totalMacroCals) * 100);
  const fPct = Math.round((fK / totalMacroCals) * 100);
  const cPct = Math.round((cK / totalMacroCals) * 100);

  const isLabel = r.source_type === "label";
  const SourceIcon = isLabel ? ScanText : Eye;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* 1. Header & Dish Overview */}
      <GlassCard variants={item} className="p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between relative z-10">
          <div className="min-w-0">
            {/* Meta Tags / Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent border border-accent/20">
                <SourceIcon size={14} />
                {isLabel ? "Nutrition Label (OCR)" : "AI Meal Recognition"}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Sparkles size={13} />
                {r.mode === "gemini" ? "Gemini Cloud Vision" : "Local Engine"}
              </span>

              {r.dish_type && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Utensils size={13} />
                  {r.dish_type}
                </span>
              )}

              {r.cuisine && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 dark:bg-sky-500/20 px-3 py-1 text-xs font-medium text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  <Globe size={13} />
                  {r.cuisine}
                </span>
              )}

              {r.serving_weight_g > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/5 dark:bg-white/10 px-3 py-1 text-xs font-medium text-muted">
                  <Scale size={13} />
                  {Math.round(r.serving_weight_g)} g total
                </span>
              )}
            </div>

            <h2 className="mt-4 text-3xl font-bold tracking-tight leading-tight sm:text-4xl text-ink">
              {r.display_name}
            </h2>

            <p className="mt-2 text-sm text-muted">
              {isLabel
                ? "Scanned directly from printed packaging values."
                : "Portions and ingredients estimated using Gemini Multimodal Vision."}
            </p>
          </div>

          {/* Calorie Highlight */}
          <div className="shrink-0 sm:text-right rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] p-4 sm:p-5 border border-black/5 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-1.5 text-muted sm:justify-end mb-1">
              <Flame size={18} className="text-orange-500 animate-pulse" />
              <span className="text-xs uppercase font-bold tracking-wider">Total Calories</span>
            </div>
            <p className="text-5xl font-extrabold tabular-nums tracking-tight text-ink">
              <AnimatedNumber value={r.calories_kcal} />
              <span className="ml-1.5 text-base font-semibold text-muted">kcal</span>
            </p>
            {r.energy_density_kcal_per_g > 0 && (
              <p className="mt-1 text-xs text-muted">
                <span className="font-semibold text-ink">{r.energy_density_kcal_per_g}</span> kcal / gram
              </p>
            )}
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/10">
          <div className="mb-2 flex justify-between items-center text-xs">
            <span className="text-muted font-medium flex items-center gap-1">
              <CheckCircle2 size={13} className="text-accent" />
              Vision Identification Confidence
            </span>
            <span className="font-bold tabular-nums text-ink">{Math.round(r.confidence * 100)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-accent to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(r.confidence * 100)}%` }}
              transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </GlassCard>

      {/* 2. Core Macro Rings */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MacroRing
          variants={item}
          label="Protein"
          grams={r.protein_g}
          share={pK / totalMacroCals}
          color="#ff375f"
          icon={Beef}
        />
        <MacroRing
          variants={item}
          label="Total Fats"
          grams={r.total_fat_g}
          share={fK / totalMacroCals}
          color="#ff9f0a"
          icon={Droplet}
        />
        <MacroRing
          variants={item}
          label="Total Carbs"
          grams={r.total_carbs_g}
          share={cK / totalMacroCals}
          color="#30b0ff"
          icon={Wheat}
        />
      </div>

      {/* 3. Detailed Identified Contents & Per-Item Estimates */}
      {r.foods && r.foods.length > 0 && (
        <GlassCard variants={item} className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink">Identified Food Components &amp; Estimates</h3>
                <p className="text-xs text-muted">Individual portion weights, calories, and detected contents</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-muted">
              {r.foods.length} items detected
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {r.foods.map((food, idx) => (
              <motion.div
                key={`${food.name}-${idx}`}
                whileHover={{ scale: 1.01 }}
                className="rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-base text-ink">{food.name}</h4>
                    <p className="text-xs text-muted mt-0.5">
                      {food.portion_desc || (food.estimated_weight_g > 0 ? `${Math.round(food.estimated_weight_g)}g portion` : "Portion estimate")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-bold text-ink tabular-nums">
                      {Math.round(food.calories_kcal)}
                    </span>
                    <span className="text-xs text-muted ml-1">kcal</span>
                  </div>
                </div>

                {/* Per-item macros if available */}
                {(food.protein_g > 0 || food.fat_g > 0 || food.carbs_g > 0) && (
                  <div className="mt-3 flex items-center gap-3 text-xs border-t border-black/5 dark:border-white/10 pt-2.5">
                    <span className="text-rose-500 font-medium">P: {fmt(food.protein_g)}g</span>
                    <span className="text-amber-500 font-medium">F: {fmt(food.fat_g)}g</span>
                    <span className="text-sky-500 font-medium">C: {fmt(food.carbs_g)}g</span>
                  </div>
                )}

                {/* Detected ingredients / contents */}
                {food.contents && food.contents.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {food.contents.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-black/5 dark:bg-white/10 px-2 py-0.5 text-[11px] text-muted font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* 4. Detailed Nutritional & Carb Breakdown */}
      <BreakdownCard result={r} variants={item} />

      {/* 5. GRAND TOTALS SHOWCASE AT THE BOTTOM WITH BEAUTIFUL ANIMATION */}
      <motion.div variants={bottomBanner} className="relative">
        {/* Glow border ring */}
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-accent via-purple-500 to-emerald-400 opacity-30 blur-lg transition duration-1000 group-hover:opacity-100" />

        <div className="relative rounded-3xl border border-white/20 bg-gradient-to-br from-white/90 via-white/70 to-white/95 dark:from-zinc-900/90 dark:via-zinc-900/80 dark:to-zinc-950/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-black/10 dark:border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent to-sky-400 text-white shadow-lg">
                <Award size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black tracking-tight text-ink">Grand Nutrition Summary</h3>
                  <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-bold">
                    Calculated
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted mt-0.5">
                  Complete verified nutritional and energy totals for this dish
                </p>
              </div>
            </div>

            {/* Total Calories Badge */}
            <div className="flex items-baseline gap-2 rounded-2xl bg-accent/10 px-5 py-3 border border-accent/20">
              <Flame size={20} className="text-orange-500" />
              <div>
                <span className="text-xs uppercase font-bold text-accent tracking-wider block">Total Energy</span>
                <span className="text-3xl font-extrabold tabular-nums text-ink">
                  <AnimatedNumber value={r.calories_kcal} />
                </span>
                <span className="text-sm font-semibold text-muted ml-1">kcal</span>
              </div>
            </div>
          </div>

          {/* Totals Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {/* Total Serving Weight */}
            <div className="rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] p-3.5 border border-black/5 dark:border-white/10">
              <span className="text-xs font-semibold text-muted block mb-1">Serving Weight</span>
              <p className="text-2xl font-bold tabular-nums text-ink">
                <AnimatedNumber value={r.serving_weight_g} />
                <span className="text-xs font-normal text-muted ml-1">g</span>
              </p>
            </div>

            {/* Total Protein */}
            <div className="rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 p-3.5 border border-rose-500/20">
              <span className="text-xs font-semibold text-rose-500 block mb-1">Total Protein</span>
              <p className="text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
                <AnimatedNumber value={r.protein_g} />
                <span className="text-xs font-normal text-muted ml-1">g</span>
              </p>
              <span className="text-[11px] text-muted">{pPct}% of macro cals</span>
            </div>

            {/* Total Fats */}
            <div className="rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 p-3.5 border border-amber-500/20">
              <span className="text-xs font-semibold text-amber-500 block mb-1">Total Fats</span>
              <p className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
                <AnimatedNumber value={r.total_fat_g} />
                <span className="text-xs font-normal text-muted ml-1">g</span>
              </p>
              <span className="text-[11px] text-muted">{fPct}% of macro cals</span>
            </div>

            {/* Total Carbs */}
            <div className="rounded-2xl bg-sky-500/5 dark:bg-sky-500/10 p-3.5 border border-sky-500/20">
              <span className="text-xs font-semibold text-sky-500 block mb-1">Total Carbs</span>
              <p className="text-2xl font-bold tabular-nums text-sky-600 dark:text-sky-400">
                <AnimatedNumber value={r.total_carbs_g} />
                <span className="text-xs font-normal text-muted ml-1">g</span>
              </p>
              <span className="text-[11px] text-muted">{cPct}% of macro cals</span>
            </div>

            {/* Net Carbs */}
            <div className="rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 p-3.5 border border-emerald-500/20">
              <span className="text-xs font-semibold text-emerald-500 block mb-1">Net Carbs</span>
              <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                <AnimatedNumber value={r.net_carbs_g} />
                <span className="text-xs font-normal text-muted ml-1">g</span>
              </p>
              <span className="text-[11px] text-muted">Carbs - Fiber</span>
            </div>

            {/* Energy Density */}
            <div className="rounded-2xl bg-purple-500/5 dark:bg-purple-500/10 p-3.5 border border-purple-500/20">
              <span className="text-xs font-semibold text-purple-500 block mb-1">Energy Density</span>
              <p className="text-2xl font-bold tabular-nums text-purple-600 dark:text-purple-400">
                {r.energy_density_kcal_per_g}
                <span className="text-xs font-normal text-muted ml-1">kcal/g</span>
              </p>
              <span className="text-[11px] text-muted">
                {r.energy_density_kcal_per_g < 1.5 ? "Low Density" : r.energy_density_kcal_per_g < 4 ? "Medium Density" : "High Density"}
              </span>
            </div>
          </div>

          {/* Macro Calorie Proportions Bar */}
          <div className="mt-6 pt-5 border-t border-black/10 dark:border-white/10">
            <div className="flex justify-between text-xs font-semibold text-muted mb-2">
              <span>Macro Calorie Split</span>
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#ff375f]" /> Protein ({pPct}%)</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#ff9f0a]" /> Fats ({fPct}%)</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#30b0ff]" /> Carbs ({cPct}%)</span>
              </div>
            </div>

            <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10 p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pPct}%` }}
                transition={{ duration: 0.9, delay: 0.3 }}
                className="h-full rounded-l-full bg-[#ff375f]"
                title={`Protein: ${pPct}%`}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${fPct}%` }}
                transition={{ duration: 0.9, delay: 0.4 }}
                className="h-full bg-[#ff9f0a]"
                title={`Fats: ${fPct}%`}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cPct}%` }}
                transition={{ duration: 0.9, delay: 0.5 }}
                className="h-full rounded-r-full bg-[#30b0ff]"
                title={`Carbs: ${cPct}%`}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footnote / Disclaimer */}
      {(r.notes || r.mode === "mock") && (
        <motion.div
          variants={item}
          className="flex items-start gap-2 px-3 text-xs text-muted"
        >
          <Info size={15} className="mt-0.5 shrink-0 text-accent" />
          <p>
            {r.notes || "Analyzed via AI multimodal model."} Values are estimates based on visual portion geometry and nutrient density algorithms.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
