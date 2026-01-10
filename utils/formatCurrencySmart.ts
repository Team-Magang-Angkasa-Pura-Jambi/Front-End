export const formatCurrencySmart = (rawValue: number) => {
  const absValue = Math.abs(rawValue);

  if (absValue >= 1_000_000_000) {
    const inBillion = rawValue / 1_000_000_000;
    return {
      val: Math.abs(inBillion).toLocaleString("id-ID", {
        maximumFractionDigits: 2,
      }),
      unit: "M",
      full: `Rp ${inBillion.toLocaleString("id-ID", {
        maximumFractionDigits: 2,
      })} M`,
    };
  }

  if (absValue >= 1_000_000) {
    const inMillion = rawValue / 1_000_000;
    return {
      val: Math.abs(inMillion).toLocaleString("id-ID", {
        maximumFractionDigits: 1,
      }),
      unit: "Jt",
      full: `Rp ${inMillion.toLocaleString("id-ID", {
        maximumFractionDigits: 1,
      })} Jt`,
    };
  }

  if (absValue >= 1_000) {
    const inThousand = rawValue / 1_000;
    return {
      val: Math.abs(inThousand).toLocaleString("id-ID", {
        maximumFractionDigits: 0,
      }),
      unit: "Rb",
      full: `Rp ${inThousand.toLocaleString("id-ID", {
        maximumFractionDigits: 0,
      })} Rb`,
    };
  }

  return {
    val: Math.abs(rawValue).toLocaleString("id-ID"),
    unit: "",
    full: `Rp ${rawValue.toLocaleString("id-ID")}`,
  };
};
