// Di dalam komponen, misalnya: src/app/login/page.tsx
"use client";

import { Lock, User } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLogin } from "@/hooks/useLogin";

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

  return (
    <motion.div
      className="w-full md:w-[40%] p-8 sm:p-12 py-0 flex flex-col justify-center z-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="mb-5 text-center md:text-left"
        variants={itemVariants}
      >
        <h1 className="text-2xl font-bold text-gray-800">Welcome To</h1>
        <h2 className="text-4xl font-extrabold text-blue-600">SENTINEL</h2>
        <p className="text-muted-foreground mt-2">
          Please log in to access your dashboard.
        </p>
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
              className="pl-10 pr-4 py-2 w-full border-none bg-transparent h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
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
              className="pl-10 pr-4 py-2 w-full border-none bg-transparent h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
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
