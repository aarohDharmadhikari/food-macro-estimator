import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, Image, Sparkles, AlertCircle, FileCheck2 } from "lucide-react";
import { cn } from "../../lib/cn";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 8; // keep in sync with MAX_UPLOAD_MB in backend/.env

// Quick test samples that create simple canvas food images for immediate 1-click testing
const SAMPLES = [
  { name: "Ramen Bowl", color: "#f59e0b", label: "🍜 Ramen", dishType: "ramen" },
  { name: "Chicken Biryani", color: "#ea580c", label: "🍛 Biryani", dishType: "biryani" },
  { name: "Greek Salad", color: "#10b981", label: "🥗 Salad", dishType: "salad" },
  { name: "Nutrition Facts", color: "#64748b", label: "🏷️ Label", dishType: "label" },
];

function createSampleBlob(dish) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 640, 480);
  grad.addColorStop(0, dish.color);
  grad.addColorStop(1, "#18181b");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 480);

  // Decorative text/emblem
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 44px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(dish.name, 320, 230);

  ctx.font = "20px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText("Macro Lens Sample Dish", 320, 275);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], `${dish.dishType}_sample.jpg`, { type: "image/jpeg" });
      resolve(file);
    }, "image/jpeg", 0.9);
  });
}

/** Rich drag-and-drop glass dropzone with quick sample presets. */
export default function ImageDropzone({ onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Unsupported format. Please select a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`That image exceeds the ${MAX_MB} MB limit.`);
      return;
    }
    setError("");
    onFile(file);
  }

  async function handleSelectSample(dish) {
    try {
      const file = await createSampleBlob(dish);
      setError("");
      onFile(file);
    } catch {
      setError("Failed to create sample image.");
    }
  }

  return (
    <div className="space-y-4">
      <motion.div
        role="button"
        tabIndex={0}
        aria-label="Upload a food photo"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        animate={{
          scale: dragging ? 1.015 : 1,
          borderColor: dragging ? "rgba(10, 132, 255, 0.8)" : "rgba(255, 255, 255, 0.15)",
        }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className={cn(
          "relative flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-6 text-center transition-all overflow-hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
          dragging
            ? "bg-accent/15 shadow-[0_0_30px_rgba(10,132,255,0.25)]"
            : "border-black/15 bg-black/[0.02] hover:border-accent/50 hover:bg-black/[0.04] dark:border-white/15 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]"
        )}
      >
        {/* Glow ambient background on drag */}
        {dragging && (
          <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-accent/20 to-transparent blur-xl" />
        )}

        <motion.div
          animate={{ y: dragging ? -6 : 0, scale: dragging ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 text-accent border border-accent/20 shadow-inner"
        >
          <UploadCloud size={38} className="drop-shadow" />
        </motion.div>

        <div className="space-y-1.5 max-w-sm">
          <p className="text-xl font-semibold tracking-tight">
            {dragging ? "Release photo to upload" : "Drop your meal photo here"}
          </p>
          <p className="text-sm text-muted">
            or <span className="text-accent underline font-medium">browse your files</span> &bull; supports meals &amp; nutrition labels
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-1 text-xs text-muted font-medium">
            <Image size={12} />
            JPG, PNG, WEBP
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-1 text-xs text-muted font-medium">
            <FileCheck2 size={12} />
            Up to {MAX_MB} MB
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs text-accent font-medium">
            <Sparkles size={12} />
            Gemini Vision Ready
          </span>
        </div>
      </motion.div>

      {/* Quick Test Demo Samples */}
      <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-3 text-center">
        <p className="text-xs text-muted font-medium mb-2 flex items-center justify-center gap-1.5">
          <Sparkles size={13} className="text-accent" />
          No photo handy? Try an instant preset:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {SAMPLES.map((dish) => (
            <button
              key={dish.name}
              type="button"
              onClick={() => handleSelectSample(dish)}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 dark:border-white/15 bg-white/60 dark:bg-white/10 px-3 py-1.5 text-xs font-medium hover:border-accent hover:text-accent transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <span>{dish.label}</span>
            </button>
          ))}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 text-sm text-rose-500 font-medium"
        >
          <AlertCircle size={15} />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
}
