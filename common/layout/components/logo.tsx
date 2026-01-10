import { useSidebar } from "@/common/components/ui/sidebar";
import { motion } from "framer-motion";
import Image from "next/image";

export const Logo = () => {
  const { open } = useSidebar();
  const text = "Sentinel Angkasa Pura".split("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: i * 0.05 },
    }),
  };

  const childVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal">
      <Image
        src={"/image/logo.png"}
        alt="Company Logo"
        width={30}
        height={30}
      />
      {open && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex overflow-hidden font-medium whitespace-pre text-black dark:text-white"
        >
          {text.map((char, index) => (
            <motion.span key={index} variants={childVariants}>
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.div>
      )}
    </div>
  );
};
