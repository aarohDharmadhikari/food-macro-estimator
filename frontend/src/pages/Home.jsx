import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Cpu, Globe, RefreshCw, ScanLine, Sparkles } from "lucide-react";

import ScannerPanel from "../components/scanner/ScannerPanel.jsx";
import ResultsDashboard from "../components/results/ResultsDashboard.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import { analyzeImage, fetchHealth } from "../lib/api.js";

const heroItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/** Status pill showing server & model engine state */
function ModePill({ health, engine }) {
  if (health === undefined) return null;

  let cls = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
  let text = `Live Gemini AI · ${health?.model || "gemini-3.5-flash"}`;
  let Icon = Globe;

  if (health === null) {
    cls = "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30";
    text = "Backend offline · run launcher or start FastAPI port 8000";
    Icon = AlertTriangle;
  } else if (engine === "local") {
    cls = "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30";
    text = "Local Engine Active · Heuristic CV & USDA Model";
    Icon = Cpu;
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-medium border backdrop-blur-md ${cls}`}
    >
      <Icon size={13} />
      <span>{text}</span>
    </span>
  );
}

export default function Home() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [health, setHealth] = useState(undefined);
  const [engine, setEngine] = useState("online"); // "online" | "local"

  const runId = useRef(0);
  const resultsRef = useRef(null);

  const previewUrl = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    fetchHealth().then(setHealth);
  }, []);

  useEffect(() => {
    if (result) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  function handleImage(file) {
    runId.current += 1;
    setImage(file);
    setResult(null);
    setError("");
    setLoading(false);
  }

  function handleClear() {
    runId.current += 1;
    setImage(null);
    setResult(null);
    setError("");
    setLoading(false);
  }

  async function handleAnalyze(selectedEngine) {
    if (!image) return;
    const targetEngine = selectedEngine || engine;
    const id = ++runId.current;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await analyzeImage(image, targetEngine);
      if (id !== runId.current) return;
      setResult(data);
    } catch (err) {
      if (id !== runId.current) return;
      setError(err.message || "Failed to process image.");
    } finally {
      if (id === runId.current) setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24">
      {/* Hero */}
      <motion.section
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.12 }}
        className="px-2 pb-8 pt-8 text-center sm:pt-12"
      >
        <motion.div variants={heroItem} className="mb-5 flex flex-col items-center gap-3">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium">
            <ScanLine size={14} className="text-accent" />
            AI Multimodal Vision &amp; Macro Intelligence
          </span>
          <ModePill health={health} engine={engine} />
        </motion.div>

        <motion.h1
          variants={heroItem}
          className="text-5xl font-semibold leading-[1.05] sm:text-7xl"
        >
          Know exactly what&rsquo;s
          <br />
          <span className="text-gradient">on your plate.</span>
        </motion.h1>

        <motion.p
          variants={heroItem}
          className="mx-auto mt-5 max-w-xl text-lg text-muted sm:text-xl font-normal"
        >
          Snap a meal or a nutrition label. Receive real-time AI food deconstruction, component weights, macro breakdowns, and energy density.
        </motion.p>
      </motion.section>

      {/* Scanner Panel */}
      <section id="scanner">
        <ScannerPanel
          image={image}
          previewUrl={previewUrl}
          loading={loading}
          engine={engine}
          onEngineChange={setEngine}
          onImage={handleImage}
          onClear={handleClear}
          onAnalyze={handleAnalyze}
        />
      </section>

      {/* Error with Smart Actions */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto mt-6 max-w-2xl"
          >
            <GlassCard className="p-4 sm:p-5 border-rose-500/30 bg-rose-500/5">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="mt-0.5 shrink-0 text-rose-500" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-semibold text-rose-500">Analysis Error</p>
                  <p className="text-xs text-rose-400 font-mono leading-relaxed">{error}</p>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleAnalyze(engine)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 dark:bg-white/20 px-3 py-1.5 text-xs font-medium hover:bg-white/25 transition-all"
                    >
                      <RefreshCw size={12} />
                      Retry ({engine})
                    </button>
                    {engine === "online" && (
                      <button
                        type="button"
                        onClick={() => {
                          setEngine("local");
                          handleAnalyze("local");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-accent text-white px-3 py-1.5 text-xs font-medium hover:opacity-90 shadow-sm"
                      >
                        <Cpu size={12} />
                        Run with Local Engine Instead
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Dashboard */}
      <AnimatePresence>
        {result && (
          <motion.section
            ref={resultsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mx-auto mt-10 max-w-4xl scroll-mt-24"
          >
            <ResultsDashboard result={result} />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
