import React from "react";
import { motion } from "framer-motion";

export const LoginIllustration = () => {
  const iconVariants = {
    float: (i: number) => ({
      y: [0, -10, 0, 10, 0],
      x: [0, 5, 0, -5, 0],
      rotate: [0, i % 2 === 0 ? 5 : -5, 0],
      transition: {
        duration: 5 + i * 2,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    }),
  };

  // Varian untuk efek cahaya/denyut pada ikon listrik
  const glowVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      filter: [
        "drop-shadow(0 0 5px #facc15)",
        "drop-shadow(0 0 15px #facc15)",
        "drop-shadow(0 0 5px #facc15)",
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Varian untuk efek riak air
  const rippleVariants = {
    ripple: {
      boxShadow: [
        "0 0 0 0px rgba(96, 165, 250, 0.4)",
        "0 0 0 25px rgba(96, 165, 250, 0)",
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeOut",
      },
    },
  };

  // Varian untuk efek getar/goyang pada ikon BBM
  const shakeVariants = {
    shake: {
      rotate: [0, -1.5, 1.5, -1.5, 1.5, 0],
      x: [0, 1, -1, 1, -1, 0],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="w-full h-full relative bg-gray-900 overflow-hidden flex items-center justify-center p-8">
      {/* Background Gelombang Animasi menggunakan SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(29, 78, 216, 0)" />
          </linearGradient>
        </defs>
        <motion.path
          fill="url(#waveGradient)"
          d="M0,50 C25,25 75,75 100,50 L100,100 L0,100 Z"
          animate={{
            d: [
              "M0,50 C25,25 75,75 100,50 L100,100 L0,100 Z",
              "M0,50 C25,75 75,25 100,50 L100,100 L0,100 Z",
              "M0,50 C25,25 75,75 100,50 L100,100 L0,100 Z",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Kontainer untuk ikon yang melayang */}
      <div className="z-10 w-full h-full relative">
        {/* Ikon Listrik dengan animasi denyut */}
        <motion.div
          custom={1}
          variants={iconVariants}
          animate="float"
          className="absolute top-[20%] left-[55%]"
        >
          <motion.div
            variants={glowVariants}
            animate="pulse"
            className="p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-full shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#facc15"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
          </motion.div>
        </motion.div>

        {/* Ikon Air dengan animasi riak */}
        <motion.div
          custom={2}
          variants={iconVariants}
          animate="float"
          className="absolute top-[50%] left-[60%]"
        >
          <motion.div
            variants={rippleVariants}
            animate="ripple"
            className="p-5 bg-blue-400/10 border border-blue-400/30 rounded-full shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z"></path>
            </svg>
          </motion.div>
        </motion.div>

        {/* Ikon BBM dengan animasi goyang */}
        <motion.div
          custom={3}
          variants={iconVariants}
          animate="float"
          className="absolute bottom-[15%] left-[40%]"
        >
          <motion.div
            variants={shakeVariants}
            animate="shake"
            className="p-4 bg-orange-400/10 border border-orange-400/30 rounded-full shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fb923c"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.54.51a.5.5 0 0 0-.54 0l-4.47 2.33a.5.5 0 0 0-.25.43v5.16a.5.5 0 0 0 .24.43l4.47 2.33a.5.5 0 0 0 .54 0l4.47-2.33a.5.5 0 0 0 .25-.43V3.27a.5.5 0 0 0-.25-.43z"></path>
              <path d="M20.53 12.3a.5.5 0 0 0-.53 0l-4.47 2.33a.5.5 0 0 0-.25.43v5.16a.5.5 0 0 0 .24.43l4.47 2.33a.5.5 0 0 0 .54 0l4.47-2.33a.5.5 0 0 0 .25-.43v-5.16a.5.5 0 0 0-.25-.43z"></path>
              <path d="M4.47 12.3a.5.5 0 0 0-.54 0L-.53 14.63a.5.5 0 0 0-.25.43v5.16a.5.5 0 0 0 .24.43l4.47 2.33a.5.5 0 0 0 .54 0l4.47-2.33a.5.5 0 0 0 .25-.43v-5.16a.5.5 0 0 0-.25-.43z"></path>
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
