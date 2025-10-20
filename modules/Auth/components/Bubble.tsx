import React, { useEffect } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useMouse } from "@uidotdev/usehooks";

const springConfig = {
  damping: 40,
  stiffness: 200,
  mass: 2,
};

export const Bubble = ({ size, style, delay }) => {
  // 1. Ubah `useMouse` untuk melacak seluruh viewport (hapus 'ref')
  // Ini penting agar logika paralaks [0, window.innerWidth] berfungsi
  const [mouse] = useMouse();

  // 2. Buat MotionValues untuk menjembatani 'mouse' (state React) 
  //    dengan 'framer-motion'
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 3. Gunakan 'useEffect' HANYA untuk memperbarui MotionValues
  //    Ini adalah cara yang benar untuk menyinkronkan state non-motion
  useEffect(() => {
    // Tangani nilai 'null' jika mouse berada di luar jendela
    mouseX.set(mouse.x ?? 0);
    mouseY.set(mouse.y ?? 0);
    // Kita hanya perlu menjalankan ini ketika 'mouse.x' atau 'mouse.y' berubah
  }, [mouse.x, mouse.y, mouseX, mouseY]);

  // 4. Definisikan SEMUA hook di top-level
  
  // --- Efek Mengambang (Floating) ---
  const time = useMotionValue(delay * 1000);
  useAnimationFrame((t) => {
    time.set(t + delay * 1000);
  });

  const floatingX = useTransform(
    time,
    (t) => Math.sin(t / 2000) * (size / 4)
  );
  const floatingY = useTransform(
    time,
    (t) => Math.cos(t / 1500) * (size / 4)
  );

  // --- Efek Paralaks (Parallax) ---
  const parallaxX = useTransform(
    mouseX, // Gunakan MotionValue, bukan 'mouse.x'
    [0, typeof window !== "undefined" ? window.innerWidth : 1000],
    [-size / 8, size / 8]
  );
  const parallaxY = useTransform(
    mouseY, // Gunakan MotionValue, bukan 'mouse.y'
    [0, typeof window !== "undefined" ? window.innerHeight : 1000],
    [-size / 8, size / 8]
  );

  // --- Kombinasi ---
  // Gabungkan kedua transformasi secara deklaratif
  const combinedX = useTransform(
    [floatingX, parallaxX],
    ([latestFloating, latestParallax]) => latestFloating + latestParallax
  );
  const combinedY = useTransform(
    [floatingY, parallaxY],
    ([latestFloating, latestParallax]) => latestFloating + latestParallax
  );

  // 5. Buat 'useSpring' melacak MotionValue gabungan
  //    Ini akan secara otomatis menerapkan fisika spring setiap kali
  //    'combinedX' atau 'combinedY' berubah.
  const x = useSpring(combinedX, springConfig);
  const y = useSpring(combinedY, springConfig);

  return (
    <motion.div
      // 6. Hapus 'ref' karena sudah tidak digunakan oleh useMouse
      className="absolute rounded-full bg-white/10 border border-white/20 backdrop-blur-sm transition-transform duration-300 ease-out"
      style={{
        width: size,
        height: size,
        ...style,
        x, // Terapkan spring
        y, // Terapkan spring
        willChange: "transform",
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.2 }}
      transition={{ duration: 0.5, delay, type: "spring" }}
    />
  );
};