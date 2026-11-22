import { motion } from "framer-motion";
import { Github, Linkedin } from "lucide-react";

import GlassCard from "../components/ui/GlassCard.jsx";
import Reveal from "../components/ui/Reveal.jsx";

/*
 * EDIT HERE: replace the placeholder names, bios and links with the real
 * details of the two authors.
 */
const CONTRIBUTORS = [
  {
    name: "Contributor One",
    role: "Lead AI & Backend Engineer",
    bio: "Designs the vision and OCR pipeline, enforces structured JSON extraction, and builds the FastAPI services that turn a photo into a precise nutritional breakdown.",
    stack: ["Python", "FastAPI", "Gemini Vision", "Pydantic", "OCR"],
    github: "https://github.com/your-username",
    linkedin: "https://www.linkedin.com/in/your-profile",
    gradient: "from-sky-400 to-indigo-500",
  },
  {
    name: "Contributor Two",
    role: "Frontend Architect & UI Designer",
    bio: "Crafts the glassmorphic design system, the live camera experience and the fluid motion that makes every interaction feel native and effortless.",
    stack: ["React", "Tailwind CSS", "Framer Motion", "Vite", "UI/UX"],
    github: "https://github.com/your-username",
    linkedin: "https://www.linkedin.com/in/your-profile",
    gradient: "from-fuchsia-400 to-orange-400",
  },
];

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Contributors() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-24">
      <section className="pb-14 pt-10 text-center sm:pt-16">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm font-semibold uppercase tracking-[0.2em] text-accent"
        >
          The Team
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 text-5xl font-semibold leading-[1.05] sm:text-6xl"
        >
          Built by <span className="text-gradient">two people</span>
          <br />
          who hate manual logging.
        </motion.h1>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {CONTRIBUTORS.map((c, i) => (
          <Reveal key={c.name} delay={i * 0.12}>
            <GlassCard hover className="h-full p-8">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${c.gradient} text-2xl font-semibold text-white shadow-lg`}
              >
                {initials(c.name)}
              </div>

              <h2 className="mt-6 text-2xl font-semibold">{c.name}</h2>
              <p className="mt-1 text-sm font-medium text-accent">{c.role}</p>
              <p className="mt-4 text-muted">{c.bio}</p>

              <ul className="mt-6 flex flex-wrap gap-2">
                {c.stack.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium dark:bg-white/10"
                  >
                    {tech}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex gap-3">
                <motion.a
                  href={c.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ scale: 1.04 }}
                  className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                >
                  <Github size={16} />
                  GitHub
                </motion.a>
                <motion.a
                  href={c.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ scale: 1.04 }}
                  className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                >
                  <Linkedin size={16} />
                  LinkedIn
                </motion.a>
              </div>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
}