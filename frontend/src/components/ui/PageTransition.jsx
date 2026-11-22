import { motion } from "framer-motion";

/*
 * Opacity + slide only (no CSS filter): a filter on an ancestor would break
 * the backdrop-filter blur of the glass cards inside the page.
 */
export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}