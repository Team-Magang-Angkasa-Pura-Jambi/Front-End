import { toJpeg } from "html-to-image";

interface ExportOptions {
  fileName?: string;
  quality?: number;
  scale?: number;
  backgroundColor?: string;
  /** Array nama class yang elemennya ingin disembunyikan saat foto */
  excludeClasses?: string[];
}

/**
 * Modern Utility untuk Export DOM ke JPG
 * Fitur: Retina ready, Element Filtering, & Font Smoothing
 */
export const downloadElementAsJpg = async (
  ref: React.RefObject<HTMLElement | null>,
  options: ExportOptions = {}
): Promise<boolean> => {
  const {
    fileName = `sentinel-export-${new Date().toISOString().split("T")[0]}.jpg`,
    quality = 0.95,
    backgroundColor = "#ffffff",
    scale = 3, // Default 3x untuk ketajaman maksimal (High DPI)
    excludeClasses = ["hide-on-export", "no-print"], // Default class yang diabaikan
  } = options;

  if (!ref.current) {
    console.error("❌ Ref element is null");
    return false;
  }

  try {
    // 1. Filter Function: Mengabaikan elemen dengan class tertentu
    const filter = (node: HTMLElement) => {
      const exclusionList = excludeClasses;
      if (node.classList) {
        // Jika elemen memiliki class yang ada di exclusionList, return false (jangan render)
        return !exclusionList.some((classname) =>
          node.classList.contains(classname)
        );
      }
      return true;
    };

    // 2. Generate Data URL
    const dataUrl = await toJpeg(ref.current, {
      quality,
      backgroundColor,
      cacheBust: true,
      pixelRatio: scale,
      filter: filter, // Terapkan filter
      style: {
        // Styling khusus saat render gambar agar lebih rapi
        borderRadius: "0px",
        boxShadow: "none",
        fontSmooth: "antialiased",
        webkitFontSmoothing: "antialiased",
      },
    });

    // 3. Trigger Download secara Modern
    const link = document.createElement("a");
    link.download = fileName.endsWith(".jpg") ? fileName : `${fileName}.jpg`;
    link.href = dataUrl;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true; // Berhasil
  } catch (err) {
    console.error("❌ Failed to export image:", err);
    throw new Error("Gagal memproses gambar. Silakan coba lagi.");
  }
};
