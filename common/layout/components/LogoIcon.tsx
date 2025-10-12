import Image from "next/image";

export const LogoIcon = () => {
  return (
    <div className="relative z-20 flex items-center py-1">
      <Image
        src="/img/logo.png" // Path dari folder public
        alt="Company Logo"
        width={120} // Ganti dengan lebar asli gambar Anda (dalam piksel)
        height={40} // Ganti dengan tinggi asli gambar Anda (dalam piksel)
        className="h-8 w-auto" // Styling tambahan dengan Tailwind CSS
      />
    </div>
  );
};
