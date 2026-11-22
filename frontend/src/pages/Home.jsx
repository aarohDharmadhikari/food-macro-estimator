import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ScanLine } from "lucide-react";

import ScannerPanel from "../components/scanner/ScannerPanel.jsx";
import ResultsDashboard from "../components/results/ResultsDashboard.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import { analyzeImage, fetchHealth } from "../lib/api.js";

const heroItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/** Small status pill: live AI, demo mode, or backend offline. */
function ModePill({ health }) {
  if (health === undefined) return null; // still checking

  let cls = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  let text = `Live AI · ${health?.model}`;

  if (health === null) {
    cls = "bg-rose-500/15 text-rose-700 dark:text-rose-300";
    text = "Backend offline · start the FastAPI server on port 8000";
  } else if (health.mode === "mock") {
    cls = "bg-amber-500/15 text-amber-700 dark:text-amber-300";
    text = "Demo mode · sample results. Add GEMINI_API_KEY for real analysis";
  }

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {text}
    </span>
  );
}

export default function Home() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [health, setHealth] = useState(undefined);

  const runId = useRef(0); // ignore responses from cancelled runs
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

  async function handleAnalyze() {
    if (!image) return;
    const id = ++runId.current;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await analyzeImage(image);
      if (id !== runId.current) return;
      setResult(data);
    } catch (err) {
      if (id !== runId.current) return;
      setError(err.message || "Something went wrong.");
    } finally {
      if (id === runId.current) setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20">
      {/* Hero */}
      <motion.section
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.12 }}
        className="px-2 pb-10 pt-8 text-center sm:pt-14"
      >
        <motion.div variants={heroItem} className="mb-5 flex flex-col items-center gap-3">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium">
            <ScanLine size={14} className="text-accent" />
            Vision + OCR nutrition intelligence
          </span>
          <ModePill health={health} />
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
          className="mx-auto mt-6 max-w-xl text-lg text-muted sm:text-xl"
        >
          Snap a meal or a nutrition label. Get calories, macros, net carbs and energy density in
          seconds.
        </motion.p>
      </motion.section>

      {/* Scanner */}
      <section id="scanner">
        <ScannerPanel
          image={image}
          previewUrl={previewUrl}
          loading={loading}
          onImage={handleImage}
          onClear={handleClear}
          onAnalyze={handleAnalyze}
        />
      </section>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto mt-5 max-w-2xl"
          >
            <GlassCard className="flex items-start gap-3 p-4 text-sm">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-500" />
              <p>{error}</p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.section
            ref={resultsRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto mt-10 max-w-3xl scroll-mt-28"
          >
            <ResultsDashboard result={result} />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}