"use client";

import "../styles/intro.css";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Snowflake from "./Snowflake";
import LoadingBar from "./LoadingBar";

export default function IntroAnimation() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 5500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.03,
          }}
          transition={{
            duration: 0.8,
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#030712] via-[#071A2C] to-black"
        >
          {/* Floating Particles */}

          <div className="absolute inset-0 overflow-hidden">
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-cyan-300 opacity-20"
                style={{
                  left: `${(i * 4) % 100}%`,
                  top: `${(i * 7) % 100}%`,
                }}
                animate={{
                  y: [-20, -250],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 6,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          <Snowflake />

          <LoadingBar />
        </motion.div>
      )}
    </AnimatePresence>
  );
}