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
    scale = 3,
    excludeClasses = ["hide-on-export", "no-print"],
  } = options;

  if (!ref.current) {
    console.error("❌ Ref element is null");
    return false;
  }

  try {
    const filter = (node: HTMLElement) => {
      const exclusionList = excludeClasses;

      if (node.classList) {
        return !exclusionList.some((classname) =>
          node.classList.contains(classname)
        );
      }
      return true;
    };

    const dataUrl = await toJpeg(ref.current, {
      quality,
      backgroundColor,
      cacheBust: true,
      pixelRatio: scale,
      filter: filter,
      style: {
        borderRadius: "0px",
        boxShadow: "none",

        ["WebkitFontSmoothing" as string]: "antialiased",
        ["MozOsxFontSmoothing" as string]: "grayscale",
      },
    });

    const link = document.createElement("a");
    link.download = fileName.endsWith(".jpg") ? fileName : `${fileName}.jpg`;
    link.href = dataUrl;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (err) {
    console.error("❌ Failed to export image:", err);
    throw new Error("Gagal memproses gambar. Silakan coba lagi.");
  }
};
