import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, SwitchCamera } from "lucide-react";

import { useCamera } from "../../hooks/useCamera.js";
import { cn } from "../../lib/cn";

const CORNER = "absolute h-8 w-8 border-white/90";

/** Live viewfinder with scanning reticle, front/rear switch and capture button. */
export default function CameraScanner({ onCapture }) {
  const { videoRef, status, error, facing, start, stop, switchCamera, capture } = useCamera();
  const [flash, setFlash] = useState(false);
  const [captureError, setCaptureError] = useState("");

  // Open the camera when mounted, release it when unmounted.
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
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-black">
      {/* The <video> is always mounted so the stream has somewhere to attach. */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={cn("h-full w-full object-cover", facing === "user" && "-scale-x-100")}
      />

      {/* Reticle + scan line */}
      {live && (
        <div className="pointer-events-none absolute inset-[12%]">
          <span className={cn(CORNER, "left-0 top-0 rounded-tl-2xl border-l-2 border-t-2")} />
          <span className={cn(CORNER, "right-0 top-0 rounded-tr-2xl border-r-2 border-t-2")} />
          <span className={cn(CORNER, "bottom-0 left-0 rounded-bl-2xl border-b-2 border-l-2")} />
          <span className={cn(CORNER, "bottom-0 right-0 rounded-br-2xl border-b-2 border-r-2")} />
          <div className="absolute inset-x-2 top-0 h-0.5 animate-scan rounded-full bg-gradient-to-r from-transparent via-accent-soft to-transparent shadow-[0_0_18px_4px_rgba(100,210,255,0.55)]" />
        </div>
      )}

      {live && (
        <p className="pointer-events-none absolute inset-x-0 top-4 text-center text-xs font-medium text-white/85 drop-shadow">
          Center your meal or nutrition label
        </p>
      )}

      {/* Starting overlay */}
      <AnimatePresence>
        {status === "starting" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 text-white"
          >
            <Loader2 className="animate-spin" />
            <span className="text-sm">Starting camera…</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error overlay */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 px-8 text-center text-white">
          <AlertTriangle className="text-amber-400" />
          <p className="max-w-sm text-sm text-white/85">{error}</p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => start(facing)}
            className="rounded-full bg-white/15 px-5 py-2 text-sm font-medium hover:bg-white/25"
          >
            Try again
          </motion.button>
        </div>
      )}

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/65 to-transparent px-8 pb-5 pt-12">
        <motion.button
          type="button"
          whileTap={{ scale: 0.88, rotate: 180 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          onClick={switchCamera}
          disabled={status === "starting"}
          aria-label="Switch camera"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/25 disabled:opacity-40"
        >
          <SwitchCamera size={20} />
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          onClick={handleCapture}
          disabled={!live}
          aria-label="Capture photo"
          className="h-[68px] w-[68px] rounded-full border-4 border-white p-1 disabled:opacity-40"
        >
          <span className="block h-full w-full rounded-full bg-white" />
        </motion.button>

        <span className="h-11 w-11" aria-hidden />
      </div>

      {captureError && (
        <p className="absolute inset-x-0 bottom-28 text-center text-xs text-amber-300">
          {captureError}
        </p>
      )}

      {/* Shutter flash */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute inset-0 bg-white"
          />
        )}
      </AnimatePresence>
    </div>
  );
}