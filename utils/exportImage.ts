import { toJpeg } from "html-to-image";

interface ExportOptions {
  fileName?: string;
  quality?: number;
  backgroundColor?: string;
}

/**
 * Utility untuk mendownload elemen HTML menjadi gambar JPG
 * @param ref - React Ref object yang mengarah ke elemen DOM
 * @param options - Opsi kustomisasi nama file dan kualitas
 */
export const downloadElementAsJpg = async (
  ref: React.RefObject<HTMLElement | null>,
  options: ExportOptions = {}
) => {
  const {
    fileName = `export-${Date.now()}.jpg`,
    quality = 0.95,
    backgroundColor = "#ffffff",
  } = options;

  if (!ref.current) {
    console.error("Elemen tidak ditemukan untuk di-export");
    return;
  }

  try {
    const dataUrl = await toJpeg(ref.current, {
      quality,
      backgroundColor,
      cacheBust: true,
      pixelRatio: 2, // Membuat gambar lebih tajam (Retina Ready)
      style: {
        borderRadius: "0", // Menghindari artefak hitam di sudut rounded
      },
    });

    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataUrl;

    // Menambahkan ke dokumen agar kompatibel dengan semua browser
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Gagal mengekspor gambar:", err);
    throw err; // Lempar error agar komponen pemanggil bisa menangani (misal: show toast)
  }
};
