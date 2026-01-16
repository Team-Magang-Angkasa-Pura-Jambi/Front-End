"use client";

import { Loader2, Lock, User } from "lucide-react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { useState } from "react";
import { useLogin } from "@/modules/Auth/hooks/useLogin";
import { HeaderLogo } from "./logo";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export const LeftSide = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: performLogin, isPending, isError, error } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      username: username.trim(),
      password,
    };
    username.trim();
    performLogin(payload);
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };
  return (
    <motion.div
      className="z-10 flex w-full flex-col p-3 py-0 sm:p-12 md:w-[40%]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="z-20 text-center md:text-left"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,

              delayChildren: 0.2,
            },
          },
        }}
      >
        <HeaderLogo />
        {/* Welcome To */}
        <motion.h1
          className="text-3xl font-bold text-gray-400"
          variants={textVariants}
        >
          Welcome To
        </motion.h1>
        {/* SENTINEL */}
        <motion.h2
          className="mt-1 text-5xl font-extrabold text-blue-400 drop-shadow-lg"
          variants={textVariants}
        >
          SENTINEL
        </motion.h2>
        {/* Deskripsi */}
        <motion.p className="max-w-sm text-blue-300" variants={textVariants}>
          Please log in to access your dashboard.
        </motion.p>
      </motion.div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <motion.fieldset
          className="group relative rounded-lg border border-gray-300 focus-within:border-blue-600"
          variants={itemVariants}
        >
          <legend className="ml-3 px-1 text-sm font-medium text-gray-600 transition-colors group-focus-within:text-blue-600">
            Username
          </legend>
          <div className="relative">
            <User className="text-muted-foreground absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 group-focus-within:text-blue-600" />
            <Input
              required
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="h-auto w-full border-none bg-transparent py-2 pl-10 pr-4 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </motion.fieldset>

        <motion.fieldset
          className="group relative rounded-lg border border-gray-300 focus-within:border-blue-600"
          variants={itemVariants}
        >
          <legend className="ml-3 px-1 text-sm font-medium text-gray-600 transition-colors group-focus-within:text-blue-600">
            Password
          </legend>
          <div className="relative">
            <Lock className="text-muted-foreground absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 group-focus-within:text-blue-600" />
            <Input
              required
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-auto w-full border-none bg-transparent py-2 pl-10 pr-4 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </motion.fieldset>

        {/* mode="wait" memastikan animasi keluar selesai dulu baru elemen hilang total */}
        <AnimatePresence mode="wait">
          {isError && (
            <motion.p
              key="error-message"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
              className="text-sm font-medium text-red-500"
            >
              {error?.response?.data?.status?.message ||
                "Internal Server Error"}
            </motion.p>
          )}
        </AnimatePresence>
        <motion.div variants={itemVariants}>
          <Button type="submit" className="w-full" disabled={isPending} asChild>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {isPending ? (
                <Loader2 className="h-12 w-12 animate-spin text-white" />
              ) : (
                "Login"
              )}
            </motion.button>
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};
