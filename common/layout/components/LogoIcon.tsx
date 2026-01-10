import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export const LogoIcon = ({
  className,
  width = 120,
  height = 40,
}: LogoProps) => {
  return (
    <Link
      href="/"
      className={cn(
        "relative z-20 flex items-center py-1 transition-opacity hover:opacity-90",
        className
      )}
    >
      <Image
        src="/img/logo.png"
        alt="Sentinel Angkasa Pura"
        width={width}
        height={height}
        // PRIORITAS TINGGI: Agar logo dimuat instan (LCP)
        priority
        className={cn(
          "h-8 w-auto object-contain",
          // TRIK DARK MODE:
          // Jika logo asli Anda teks hitam transparan:
          // Filter ini akan membalik warnanya jadi putih saat dark mode.
          // Hapus baris di bawah ini jika logo Anda sudah berwarna (misal biru/orange)
          "dark:brightness-0 dark:invert"
        )}
      />
    </Link>
  );
};
