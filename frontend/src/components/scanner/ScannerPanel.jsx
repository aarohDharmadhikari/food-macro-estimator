import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, ImagePlus, Loader2, Sparkles, UploadCloud } from "lucide-react";

import GlassCard from "../ui/GlassCard.jsx";
import Button from "../ui/Button.jsx";
import CameraScanner from "./CameraScanner.jsx";
import ImageDropzone from "./ImageDropzone.jsx";
import { cn } from "../../lib/cn";

const TABS = [
  { id: "camera", label: "Live camera", icon: Camera },
  { id: "upload", label: "Upload photo", icon: UploadCloud },
];

/**
 * Dual-input scanner.
 * No image yet -> tabs (camera / upload).  Image chosen -> preview + Analyze.
 */
export default function ScannerPanel({ image, previewUrl, loading, onImage, onClear, onAnalyze }) {
  const [mode, setMode] = useState("camera");

  return (
    <GlassCard className="mx-auto w-full max-w-2xl p-3 sm:p-4">
      {!image ? (
        <>
          {/* Segmented control */}
          <div className="relative mx-auto mb-3 flex w-full max-w-sm rounded-full bg-black/5 p-1 dark:bg-white/10">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className="relative flex-1 rounded-full px-4 py-2 text-sm font-medium"
              >
                {mode === id && (
                  <motion.span
                    layoutId="scanner-tab"
                    className="absolute inset-0 rounded-full bg-white shadow dark:bg-white/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex items-center justify-center gap-2",
                    mode === id ? "text-ink" : "text-muted"
                  )}
                >
                  <Icon size={16} />
                  {label}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {mode === "camera" ? (
                <CameraScanner onCapture={onImage} />
              ) : (
                <ImageDropzone onFile={onImage} />
              )}
            </motion.div>
          </AnimatePresence>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-black">
            <img src={previewUrl} alt="Selected food" className="h-full w-full object-contain" />

            {loading && (
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]">
                <div className="absolute inset-x-[8%] top-0 h-full">
                  <div className="absolute inset-x-0 top-0 h-0.5 animate-scan rounded-full bg-gradient-to-r from-transparent via-accent-soft to-transparent shadow-[0_0_20px_5px_rgba(100,210,255,0.6)]" />
                </div>
                <div className="absolute inset-x-0 bottom-5 flex justify-center">
                  <span className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white">
                    <Loader2 size={16} className="animate-spin" />
                    Analyzing your photo…
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <Button variant="glass" className="flex-1" onClick={onClear} disabled={loading}>
              <ImagePlus size={18} />
              Choose another
            </Button>
            <Button className="flex-1" onClick={onAnalyze} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? "Analyzing…" : "Analyze nutrition"}
            </Button>
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
}