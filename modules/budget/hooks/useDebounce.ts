import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Atur timeout untuk memperbarui nilai setelah delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Batalkan timeout jika nilai berubah (misalnya, pengguna masih mengetik)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Hanya panggil ulang efek jika nilai atau delay berubah

  return debouncedValue;
}
