export const formatCurrencySmart = (rawValue: number | string) => {
  // 1. Pastikan input dikonversi jadi number yang bersih
  // Mengubah string "20000000" jadi number, atau menangani undefined
  const value = Number(rawValue);

  if (isNaN(value)) {
    return { val: "0", unit: "", full: "Rp 0" };
  }

  const absValue = Math.abs(value);

  // BLOCK MILIAR (M)
  if (absValue >= 1_000_000_000) {
    const inBillion = value / 1_000_000_000;
    const formatted = inBillion.toLocaleString("id-ID", {
      maximumFractionDigits: 2,
    });
    return {
      val: formatted,
      unit: "M",
      full: `Rp ${formatted} M`,
    };
  }

  // BLOCK JUTA (Jt)
  if (absValue >= 1_000_000) {
    const inMillion = value / 1_000_000;
    const formatted = inMillion.toLocaleString("id-ID", {
      maximumFractionDigits: 1, // Contoh: 20,5 Jt
    });
    return {
      val: formatted,
      unit: "Jt",
      full: `Rp ${formatted} Jt`,
    };
  }

  // BLOCK RIBU (Rb)
  if (absValue >= 1_000) {
    const inThousand = value / 1_000;
    const formatted = inThousand.toLocaleString("id-ID", {
      maximumFractionDigits: 0, // Biasanya ribu tidak butuh koma (20 Rb, bukan 20,5 Rb)
    });
    return {
      val: formatted,
      unit: "Rb",
      full: `Rp ${formatted} Rb`,
    };
  }

  // BLOCK DI BAWAH 1000
  // Unit "k" biasanya tidak umum untuk Rupiah satuan kecil,
  // lebih baik dikosongkan atau biarkan polos.
  const formatted = value.toLocaleString("id-ID");
  return {
    val: formatted,
    unit: "", // Kosongkan unit jika < 1000
    full: `Rp ${formatted}`,
  };
};
