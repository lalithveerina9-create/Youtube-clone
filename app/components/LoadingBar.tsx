"use client";

import { motion } from "framer-motion";

export default function LoadingBar() {

  return (

    <div className="mt-10 flex flex-col items-center">

      {/* Motivation */}

      <motion.h1

        initial={{
          x: -120,
          opacity: 0,
        }}

        animate={{
          x: 0,
          opacity: 1,
        }}

        transition={{
          delay: 1.3,
          duration: 0.6,
        }}

        className="text-4xl font-bold text-white"

      >

        Every Expert

      </motion.h1>

      <motion.h1

        initial={{
          x: -120,
          opacity: 0,
        }}

        animate={{
          x: 0,
          opacity: 1,
        }}

        transition={{
          delay: 1.8,
          duration: 0.6,
        }}

        className="text-4xl font-bold text-cyan-300 mt-2"

      >

        Was Once

      </motion.h1>

      <motion.h1

        initial={{
          x: -120,
          opacity: 0,
        }}

        animate={{
          x: 0,
          opacity: 1,
        }}

        transition={{
          delay: 2.3,
          duration: 0.6,
        }}

        className="text-4xl font-bold text-white mt-2"

      >

        A Beginner

      </motion.h1>

      {/* Loading */}

      <motion.p

        initial={{
          opacity: 0,
        }}

        animate={{
          opacity: 1,
        }}

        transition={{
          delay: 3,
        }}

        className="mt-10 text-gray-300 tracking-[6px] uppercase"

      >

        Loading...

      </motion.p>

      {/* Progress Bar */}

      <div className="w-72 h-2 bg-gray-800 rounded-full mt-4 overflow-hidden">

        <motion.div

          initial={{
            width: 0,
          }}

          animate={{
            width: "100%",
          }}

          transition={{
            delay: 3.2,
            duration: 2,
            ease: "easeInOut",
          }}

          className="h-full bg-cyan-400"

        />

      </div>

    </div>

  );

}