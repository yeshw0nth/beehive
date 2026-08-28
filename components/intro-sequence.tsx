"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function IntroSequence({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<"initial" | "split" | "zoom" | "done">("initial");

  useEffect(() => {
    // Stage timings
    const splitTimer = setTimeout(() => setStage("split"), 1500); // Wait 1.5s then split
    const zoomTimer = setTimeout(() => setStage("zoom"), 2500); // Reveal honeycomb and start zoom
    const doneTimer = setTimeout(() => {
      setStage("done");
      onComplete();
    }, 4000); // 1.5s for zoom effect then unmount

    return () => {
      clearTimeout(splitTimer);
      clearTimeout(zoomTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (stage === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-white overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {/* Honeycomb Background */}
        <motion.div
          className="absolute inset-0 z-0 flex items-center justify-center opacity-0"
          initial={false}
          animate={{
            opacity: stage === "zoom" ? 1 : 0,
            scale: stage === "zoom" ? 50 : 1, // Massive 3D Z-axis zoom
          }}
          transition={{ duration: 1.5, ease: "circIn" }}
        >
          {/* A geometric honeycomb pattern SVG. A center hexagon we zoom into. */}
          <svg
            width="800"
            height="800"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-100 fill-current"
          >
            {/* Center hexagon hole (we scale this up massively to pass through) */}
            <path
              d="M50 25 L75 39.5 L75 68.5 L50 83 L25 68.5 L25 39.5 Z"
              fill="white"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            {/* Surrounding hexagons */}
            <path
              d="M50 -4 L75 10.5 L75 39.5 L50 25 L25 39.5 L25 10.5 Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <path
              d="M75 39.5 L100 54 L100 83 L75 68.5 L50 83 L50 54 Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <path
              d="M50 83 L75 97.5 L75 126.5 L50 141 L25 126.5 L25 97.5 Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <path
              d="M25 39.5 L50 54 L50 83 L25 68.5 L0 83 L0 54 Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </svg>
        </motion.div>

        {/* Text Container */}
        <div className="relative z-10 flex text-6xl md:text-8xl font-bold tracking-tighter text-[#1A1A1A]">
          <motion.div
            initial={{ x: 0 }}
            animate={{
              x: stage === "split" || stage === "zoom" ? "-100vw" : 0,
            }}
            transition={{ duration: 1, ease: "anticipate" }}
            className="pr-2"
          >
            BEE
          </motion.div>
          <motion.div
            initial={{ x: 0 }}
            animate={{
              x: stage === "split" || stage === "zoom" ? "100vw" : 0,
            }}
            transition={{ duration: 1, ease: "anticipate" }}
            className="pl-2"
          >
            HIVE
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
