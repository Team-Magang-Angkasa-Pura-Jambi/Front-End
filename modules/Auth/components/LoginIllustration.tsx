import React from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimationFrame,
} from "framer-motion";
import { useMouse } from "@uidotdev/usehooks";

export const LoginIllustration = () => {
  const [mouse] = useMouse();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useAnimationFrame(() => {
    mouseX.set(mouse.x ?? 0);
    mouseY.set(mouse.y ?? 0);
  });

  const iconVariants = {
    float: (i: number) => ({
      y: [0, -15, 0, 15, 0],
      x: [0, 8, 0, -8, 0],
      rotate: [0, i % 2 === 0 ? 7 : -7, 0],
      transition: {
        duration: 6 + i * 2.5,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
        delay: i * 0.5,
      },
    }),
  };

  const glowVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      filter: [
        "drop-shadow(0 0 8px rgba(250, 204, 21, 0.6))", // Sedikit lebih terang dan menyebar
        "drop-shadow(0 0 25px rgba(250, 204, 21, 0.8))", // Denyut lebih kuat
        "drop-shadow(0 0 8px rgba(250, 204, 21, 0.6))",
      ],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const rippleVariants = {
    ripple: {
      boxShadow: [
        "0 0 0 0px rgba(96, 165, 250, 0.5)", // Opacity riak lebih tinggi
        "0 0 0 35px rgba(96, 165, 250, 0)",
      ],
      transition: {
        duration: 3.5,
        repeat: Infinity,
        ease: "easeOut",
      },
    },
  };

  const shakeVariants = {
    shake: {
      rotate: [0, -2, 2, -2, 2, 0],
      x: [0, 2, -2, 2, -2, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const iconParallaxX = useTransform(
    mouseX,
    [0, typeof window !== "undefined" ? window.innerWidth : 1000],
    [-20, 20]
  );
  const iconParallaxY = useTransform(
    mouseY,
    [0, typeof window !== "undefined" ? window.innerHeight : 1000],
    [-20, 20]
  );

  return (
    <div className="w-full h-full relative bg-gray-950 overflow-hidden flex items-center justify-center p-8">
      {" "}
      {/* Latar belakang lebih gelap (gray-950) */}
      {/* Background Gelombang Animasi menggunakan SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            {/* Warna gelombang sedikit lebih pekat/gelap agar serasi dengan bg 950 */}
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />{" "}
            {/* Sedikit lebih gelap */}
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
      {/* Partikel Latar Belakang */}
      {[...Array(15)].map(
        (
          _,
          i // Tambah jumlah partikel
        ) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white" // Opacity diatur di animate
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.4 + 0.1, // Ukuran sedikit lebih kecil
              opacity: 0,
            }}
            animate={{
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight - 200,
              ],
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
              ],
              opacity: [0, 0.4, 0], // Opacity puncak sedikit lebih tinggi untuk visibilitas
              scale: [Math.random() * 0.4 + 0.1, Math.random() * 0.7 + 0.2], // Skala bervariasi
            }}
            transition={{
              duration: 8 + Math.random() * 5,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
              delay: i * 0.6, // Delay sedikit lebih rapat
            }}
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
            }} // Ukuran partikel lebih kecil
          />
        )
      )}
      {/* Kontainer untuk ikon yang melayang */}
      <motion.div
        className="z-10 w-full h-full relative"
        style={{ x: iconParallaxX, y: iconParallaxY }}
      >
        {/* Ikon Listrik dengan animasi denyut */}
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
            className="p-4 bg-yellow-400/15 border border-yellow-400/40 rounded-full shadow-lg" // Background dan border sedikit lebih pekat
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
          style={{ willChange: "transform" }}
        >
          <motion.div
            variants={rippleVariants}
            animate="ripple"
            className="p-5 bg-blue-400/15 border border-blue-400/40 rounded-full shadow-lg" // Background dan border sedikit lebih pekat
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
          style={{ willChange: "transform" }}
        >
          <motion.div
            variants={shakeVariants}
            animate="shake"
            className="p-4 bg-orange-400/15 border border-orange-400/40 rounded-full shadow-lg" // Background dan border sedikit lebih pekat
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
