import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { getEnergyTypesApi } from "@/modules/masterData/services/energyType.service";
import { getMetersApi } from "@/modules/masterData/services/meter.service";
import { getTrentConsumptionApi } from "../service/visualizations.service";

// Definisi tipe sederhana untuk struktur data chart
interface ChartDataPoint {
  name: string;
  pemakaian: number;
  prediksi: number;
  target: number;
}

export const useTrenConsump = () => {
  // --- 1. State Management ---
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  const [typeEnergy, setTypeEnergy] = useState<string>("");
  const [selectedMeterId, setSelectedMeterId] = useState<string>("");

  // --- 2. Options Generator (Months) ---
  const monthOptions = useMemo(() => {
    const options = [];
    // Clone date agar tidak memutasi object date utama jika dipakai di tempat lain
    const date = new Date();

    for (let i = 0; i < 6; i++) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const label = date.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
      options.push({ value: `${y}-${m}`, label });
      // Mundur 1 bulan
      date.setMonth(date.getMonth() - 1);
    }
    return options;
  }, []);

  // --- 3. Query: Energy Types ---
  const { data: energyTypesResponse, isLoading: isTypesLoading } = useQuery({
    queryKey: ["energyTypes"],
    queryFn: () => getEnergyTypesApi(),
    refetchOnWindowFocus: false,
  });

  const energyTypesData = useMemo(
    () => energyTypesResponse?.data || [],
    [energyTypesResponse]
  );

  // Auto-select Energy Type pertama
  useEffect(() => {
    if (energyTypesData.length > 0 && !typeEnergy) {
      setTypeEnergy(energyTypesData[0].type_name);
    }
  }, [energyTypesData, typeEnergy]);

  // --- 4. Query: Meters ---
  const { data: metersResponse, isLoading: isMetersLoading } = useQuery({
    queryKey: ["meters", typeEnergy],
    queryFn: () => getMetersApi(typeEnergy),
    enabled: !!typeEnergy,
  });

  const metersData = useMemo(
    () => metersResponse?.data || [],
    [metersResponse]
  );

  // Auto-select Meter ID (Logic diperbaiki agar lebih stabil)
  useEffect(() => {
    if (metersData.length > 0) {
      // Cek apakah meter yang sedang dipilih masih valid untuk tipe energi baru
      const isCurrentValid = metersData.some(
        (m) => String(m.meter_id) === selectedMeterId
      );

      // Jika belum ada yang dipilih ATAU yang dipilih tidak valid lagi -> Pilih yang pertama
      if (!selectedMeterId || !isCurrentValid) {
        setSelectedMeterId(String(metersData[0].meter_id));
      }
    } else {
      // Jika list meter kosong, reset selection
      setSelectedMeterId("");
    }
  }, [metersData, selectedMeterId]);

  // --- 5. Parsing Periode ---
  const { year, month } = useMemo(() => {
    if (!selectedPeriod) return { year: undefined, month: undefined };
    const [yStr, mStr] = selectedPeriod.split("-");
    return {
      year: parseInt(yStr),
      month: parseInt(mStr),
    };
  }, [selectedPeriod]);

  // --- 6. Query: Analysis Data ---
  const {
    data: analysisDataResponse,
    isLoading: isAnalysisLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["analysisData", typeEnergy, selectedPeriod, selectedMeterId],
    queryFn: () =>
      getTrentConsumptionApi(
        typeEnergy,
        year!,
        month!,
        Number(selectedMeterId)
      ),
    enabled:
      !!selectedMeterId &&
      year !== undefined &&
      month !== undefined &&
      !!typeEnergy,
    staleTime: 5 * 60 * 1000, // Cache data selama 5 menit
  });

  // --- 7. Data Formatting ---
  const chartData: ChartDataPoint[] = useMemo(() => {
    const rawData = analysisDataResponse?.data;
    if (!rawData || rawData.length === 0) return [];

    const meterTimeSeries = rawData[0].data;

    return meterTimeSeries.map((record) => ({
      name: new Date(record.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
      pemakaian: Number(record.actual_consumption ?? 0),
      prediksi: Number(record.prediction ?? 0),
      target: Number(record.efficiency_target ?? 0),
    }));
  }, [analysisDataResponse]);

  const volumeUnit = useMemo(() => {
    switch (typeEnergy) {
      case "Electricity":
        return "kWh";
      case "Water":
        return "m³";
      case "Fuel":
        return "L";
      default:
        return "Unit";
    }
  }, [typeEnergy]);

  // --- 8. Insights Logic (DIPERBAIKI) ---
  const insights = useMemo(() => {
    if (chartData.length === 0) {
      return {
        type: "info",
        title: "Tidak Ada Data",
        text: "Belum ada data konsumsi yang tercatat untuk periode dan meteran ini.",
      };
    }

    // Hitung total agregat
    let totalActual = 0;
    let totalTarget = 0;

    chartData.forEach((d) => {
      totalActual += d.pemakaian;
      totalTarget += d.target;
    });

    // Formatting angka untuk display
    const fmtActual = totalActual.toLocaleString("id-ID", {
      maximumFractionDigits: 0,
    });
    const fmtDiff = Math.abs(totalActual - totalTarget).toLocaleString(
      "id-ID",
      { maximumFractionDigits: 0 }
    );

    // Skenario 1: Belum ada target
    if (totalTarget === 0) {
      return {
        type: "info",
        title: "Target Belum Ditentukan",
        text: `Total konsumsi tercatat sebesar ${fmtActual} ${volumeUnit}. Target efisiensi belum diatur untuk periode ini.`,
      };
    }

    // Hitung persentase performa (Actual vs Target)
    const percentage = (totalActual / totalTarget) * 100;
    const isOver = totalActual > totalTarget;

    // Skenario 2: Efisien (Di bawah atau sama dengan target)
    if (!isOver) {
      const savingPercent = (100 - percentage).toFixed(1);
      return {
        type: "success",
        title: "Performa Efisien",
        text: `Konsumsi energi terkendali. Anda menghemat ${savingPercent}% (${fmtDiff} ${volumeUnit}) di bawah batas target.`,
      };
    }

    // Skenario 3: Warning (Sedikit di atas target - Toleransi misal 10%)
    if (isOver && percentage <= 110) {
      const overPercent = (percentage - 100).toFixed(1);
      return {
        type: "warning",
        title: "Peringatan Wajar",
        text: `Konsumsi sedikit melampaui target sebesar ${overPercent}% (${fmtDiff} ${volumeUnit}). Masih dalam batas toleransi operasional.`,
      };
    }

    // Skenario 4: Danger/Critical (Jauh di atas target)
    const overPercent = (percentage - 100).toFixed(1);
    return {
      type: "danger", // atau 'error' tergantung UI Library yang dipakai
      title: "Perhatian Diperlukan",
      text: `Konsumsi berlebih signifikan! Tercatat ${overPercent}% (${fmtDiff} ${volumeUnit}) di atas target. Disarankan evaluasi penggunaan alat berat/operasional.`,
    };
  }, [chartData, volumeUnit]);

  const isLoading = isTypesLoading || isMetersLoading || isAnalysisLoading;

  return {
    filters: {
      typeEnergy,
      setTypeEnergy,
      selectedMonth: selectedPeriod,
      setSelectedMonth: setSelectedPeriod,
      selectedMeterId,
      setSelectedMeterId,
    },
    options: {
      energyTypes: energyTypesData,
      meters: metersData,
      months: monthOptions,
      volumeUnit,
    },
    data: {
      chartData,
      insights, // Sekarang mengembalikan object { type, title, text }
    },
    status: {
      isLoading,
      isError,
      error,
    },
  };
};
