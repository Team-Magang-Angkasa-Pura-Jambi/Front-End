// hooks/useDownloadImage.ts
import { downloadElementAsJpg } from "@/utils/exportImage";
import { useRef, useState, useCallback } from "react";
import { toast } from "sonner"; // Sesuaikan dengan library toast Anda (sonner/react-hot-toast)

interface UseDownloadImageOptions {
  fileName?: string; // Default filename (opsional)
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const useDownloadImage = <T extends HTMLElement>(
  defaultOptions?: UseDownloadImageOptions
) => {
  const ref = useRef<T>(null);
  const [isExporting, setIsExporting] = useState(false);

  const download = useCallback(
    async (fileNameOverride?: string) => {
      if (!ref.current) {
        console.warn("Ref belum terpasang ke elemen manapun.");
        return;
      }

      setIsExporting(true);

      // Gunakan nama file dari argumen fungsi, atau dari opsi default, atau fallback generic
      const finalFileName =
        fileNameOverride ||
        defaultOptions?.fileName ||
        `download-${Date.now()}.jpg`;

      try {
        await downloadElementAsJpg(ref, {
          fileName: finalFileName,
        });

        toast.success("Gambar berhasil diunduh");
        if (defaultOptions?.onSuccess) defaultOptions.onSuccess();
      } catch (error) {
        console.error("Download error:", error);
        toast.error("Gagal mengunduh gambar");
        if (defaultOptions?.onError) defaultOptions.onError(error);
      } finally {
        setIsExporting(false);
      }
    },
    [defaultOptions]
  );

  return {
    ref, // Pasang ini di elemen wrapper (Card/Div)
    download, // Panggil ini di tombol onClick
    isExporting, // Gunakan ini untuk state loading/disabled button
  };
};
