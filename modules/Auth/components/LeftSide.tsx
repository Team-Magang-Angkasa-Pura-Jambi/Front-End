// Di dalam komponen, misalnya: src/app/login/page.tsx
"use client";

import { Lock, User } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLogin } from "@/hooks/useLogin";
import { Logo } from "@/common/layout/components/logo";
import { LogoIcon } from "@/common/layout/components/LogoIcon";
import Image from "next/image";

// Animation variants for the container and its children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Delay between each child animation
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

export const LeftSide = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: performLogin, isPending, isError } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin({ username, password });
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Varian untuk teks individual (jika ingin animasi per baris)
  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };
  return (
    <motion.div
      className="w-full md:w-[40%] p- sm:p-12  py-0 flex flex-col  z-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className=" text-center md:text-left z-20" // Z-index agar di atas ilustrasi
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1, // Setiap anak akan muncul dengan jeda 0.1 detik
              delayChildren: 0.2, // Anak pertama akan mulai setelah 0.2 detik
            },
          },
        }}
      >
        {/* Logo */}
        <motion.div variants={textVariants} >
          <Image
            src={"/image/logo.png"}
            alt="Company Logo"
            width={150}
            height={150}
          />
        </motion.div>

        {/* Welcome To */}
        <motion.h1
          className="text-3xl font-bold text-gray-200" // Warna teks lebih terang untuk dark mode, ukuran lebih besar
          variants={textVariants}
        >
          Welcome To
        </motion.h1>

        {/* SENTINEL */}
        <motion.h2
          className="text-5xl font-extrabold text-blue-400 mt-1 drop-shadow-lg" // Warna lebih terang, ukuran lebih besar, bayangan
          variants={textVariants}
        >
          SENTINEL
        </motion.h2>

        {/* Deskripsi */}
        <motion.p
          className="text-blue-200  max-w-sm" // Warna teks lebih terang, margin top sedikit lebih banyak
          variants={textVariants}
        >
          Please log in to access your dashboard.
        </motion.p>
      </motion.div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <motion.fieldset
          className="relative border border-gray-300 rounded-lg group"
          variants={itemVariants}
        >
          <legend className="ml-3 px-1 text-sm font-medium text-gray-600 transition-colors group-focus-within:text-blue-600">
            Username
          </legend>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="pl-10 pr-4 py-2 w-full text-black border-none bg-transparent h-auto focus-visible:ring-0 focus-visible:ring-offset-0 bg"
            />
          </div>
        </motion.fieldset>

        <motion.fieldset
          className="relative border border-gray-300 rounded-lg group"
          variants={itemVariants}
        >
          <legend className="ml-3 px-1 text-sm font-medium text-gray-600 transition-colors group-focus-within:text-blue-600">
            Password
          </legend>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="pl-10 pr-4 py-2 w-full border-none text-black bg-transparent h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </motion.fieldset>

        {isError && (
          <motion.p
            variants={itemVariants}
            className="text-sm font-medium text-red-500"
          >
            Username atau password yang Anda masukkan salah.
          </motion.p>
        )}

        <motion.div variants={itemVariants}>
          <Button type="submit" className="w-full" disabled={isPending} asChild>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {isPending ? "Logging in..." : "Login"}
            </motion.button>
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};
