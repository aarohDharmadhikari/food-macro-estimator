import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

const MotionLink = motion.create(Link);

const VARIANTS = {
  primary: "bg-accent text-white shadow-lg shadow-accent/30 hover:brightness-110",
  glass: "glass text-ink hover:brightness-105",
  ghost: "text-ink hover:bg-black/5 dark:hover:bg-white/10",
};

const SIZES = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[15px]",
  lg: "h-14 px-8 text-base",
};

const SPRING = { type: "spring", stiffness: 500, damping: 28 };

/** Spring-physics button. Pass `to` to render a router link instead. */
export default function Button({
  variant = "primary",
  size = "md",
  to,
  className = "",
  children,
  ...rest
}) {
  const classes = cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-full font-medium",
    "transition-[filter,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className
  );

  const motionProps = {
    whileTap: { scale: 0.95 },
    whileHover: rest.disabled ? undefined : { scale: 1.03 },
    transition: SPRING,
  };

  if (to) {
    return (
      <MotionLink to={to} className={classes} {...motionProps} {...rest}>
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button type="button" className={classes} {...motionProps} {...rest}>
      {children}
    </motion.button>
  );
}