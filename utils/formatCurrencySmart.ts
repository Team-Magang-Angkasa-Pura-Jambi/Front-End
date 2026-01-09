// utils/format.ts
export const formatCurrencySmart = (valueInMillions: number) => {
  // Input value sudah dalam jutaan (misal 10 = 10 Juta)
  // Jika >= 1000 Juta, berarti 1 Miliar
  if (valueInMillions >= 1000) {
    const inBillion = valueInMillions / 1000;
    return {
      val: inBillion.toLocaleString("id-ID", { maximumFractionDigits: 1 }),
      unit: "M",
      full: `Rp ${inBillion.toLocaleString("id-ID", {
        maximumFractionDigits: 1,
      })} M`,
    };
  }

  return {
    val: valueInMillions.toLocaleString("id-ID", { maximumFractionDigits: 1 }),
    unit: "jt",
    full: `Rp ${valueInMillions.toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} jt`,
  };
};

// Constants
