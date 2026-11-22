import { motion } from "framer-motion";

/** Fixed ambient gradient blobs that give the glass cards something to blur. */
export default function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-canvas">
      {/* Animated Blobs using Framer Motion for better control */}
      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, 60, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-sky-300/50 blur-3xl dark:bg-blue-600/25"
      />
      <motion.div
        animate={{
          x: [0, -60, 0],
          y: [0, 40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-32 top-1/4 h-[30rem] w-[30rem] rounded-full bg-emerald-200/50 blur-3xl dark:bg-emerald-500/15"
      />
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -50, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-48 left-1/4 h-[36rem] w-[36rem] rounded-full bg-fuchsia-200/40 blur-3xl dark:bg-fuchsia-600/20"
      />
    </div>
  );
}