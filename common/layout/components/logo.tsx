import { motion } from "motion/react";
import Image from "next/image";

export const Logo = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <div className=" shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white">
        <Image
          src={"/image/logo.png"} // Path dari folder public
          alt="Company Logo"
          width={30} // Ganti dengan lebar asli gambar Anda (dalam piksel)
          height={30} // Ganti dengan tinggi asli gambar Anda (dalam piksel)
          // className="h-8 w-auto" // Styling tambahan dengan Tailwind CSS
        />
      </div>
      <div className="relative z-20 flex items-center py-1">
        {/* <Image
          src={"/image/logo.png"} // Path dari folder public
          alt="Company Logo"
          width={250} // Ganti dengan lebar asli gambar Anda (dalam piksel)
          height={250} // Ganti dengan tinggi asli gambar Anda (dalam piksel)
          // className="h-8 w-auto" // Styling tambahan dengan Tailwind CSS
        /> */}
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        Sentinel Angkasa Pura
      </motion.span>
    </div>
  );
};
