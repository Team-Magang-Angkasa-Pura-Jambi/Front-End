"use client";
import React, { useEffect } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

import { useMouse, useWindowSize } from "@uidotdev/usehooks";

const springConfig = {
  damping: 40,
  stiffness: 200,
  mass: 2,
};

export const Bubble = ({ size, style, delay }) => {
  const [mouse] = useMouse();

  const { width, height } = useWindowSize();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    mouseX.set(mouse.x ?? 0);
    mouseY.set(mouse.y ?? 0);
  }, [mouse.x, mouse.y, mouseX, mouseY]);

  const time = useMotionValue(delay * 1000);
  useAnimationFrame((t) => {
    time.set(t + delay * 1000);
  });

  const floatingX = useTransform(time, (t) => Math.sin(t / 2000) * (size / 4));
  const floatingY = useTransform(time, (t) => Math.cos(t / 1500) * (size / 4));

  const parallaxX = useTransform(
    mouseX,
    [0, width ?? 1000],
    [-size / 8, size / 8]
  );
  const parallaxY = useTransform(
    mouseY,
    [0, height ?? 1000],
    [-size / 8, size / 8]
  );

  const combinedX = useTransform(
    [floatingX, parallaxX],
    ([latestFloating, latestParallax]) =>
      Number(latestFloating) + Number(latestParallax)
  );
  const combinedY = useTransform(
    [floatingY, parallaxY],
    ([latestFloating, latestParallax]) =>
      Number(latestFloating) + Number(latestParallax)
  );

  const x = useSpring(combinedX, springConfig);
  const y = useSpring(combinedY, springConfig);

  return (
    <motion.div
      className="absolute rounded-full bg-white/10 border border-white/20 backdrop-blur-sm transition-transform duration-300 ease-out"
      style={{
        width: size,
        height: size,
        ...style,
        x,
        y,
        willChange: "transform",
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.2 }}
      transition={{ duration: 0.5, delay, type: "spring" }}
    />
  );
};
