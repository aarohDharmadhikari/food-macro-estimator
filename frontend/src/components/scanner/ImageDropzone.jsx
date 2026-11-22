import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";

import { cn } from "../../lib/cn";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 8; // keep in sync with MAX_UPLOAD_MB in backend/.env

/** Drag-and-drop glass dropzone (JPG / PNG / WEBP). */
export default function ImageDropzone({ onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Unsupported file. Please use a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`That image is larger than ${MAX_MB} MB.`);
      return;
    }
    setError("");
    onFile(file);
  }

  return (
    <div>
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
        animate={{ scale: dragging ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className={cn(
          "flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed px-6 text-center transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
          dragging
            ? "border-accent bg-accent/10"
            : "border-black/15 bg-black/[0.02] hover:border-accent/60 dark:border-white/20 dark:bg-white/[0.03]"
        )}
      >
        <motion.span
          animate={{ y: dragging ? -6 : 0 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent"
        >
          <UploadCloud size={30} />
        </motion.span>
        <div>
          <p className="text-lg font-semibold">Drop a photo here</p>
          <p className="mt-1 text-sm text-muted">
            or click to browse &middot; JPG, PNG, WEBP &middot; up to {MAX_MB} MB
          </p>
        </div>
      </motion.div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = ""; // allow re-selecting the same file
        }}
      />

      {error && <p className="mt-3 text-center text-sm text-rose-500">{error}</p>}
    </div>
  );
}