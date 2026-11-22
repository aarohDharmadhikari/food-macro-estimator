import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  CandyOff,
  Eye,
  Gauge,
  ListChecks,
  Scale,
  Timer,
} from "lucide-react";

import GlassCard from "../components/ui/GlassCard.jsx";
import Button from "../components/ui/Button.jsx";
import Reveal from "../components/ui/Reveal.jsx";

const PROBLEMS = [
  {
    icon: Timer,
    title: "Manual logging is a chore",
    body: "Searching databases, guessing portions and typing numbers after every meal is the fastest way to abandon a healthy habit.",
  },
  {
    icon: CandyOff,
    title: "Added sugars hide in plain sight",
    body: "Sauces, yogurts and 'healthy' bars carry sugar that a quick glance never reveals. Total sugars alone can't tell you what was added.",
  },
  {
    icon: Scale,
    title: "Net carbs vs. total carbs",
    body: "Fiber and sugar alcohols are only partly digested, so they don't behave like starch or sugar. Treating every gram of carbohydrate as equal is misleading.",
  },
  {
    icon: Gauge,
    title: "Energy density is invisible",
    body: "300 kcal of vegetables and 300 kcal of cookies fill you very differently. Calories per gram explains why, yet almost no tracker shows it.",
  },
];

const STEPS = [
  {
    icon: Camera,
    title: "Snap",
    body: "Point your camera at a meal or a nutrition label, or upload a photo you already have.",
  },
  {
    icon: Eye,
    title: "Read",
    body: "A vision model identifies each food and estimates portions. For labels, OCR reads the printed values directly.",
  },
  {
    icon: ListChecks,
    title: "Understand",
    body: "You get a structured breakdown. Net carbs and energy density are calculated exactly, not guessed.",
  },
];

export default function About() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-24">
      {/* Intro */}
      <section className="pb-20 pt-10 text-center sm:pt-16">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm font-semibold uppercase tracking-[0.2em] text-accent"
        >
          The Problem &amp; Our Mission
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 text-5xl font-semibold leading-[1.05] sm:text-7xl"
        >
          Counting calories
          <br />
          <span className="text-gradient">shouldn&rsquo;t feel like homework.</span>
        </motion.h1>
      </section>

      {/* Problem */}
      <section>
        <Reveal>
          <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
            Why traditional tracking fails
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Most apps ask you to do the hard work: find the food, weigh the portion, decode the
            label. Four problems keep coming up.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {PROBLEMS.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={(i % 2) * 0.1}>
              <GlassCard hover className="h-full p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                  <Icon size={22} />
                </span>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-muted">{body}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section className="mt-28">
        <Reveal>
          <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
            Our solution: look, and know.
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Vision and OCR close the gap between what you see on the plate or the package and its
            exact metabolic impact, in seconds.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.12}>
              <GlassCard hover className="relative h-full overflow-hidden p-7">
                <span className="absolute -right-2 -top-6 select-none text-[7rem] font-bold leading-none text-black/[0.04] dark:text-white/[0.05]">
                  {i + 1}
                </span>
                <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Icon size={22} />
                </span>
                <h3 className="relative mt-5 text-xl font-semibold">{title}</h3>
                <p className="relative mt-2 text-muted">{body}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Net carbs explainer */}
      <section className="mt-28">
        <Reveal>
          <GlassCard className="p-8 sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Net carbs, explained
            </p>
            <h3 className="mt-3 max-w-xl text-3xl font-semibold">
              The number on the front of the pack isn&rsquo;t the whole story.
            </h3>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-center sm:gap-4">
              {[
                { label: "Total carbs", value: "24 g", cls: "bg-sky-500/15 text-sky-600 dark:text-sky-300" },
                { op: "−" },
                { label: "Fiber", value: "10 g", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
                { op: "−" },
                { label: "Sugar alcohols", value: "8 g", cls: "bg-purple-500/15 text-purple-600 dark:text-purple-300" },
                { op: "=" },
                { label: "Net carbs", value: "6 g", cls: "bg-accent text-white" },
              ].map((part, i) =>
                part.op ? (
                  <span key={i} className="text-2xl font-light text-muted">
                    {part.op}
                  </span>
                ) : (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: i * 0.08 }}
                    className={`rounded-2xl px-5 py-3 ${part.cls}`}
                  >
                    <p className="text-xs opacity-80">{part.label}</p>
                    <p className="text-2xl font-semibold tabular-nums">{part.value}</p>
                  </motion.div>
                )
              )}
            </div>

            <p className="mt-6 max-w-xl text-sm text-muted">
              Example: a protein bar with 24 g of total carbohydrate that only contributes about 6 g
              of net carbs. Macro Lens calculates this for you on every scan.
            </p>
          </GlassCard>
        </Reveal>
      </section>

      {/* CTA */}
      <Reveal className="mt-24 text-center">
        <h2 className="text-3xl font-semibold sm:text-4xl">Ready to see your meal clearly?</h2>
        <div className="mt-8 flex justify-center">
          <Button to="/" size="lg">
            Open the scanner
            <ArrowRight size={18} />
          </Button>
        </div>
      </Reveal>
    </div>
  );
}