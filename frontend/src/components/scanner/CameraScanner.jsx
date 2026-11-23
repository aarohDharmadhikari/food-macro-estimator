import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Camera, Loader2, Sparkles, SwitchCamera } from "lucide-react";

import { useCamera } from "../../hooks/useCamera.js";
import { cn } from "../../lib/cn";

const CORNER = "absolute h-8 w-8 border-white/90";

/** Live viewfinder with beta banner, blurred viewfinder preview, and capture control. */
export default function CameraScanner({ onCapture }) {
  const { videoRef, status, error, facing, start, stop, switchCamera, capture } = useCamera();
  const [flash, setFlash] = useState(false);
  const [captureError, setCaptureError] = useState("");

  // Open camera on mount, stop on unmount
  useEffect(() => {
    start("environment");
    return stop;
  }, [start, stop]);

  async function handleCapture() {
    setCaptureError("");
    try {
      const file = await capture();
      setFlash(true);
      setTimeout(() => setFlash(false), 250);
      onCapture(file);
    } catch (err) {
      setCaptureError(err.message);
    }
  }

  const live = status === "live";

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-black border border-white/10 shadow-2xl">
      {/* Beta badge floating at top left */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-full bg-amber-500/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-black shadow-lg">
        <Sparkles size={13} className="text-black" />
        <span>BETA FEATURE</span>
      </div>

      {/* The <video> element with frosted blur styling */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={cn(
          "h-full w-full object-cover transition-all duration-500",
          facing === "user" && "-scale-x-100",
          live && "blur-md scale-105 opacity-80"
        )}
      />

      {/* Beta blur overlay banner */}
      {live && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
          <div className="rounded-2xl bg-black/60 backdrop-blur-lg px-5 py-3 border border-white/15 shadow-xl max-w-xs">
            <p className="text-xs font-semibold tracking-wider uppercase text-amber-400 mb-0.5">
              Live Preview &bull; Beta Mode
            </p>
            <p className="text-xs text-white/80">
              Camera is blurred for privacy &amp; beta stability. Position dish in frame and tap shutter to snap!
            </p>
          </div>
        </div>
      )}

      {/* Reticle corners */}
      {live && (
        <div className="pointer-events-none absolute inset-[12%] z-10">
          <span className={cn(CORNER, "left-0 top-0 rounded-tl-2xl border-l-2 border-t-2")} />
          <span className={cn(CORNER, "right-0 top-0 rounded-tr-2xl border-r-2 border-t-2")} />
          <span className={cn(CORNER, "bottom-0 left-0 rounded-bl-2xl border-b-2 border-l-2")} />
          <span className={cn(CORNER, "bottom-0 right-0 rounded-br-2xl border-b-2 border-r-2")} />
          <div className="absolute inset-x-2 top-0 h-0.5 animate-scan rounded-full bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_18px_4px_rgba(100,210,255,0.7)]" />
        </div>
      )}

      {/* Starting overlay */}
      <AnimatePresence>
        {status === "starting" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/80 text-white"
          >
            <Loader2 className="animate-spin text-accent" size={32} />
            <span className="text-sm font-medium">Initializing camera feed…</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error overlay */}
      {status === "error" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/85 px-8 text-center text-white">
          <AlertTriangle className="text-amber-400" size={36} />
          <p className="max-w-sm text-sm text-white/85">{error}</p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => start(facing)}
            className="rounded-full bg-white/20 px-5 py-2 text-sm font-medium hover:bg-white/30 backdrop-blur"
          >
            Try again
          </motion.button>
        </div>
      )}

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent px-8 pb-6 pt-12">
        <motion.button
          type="button"
          whileTap={{ scale: 0.88, rotate: 180 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          onClick={switchCamera}
          disabled={status === "starting"}
          aria-label="Switch camera"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30 disabled:opacity-40 transition-colors"
        >
          <SwitchCamera size={22} />
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          onClick={handleCapture}
          disabled={!live}
          aria-label="Capture photo"
          className="h-[72px] w-[72px] rounded-full border-4 border-white/90 p-1 disabled:opacity-40 shadow-xl transition-all hover:scale-105"
        >
          <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-black shadow-inner">
            <Camera size={26} className="text-zinc-800" />
          </span>
        </motion.button>

        <span className="h-12 w-12" aria-hidden />
      </div>

      {captureError && (
        <p className="absolute inset-x-0 bottom-28 z-20 text-center text-xs text-amber-300 bg-black/60 py-1">
          {captureError}
        </p>
      )}

      {/* Shutter flash */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0.95 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute inset-0 z-30 bg-white"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
