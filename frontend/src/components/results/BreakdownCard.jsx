import { motion } from "framer-motion";
import { Gauge } from "lucide-react";

import GlassCard from "../ui/GlassCard.jsx";
import AnimatedNumber from "../ui/AnimatedNumber.jsx";
import { cn } from "../../lib/cn";

const fmt = (n) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 1 });

function densityBand(d) {
  if (d < 1.5)
    return { label: "Low density", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" };
  if (d < 4)
    return { label: "Medium density", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" };
  return { label: "High density", cls: "bg-rose-500/15 text-rose-600 dark:text-rose-400" };
}

function StackedBar({ segments }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total <= 0) return null;
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
      {segments
        .filter((s) => s.value > 0)
        .map((s, i) => (
          <motion.div
            key={s.label}
            title={`${s.label}: ${fmt(s.value)} g`}
            className="h-full"
            style={{ background: s.color }}
            initial={{ width: 0 }}
            animate={{ width: `${(s.value / total) * 100}%` }}
            transition={{ duration: 0.9, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
    </div>
  );
}

function Legend({ segments }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
      {segments
        .filter((s) => s.value > 0)
        .map((s) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.label} {fmt(s.value)} g
          </li>
        ))}
    </ul>
  );
}

function Row({ label, value, unit = "g", sub = false, children }) {
  return (
    <div className={cn("flex items-center justify-between py-2.5", sub && "pl-5 text-sm")}>
      <span className={sub ? "text-muted" : "font-medium"}>{label}</span>
      <span className="flex items-center gap-2 tabular-nums">
        {children}
        <span className={sub ? "" : "font-semibold"}>{fmt(value)}</span>
        <span className="text-sm text-muted">{unit}</span>
      </span>
    </div>
  );
}

/** "Detailed Nutritional & Carbohydrate Breakdown" */
export default function BreakdownCard({ result, variants }) {
  const r = result;
  const band = densityBand(r.energy_density_kcal_per_g);

  const carbParts =
    r.starch_g + r.total_sugars_g + r.fiber.total_g + r.sugar_alcohols_g;
  const other = Math.max(0, r.total_carbs_g - carbParts);

  const carbSegments = [
    { label: "Starch", value: r.starch_g, color: "#ff9f0a" },
    { label: "Sugars", value: r.total_sugars_g, color: "#ff375f" },
    { label: "Fiber", value: r.fiber.total_g, color: "#30d158" },
    { label: "Sugar alcohols", value: r.sugar_alcohols_g, color: "#bf5af2" },
    { label: "Other", value: other, color: "#8e8e93" },
  ];

  const fiberSegments = [
    { label: "Soluble", value: r.fiber.soluble_g, color: "#30d158" },
    { label: "Insoluble", value: r.fiber.insoluble_g, color: "#0a84ff" },
  ];

  return (
    <GlassCard variants={variants} className="p-6 sm:p-8">
      <h3 className="text-xl font-semibold">Detailed Nutritional &amp; Carbohydrate Breakdown</h3>
      <p className="mt-1 text-sm text-muted">
        {r.source_type === "label" ? "Per serving, read from the label" : "For the whole portion in the photo"}
        {r.serving_weight_g > 0 && ` · ${fmt(r.serving_weight_g)} g`}
      </p>

      {/* Carbohydrate composition */}
      <div className="mt-6">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm font-medium text-muted">Total carbohydrates</span>
          <span className="font-semibold tabular-nums">{fmt(r.total_carbs_g)} g</span>
        </div>
        <StackedBar segments={carbSegments} />
        <Legend segments={carbSegments} />
      </div>

      {/* Detail rows */}
      <div className="mt-6 divide-y divide-black/5 dark:divide-white/10">
        <Row label="Total Calories" value={r.calories_kcal} unit="kcal" />

        <Row label="Energy Density" value={r.energy_density_kcal_per_g} unit="kcal/g">
          <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", band.cls)}>
            <Gauge size={12} />
            {band.label}
          </span>
        </Row>

        <div>
          <Row label="Dietary Fiber" value={r.fiber.total_g} />
          <Row label="Soluble" value={r.fiber.soluble_g} sub />
          <Row label="Insoluble" value={r.fiber.insoluble_g} sub />
          {r.fiber.total_g > 0 && (
            <div className="pb-3 pl-5">
              <StackedBar segments={fiberSegments} />
            </div>
          )}
        </div>

        <div>
          <Row label="Total Sugars" value={r.total_sugars_g} />
          <Row label="Added Sugars" value={r.added_sugars_g} sub />
        </div>

        <Row label="Sugar Alcohols (Polyols)" value={r.sugar_alcohols_g} />
        <Row label="Starch" value={r.starch_g} />
      </div>

      {/* Net carbs */}
      <div className="mt-6 rounded-2xl bg-accent/10 p-5 ring-1 ring-accent/30">
        <div className="flex items-baseline justify-between">
          <span className="font-semibold">Net Carbs</span>
          <span className="text-3xl font-semibold tabular-nums text-accent">
            <AnimatedNumber value={r.net_carbs_g} decimals={1} /> g
          </span>
        </div>
        <p className="mt-2 text-xs text-muted">
          Total Carbs ({fmt(r.total_carbs_g)}) − Fiber ({fmt(r.fiber.total_g)}) − Sugar Alcohols (
          {fmt(r.sugar_alcohols_g)}) = {fmt(r.net_carbs_g)} g
        </p>
      </div>
    </GlassCard>
  );
}