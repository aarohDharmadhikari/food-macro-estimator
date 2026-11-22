import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

/** Frosted-glass surface. `hover` adds a gentle spring lift. */
export default function GlassCard({
  children,
  className = "",
  strong = false,
  hover = false,
  ...rest
}) {
  return (
    <motion.div
      className={cn("glass rounded-3xl", strong && "glass-strong", className)}
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}