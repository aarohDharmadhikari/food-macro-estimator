import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Classic Claude CLI / braille dot rotating spinner frames
const ASCII_SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

const ANALYSIS_STAGES = [
  { text: "Initializing multimodal vision stream…", sub: "Connecting to neural inference pipeline" },
  { text: "Scanning food geometry & segmenting ingredients…", sub: "Detecting dishes, textures and depth contours" },
  { text: "Estimating portion volumes & gram weights…", sub: "Cross-referencing volumetric nutrition models" },
  { text: "Calculating proteins, fats & complex carbs…", sub: "Deriving glycemic density and caloric breakdown" },
  { text: "Synthesizing final nutritional intelligence…", sub: "Generating complete macro profile dashboard" },
];

export default function CliProgressBar({ engine = "online" }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(12);

  // Rotate ASCII spinner smoothly (85ms per frame)
  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % ASCII_SPINNER.length);
    }, 85);
    return () => clearInterval(timer);
  }, []);

  // Advance stage messages slowly with graceful fade
  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < ANALYSIS_STAGES.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Gradually increment progress bar up to 94% until completion
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) return 94;
        const jump = Math.floor(Math.random() * 8) + 4;
        return Math.min(prev + jump, 94);
      });
    }, 380);
    return () => clearInterval(interval);
  }, []);

  const currentStage = ANALYSIS_STAGES[stageIndex];

  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl bg-zinc-950/85 border border-white/15 p-4 shadow-2xl backdrop-blur-xl font-mono text-zinc-200">
      {/* Top Header Row with CLI tag and live spinner ring */}
      <div className="flex items-center justify-between text-xs mb-2.5 pb-1 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-cyan-400">
            {engine === "online" ? "GEMINI VISION CLOUD" : "LOCAL NEURAL ENGINE"}
          </span>
          <span className="text-zinc-500">•</span>
          <span className="text-[11px] text-zinc-400">INFERENCE RUNNING</span>
        </div>
        
        {/* CLI Claude-style rotating ASCII pixel dot ring */}
        <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-sm bg-cyan-950/50 px-2 py-0.5 rounded-md border border-cyan-500/30">
          <span className="text-cyan-400 animate-pulse text-base leading-none">
            {ASCII_SPINNER[frameIndex]}
          </span>
          <span className="text-[11px] font-semibold tabular-nums text-cyan-200">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Progress Track & Animated Bar */}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-zinc-900 border border-white/10 p-0.5">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 relative"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {/* Glowing head at the end of progress */}
          <span className="absolute right-0 top-0 bottom-0 w-3 rounded-full bg-white shadow-[0_0_12px_2px_rgba(56,189,248,0.9)]" />
        </motion.div>
      </div>

      {/* Thin Status Text Transitioning slowly (fading in and out) */}
      <div className="mt-3.5 min-h-[44px] flex flex-col justify-center text-center px-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={stageIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="space-y-0.5"
          >
            <p className="text-xs font-light text-zinc-100 tracking-wide">
              {currentStage.text}
            </p>
            <p className="text-[10px] text-zinc-400/80 font-sans tracking-normal">
              {currentStage.sub}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Terminal Footnote */}
      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500 font-sans">
        <span>Step {stageIndex + 1} of {ANALYSIS_STAGES.length}</span>
        <span className="text-zinc-400 font-mono">lat: ~1.2s • res: 1080p</span>
      </div>
    </div>
  );
}
