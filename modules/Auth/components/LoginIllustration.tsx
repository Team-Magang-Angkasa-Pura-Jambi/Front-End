import React, { useEffect,  } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Variants } from "framer-motion";
export const LoginIllustration = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [mouseX, mouseY]);

  interface Particle {
    id: number;
    initialX: number;
    initialY: number;
    targetX: number[];
    targetY: number[];
    size: number;
    scale: number[];
    duration: number;
    delay: number;
  }

  const [particles, setParticles] = React.useState<Particle[]>([]);
  useEffect(() => {
    if (typeof window === "undefined") return;

    const width = window?.innerWidth ?? 1000;
    const height = window?.innerHeight ?? 1000;

    const newParticles = [...Array(15)].map((_, i) => ({
      id: i,
      initialX: Math.random() * width,
      initialY: Math.random() * height,
      targetX: [Math.random() * width, Math.random() * width],
      targetY: [Math.random() * height, Math.random() * height - 200],
      size: Math.random() * 8 + 4,
      scale: [Math.random() * 0.4 + 0.1, Math.random() * 0.7 + 0.2],
      duration: 8 + Math.random() * 5,
      delay: i * 0.6,
    }));

    setParticles(newParticles);
  }, []);

  const iconVariants: Variants = {
    float: (i: number) => ({
      y: [0, -15, 0, 15, 0],
      x: [0, 8, 0, -8, 0],
      rotate: [0, i % 2 === 0 ? 7 : -7, 0],
      transition: {
        duration: 6 + i * 2.5,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const,
        delay: i * 0.5,
      },
    }),
  };

  const glowVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      filter: [
        "drop-shadow(0 0 8px rgba(250, 204, 21, 0.6))",
        "drop-shadow(0 0 25px rgba(250, 204, 21, 0.8))",
        "drop-shadow(0 0 8px rgba(250, 204, 21, 0.6))",
      ],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  const rippleVariants = {
    ripple: {
      boxShadow: [
        "0 0 0 0px rgba(96, 165, 250, 0.5)",
        "0 0 0 35px rgba(96, 165, 250, 0)",
      ],
      transition: { duration: 3.5, repeat: Infinity, ease: "easeOut" as const },
    },
  };

  const shakeVariants = {
    shake: {
      rotate: [0, -2, 2, -2, 2, 0],
      x: [0, 2, -2, 2, -2, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  const winW = typeof window !== "undefined" ? window.innerWidth : 1000;
  const winH = typeof window !== "undefined" ? window.innerHeight : 1000;

  const iconParallaxX = useTransform(mouseX, [0, winW], [-20, 20]);
  const iconParallaxY = useTransform(mouseY, [0, winH], [-20, 20]);

  const springConfig = {
    stiffness: 25,
    damping: 15,
  };

  const smoothX = useSpring(iconParallaxX, springConfig);
  const smoothY = useSpring(iconParallaxY, springConfig);

  return (
    <div className="w-full h-full relative bg-gray-950 overflow-hidden flex items-center justify-center p-8">
      {/* --- BACKGROUND WAVE (SVG) --- */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
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
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* --- PARTICLES --- */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white pointer-events-none"
          initial={{
            x: p.initialX,
            y: p.initialY,
            scale: p.scale[0],
            opacity: 0,
          }}
          animate={{
            x: p.targetX,
            y: p.targetY,
            opacity: [0, 0.4, 0],
            scale: p.scale,
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            delay: p.delay,
          }}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
        />
      ))}

      {/* --- FLOATING ICONS CONTAINER (PARALLAX) --- */}
      <motion.div
        className="z-10 w-full h-full relative"
        style={{ x: smoothX, y: smoothY }}
      >
        {/* 1. Icon Listrik (Yellow) */}
        <motion.div
          custom={1}
          variants={iconVariants}
          animate="float"
          className="absolute top-[20%] left-[55%]"
          style={{ willChange: "transform" }}
        >
          <motion.div
            variants={glowVariants}
            animate="pulse"
            className="p-4 bg-yellow-400/15 border border-yellow-400/40 rounded-full shadow-lg backdrop-blur-sm"
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

        {/* 2. Icon Air (Blue) */}
        <motion.div
          custom={2}
          variants={iconVariants}
          animate="float"
          className="absolute top-[50%] left-[60%]"
          style={{ willChange: "transform" }}
        >
          <motion.div
            variants={rippleVariants}
            animate="ripple"
            className="p-5 bg-blue-400/15 border border-blue-400/40 rounded-full shadow-lg backdrop-blur-sm"
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

        {/* 3. Icon BBM (Orange) */}
        <motion.div
          custom={3}
          variants={iconVariants}
          animate="float"
          className="absolute bottom-[15%] left-[40%]"
          style={{ willChange: "transform" }}
        >
          <motion.div
            variants={shakeVariants}
            animate="shake"
            className="p-4 bg-orange-400/15 border border-orange-400/40 rounded-full shadow-lg backdrop-blur-sm"
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
      </motion.div>
    </div>
  );
};
