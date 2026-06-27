"use client";

import { motion } from "framer-motion";

export default function Snowflake() {
  return (
    <motion.div
      initial={{
        scale: 0,
        opacity: 0,
        rotate: -180,
      }}
      animate={{
        scale: 1,
        opacity: 1,
        rotate: 0,
      }}
      transition={{
        duration: 1.2,
        ease: "easeOut",
      }}
      className="flex justify-center items-center"
    >
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.08, 1],
        }}
        transition={{
          rotate: {
            repeat: Infinity,
            duration: 12,
            ease: "linear",
          },
          scale: {
            repeat: Infinity,
            duration: 2,
          },
        }}
        className="relative"
      >
        {/* Glow */}
        <div
          className="
          absolute
          inset-0
          rounded-full
          blur-3xl
          bg-cyan-400
          opacity-40
          scale-150
        "
        />

        {/* Snowflake */}
        <div
          className="
          text-[120px]
          select-none
          relative
          z-10
          drop-shadow-[0_0_30px_#38bdf8]
        "
        >
          ❄
        </div>
      </motion.div>
    </motion.div>
  );
}