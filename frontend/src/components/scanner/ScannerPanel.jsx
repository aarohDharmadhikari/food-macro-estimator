import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Cpu, Globe, ImagePlus, Loader2, Sparkles, UploadCloud } from "lucide-react";

import GlassCard from "../ui/GlassCard.jsx";
import Button from "../ui/Button.jsx";
import CameraScanner from "./CameraScanner.jsx";
import ImageDropzone from "./ImageDropzone.jsx";
import CliProgressBar from "./CliProgressBar.jsx";
import { cn } from "../../lib/cn";

const TABS = [
  { id: "upload", label: "Upload photo", icon: UploadCloud, beta: false },
  { id: "camera", label: "Live camera", icon: Camera, beta: true },
];

/**
 * Dual-input scanner with live Engine Selector, CLI Progress UI & preview.
 */
export default function ScannerPanel({
  image,
  previewUrl,
  loading,
  engine = "online",
  onEngineChange,
  onImage,
  onClear,
  onAnalyze,
}) {
  const [tab, setTab] = useState("upload");

  return (
    <GlassCard className="mx-auto w-full max-w-2xl p-4 sm:p-6 shadow-2xl relative">
      {/* Top Engine Selector Bar */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-3.5 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Engine:
          </span>
          <div className="inline-flex rounded-xl bg-black/5 dark:bg-white/10 p-1">
            <button
              type="button"
              disabled={loading}
              onClick={() => onEngineChange?.("online")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all",
                engine === "online"
                  ? "bg-accent text-white shadow-md shadow-accent/25"
                  : "text-muted hover:text-ink"
              )}
            >
              <Globe size={13} />
              <span>Online (Gemini AI)</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => onEngineChange?.("local")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all",
                engine === "local"
                  ? "bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 shadow-md"
                  : "text-muted hover:text-ink"
              )}
            >
              <Cpu size={13} />
              <span>Local Engine</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px]">
            {engine === "online" ? "Gemini Vision Active" : "Local CV Active"}
          </span>
        </div>
      </div>

      {!image ? (
        <>
          {/* Segmented control for Upload vs Live Camera */}
          <div className="relative mx-auto mb-4 flex w-full max-w-md rounded-full bg-black/5 p-1 dark:bg-white/10">
            {TABS.map(({ id, label, icon: Icon, beta }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className="relative flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-colors"
              >
                {tab === id && (
                  <motion.span
                    layoutId="scanner-tab"
                    className="absolute inset-0 rounded-full bg-white shadow-md dark:bg-white/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex items-center justify-center gap-1.5",
                    tab === id ? "text-ink font-semibold" : "text-muted hover:text-ink"
                  )}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                  {beta && (
                    <span className="rounded-full bg-amber-500/20 text-amber-500 dark:text-amber-400 px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider">
                      Beta
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {tab === "camera" ? (
                <CameraScanner onCapture={onImage} />
              ) : (
                <ImageDropzone onFile={onImage} />
              )}
            </motion.div>
          </AnimatePresence>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-black border border-white/10 shadow-2xl">
            <img src={previewUrl} alt="Selected food" className="h-full w-full object-contain" />

            {/* Image specs badge */}
            <div className="absolute top-4 left-4 z-10 rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1 text-xs text-white/90 border border-white/15">
              {image?.name || "Selected Photo"}
            </div>

            {/* Fullscreen Overlay with CLI progress bar when analyzing */}
            {loading && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20">
                {/* Visual scan line */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden">
                  <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_4px_rgba(34,211,238,0.8)] animate-scan" />
                </div>

                {/* Claude CLI Style Progress Bar with Braille Rotating Ring */}
                <CliProgressBar engine={engine} />
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button variant="glass" className="flex-1 py-3.5 text-sm" onClick={onClear} disabled={loading}>
              <ImagePlus size={18} />
              Choose another
            </Button>
            <Button
              className="flex-1 py-3.5 text-sm bg-gradient-to-r from-accent via-sky-500 to-indigo-500 hover:opacity-95 shadow-lg shadow-accent/20 text-white font-semibold"
              onClick={() => onAnalyze?.(engine)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              {loading
                ? engine === "online"
                  ? "Gemini AI Analyzing…"
                  : "Processing Locally…"
                : `Analyze with ${engine === "online" ? "Gemini AI" : "Local Engine"}`}
            </Button>
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
}
