export const formatToMwh = (
  value: number | string,
  withUnit: boolean = true
): string => {
  let cleanValue: number;

  // 1. Normalisasi Input (Sama seperti sebelumnya)
  if (typeof value === "string") {
    const normalized = value
      .replace(/[^\d,.-]/g, "") // Hapus teks non-angka
      .replace(/\./g, "") // Hapus titik ribuan
      .replace(",", "."); // Ganti koma desimal jadi titik

    cleanValue = parseFloat(normalized);
  } else {
    cleanValue = value;
  }

  // Cek validitas
  if (isNaN(cleanValue)) return "0";

  let finalValue = cleanValue;
  let unit = "kWh";

  // 2. Logika Fleksibel (Auto Switch)
  // Gunakan Math.abs() untuk menangani angka negatif jika ada
  if (Math.abs(cleanValue) >= 1000) {
    finalValue = cleanValue / 1000;
    unit = "MWh";
  }

  // 3. Format Angka (Indonesia)
  const formatted = finalValue.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2, // Maksimal 2 desimal sudah cukup rapi
  });

  return withUnit ? `${formatted} ${unit}` : formatted;
};
