import { useEffect, useState } from "react";
import { animate } from "framer-motion";

/** Counts up from 0 to `value` with an ease-out curve. */
export default function AnimatedNumber({ value, decimals = 0, duration = 0.9 }) {
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [target, duration]);

  return (
    <>
      {display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </>
  );
}