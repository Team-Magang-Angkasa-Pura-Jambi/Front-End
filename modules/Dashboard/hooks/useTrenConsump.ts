import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { getEnergyTypesApi } from "@/modules/masterData/services/energyType.service";
import { getMetersApi } from "@/modules/masterData/services/meter.service";
import { getTrentConsumptionApi } from "../service/visualizations.service";

interface ChartDataPoint {
  name: string;
  pemakaian: number;
  prediksi: number;
  target: number;
  // Tambahan Data Cost
  biayaAktual: number;
  biayaTarget: number;
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
    const date = new Date();
    for (let i = 0; i < 6; i++) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const label = date.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
      options.push({ value: `${y}-${m}`, label });
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

  useEffect(() => {
    if (metersData.length > 0) {
      const isCurrentValid = metersData.some(
        (m) => String(m.meter_id) === selectedMeterId
      );
      if (!selectedMeterId || !isCurrentValid) {
        setSelectedMeterId(String(metersData[0].meter_id));
      }
    } else {
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
    staleTime: 5 * 60 * 1000,
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
      // Mapping Data Biaya (Pastikan API mengirim field ini atau hitung manual)
      // Asumsi API punya field 'actual_cost' dan 'target_cost'
      // Jika tidak ada, Anda bisa kalikan dengan tarif per unit di sini
      biayaAktual: Number(record.consumption_cost ?? 0),
      biayaTarget: Number(record.efficiency_target_cost ?? 0),
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

  // --- 8a. Insights Logic (Volume/Fisik) ---
  const insights = useMemo(() => {
    if (chartData.length === 0) {
      return {
        type: "info",
        title: "Tidak Ada Data",
        text: "Belum ada data konsumsi.",
      };
    }

    let totalActual = 0;
    let totalTarget = 0;

    chartData.forEach((d) => {
      totalActual += d.pemakaian;
      totalTarget += d.target;
    });

    const fmtActual = totalActual.toLocaleString("id-ID", {
      maximumFractionDigits: 0,
    });
    const fmtDiff = Math.abs(totalActual - totalTarget).toLocaleString(
      "id-ID",
      { maximumFractionDigits: 0 }
    );

    if (totalTarget === 0) {
      return {
        type: "info",
        title: "Target Belum Ditentukan",
        text: `Total: ${fmtActual} ${volumeUnit}. Target belum diset.`,
      };
    }

    const percentage = (totalActual / totalTarget) * 100;
    const isOver = totalActual > totalTarget;

    if (!isOver) {
      const savingPercent = (100 - percentage).toFixed(1);
      return {
        type: "success",
        title: "Performa Efisien",
        text: `Hemat ${savingPercent}% (${fmtDiff} ${volumeUnit}) di bawah target.`,
      };
    }

    if (isOver && percentage <= 110) {
      const overPercent = (percentage - 100).toFixed(1);
      return {
        type: "warning",
        title: "Peringatan Wajar",
        text: `Lebih ${overPercent}% (${fmtDiff} ${volumeUnit}) di atas target.`,
      };
    }

    const overPercent = (percentage - 100).toFixed(1);
    return {
      type: "danger",
      title: "Boros Energi",
      text: `Over ${overPercent}% (${fmtDiff} ${volumeUnit}). Segera evaluasi.`,
    };
  }, [chartData, volumeUnit]);

  // --- 8b. Cost Insights Logic (UANG / ANGGARAN) ---
  const costInsights = useMemo(() => {
    if (chartData.length === 0) return null;

    let totalBiayaAktual = 0;
    let totalBiayaTarget = 0;

    chartData.forEach((d) => {
      totalBiayaAktual += d.biayaAktual;
      totalBiayaTarget += d.biayaTarget;
    });

    // Format Currency Rupiah
    const fmtRupiah = (val: number) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(val);

    const selisihBiaya = totalBiayaAktual - totalBiayaTarget;
    const fmtSelisih = fmtRupiah(Math.abs(selisihBiaya));

    // Logic Klasifikasi Budget
    if (totalBiayaTarget === 0) {
      return {
        type: "neutral",
        title: "Realisasi Biaya",
        text: `Total biaya bulan ini: ${fmtRupiah(totalBiayaAktual)}. Anggaran belum ditetapkan.`,
        amount: totalBiayaAktual,
      };
    }

    const percentageCost = (totalBiayaAktual / totalBiayaTarget) * 100;
    const isOverBudget = totalBiayaAktual > totalBiayaTarget;

    if (isOverBudget) {
      const percentOver = (percentageCost - 100).toFixed(1);
      return {
        type: "over_budget", // Flag merah untuk UI
        title: "Melebihi Anggaran",
        text: `Biaya operasional bengkak ${fmtSelisih} (${percentOver}%) dari anggaran.`,
        overAmount: selisihBiaya,
        percentOver: Number(percentOver),
      };
    } else {
      const percentSave = (100 - percentageCost).toFixed(1);
      return {
        type: "under_budget", // Flag hijau untuk UI
        title: "Hemat Anggaran",
        text: `Efisiensi biaya sebesar ${fmtSelisih} (${percentSave}%) di bawah anggaran.`,
        savedAmount: Math.abs(selisihBiaya),
        percentSaved: Number(percentSave),
      };
    }
  }, [chartData]);

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
      insights, // Insight Volume (Fisik)
      costInsights, // Insight Biaya (Rupiah) <-- Baru
    },
    status: {
      isLoading,
      isError,
      error,
    },
  };
};
