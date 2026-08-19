import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { useEnergyQuery } from "@/modules/masterData/hooks/useEnergyQuery";
import { useMeterQuery } from "@/modules/masterData/hooks/useMeterQuery";
import { getTrentConsumptionApi } from "../service/visualizations.service";

interface ChartDataPoint {
  name: string;
  pemakaian: number;
  prediksi: number;
  target: number;
  biayaAktual: number;
  biayaTarget: number;
}

interface EnergyMaster {
  energy_type_id: number;
  name?: string;
  type_name?: string;
  unit_standard?: string;
}

interface MeterMaster {
  meter_id: number;
  meter_code: string;
  energy_type_id: number;
}

export const useTrenConsump = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  const [energyId, setEnergyId] = useState<number | null>(null);
  const [selectedMeterId, setSelectedMeterId] = useState<string>("");

  const { useGetEnergies } = useEnergyQuery();
  const { data: energyTypesResponse, isLoading: isTypesLoading } = useGetEnergies();

  const energyTypesData: EnergyMaster[] = useMemo(() => {
    const rawData = energyTypesResponse?.data || [];
    // Filter keluar tipe energi yang bernama "Fuel" atau "BBM"
    return rawData.filter((energy: EnergyMaster) => {
      const name = (energy.name || energy.type_name || "").toLowerCase();
      return name !== "fuel" && name !== "bbm";
    });
  }, [energyTypesResponse]);

  // Default energyId ke index 0 (sekarang dijamin bukan BBM)
  useEffect(() => {
    if (energyTypesData.length > 0 && energyId === null) {
      setEnergyId(energyTypesData[0].energy_type_id);
    }
  }, [energyTypesData, energyId]);

  const { useGetMeters } = useMeterQuery();
  const { data: metersResponse, isLoading: isMetersLoading } = useGetMeters();

  const metersData: MeterMaster[] = useMemo(() => {
    if (energyId === null || !metersResponse?.data) return [];

    let allMeters: MeterMaster[] = [];

    if ("meter" in metersResponse.data && Array.isArray(metersResponse.data.meter)) {
      allMeters = metersResponse.data.meter as MeterMaster[];
    } else if (Array.isArray(metersResponse.data)) {
      allMeters = metersResponse.data as MeterMaster[];
    }

    return allMeters.filter((m) => m.energy_type_id === energyId);
  }, [metersResponse, energyId]);
  useEffect(() => {
    if (metersData.length > 0) {
      const isCurrentValid = metersData.some((m) => String(m.meter_id) === selectedMeterId);
      if (!selectedMeterId || !isCurrentValid) {
        setSelectedMeterId(String(metersData[0].meter_id));
      }
    } else {
      setSelectedMeterId("");
    }
  }, [metersData, selectedMeterId]);

  const { year, month } = useMemo(() => {
    if (!selectedPeriod) return { year: undefined, month: undefined };
    const [yStr, mStr] = selectedPeriod.split("-");
    return { year: parseInt(yStr), month: parseInt(mStr) };
  }, [selectedPeriod]);

  const {
    data: analysisDataResponse,
    isLoading: isAnalysisLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["analysisData", energyId, selectedPeriod, selectedMeterId],

    queryFn: () =>
      getTrentConsumptionApi(energyId as number, year!, month!, Number(selectedMeterId)),
    enabled: !!selectedMeterId && year !== undefined && month !== undefined && energyId !== null,
    staleTime: 5 * 60 * 1000,
  });

  const chartData: ChartDataPoint[] = useMemo(() => {
    const rawData = analysisDataResponse?.data;

    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) return [];

    const meterTimeSeries = rawData[0]?.data;

    if (!meterTimeSeries || !Array.isArray(meterTimeSeries)) return [];

    return meterTimeSeries.map((record: any) => ({
      name: new Date(record.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
      pemakaian: Number(record.actual_consumption ?? 0),
      prediksi: Number(record.prediction ?? 0),
      target: Number(record.efficiency_target ?? 0),
      biayaAktual: Number(record.consumption_cost ?? 0),
      biayaTarget: Number(record.efficiency_target_cost ?? 0),
    }));
  }, [analysisDataResponse]);

  const volumeUnit = useMemo(() => {
    if (energyId === null || energyTypesData.length === 0) return "Unit";
    const selected = energyTypesData.find((e) => e.energy_type_id === energyId);
    return selected?.unit_standard || "Unit";
  }, [energyId, energyTypesData]);

  const monthOptions = useMemo(() => {
    const options = [];
    const date = new Date();
    for (let i = 0; i < 6; i++) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const label = date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
      options.push({ value: `${y}-${m}`, label });
      date.setMonth(date.getMonth() - 1);
    }
    return options;
  }, []);

  const insights = useMemo(() => {
    if (chartData.length === 0) {
      return { type: "info", title: "Tidak Ada Data", text: "Belum ada data konsumsi." };
    }

    let totalActual = 0,
      totalTarget = 0;
    chartData.forEach((d) => {
      totalActual += d.pemakaian;
      totalTarget += d.target;
    });

    const fmtActual = totalActual.toLocaleString("id-ID", { maximumFractionDigits: 0 });
    const fmtDiff = Math.abs(totalActual - totalTarget).toLocaleString("id-ID", {
      maximumFractionDigits: 0,
    });

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
      return {
        type: "success",
        title: "Performa Efisien",
        text: `Hemat ${(100 - percentage).toFixed(1)}% (${fmtDiff} ${volumeUnit}) di bawah target.`,
      };
    }

    if (isOver && percentage <= 110) {
      return {
        type: "warning",
        title: "Peringatan Wajar",
        text: `Lebih ${(percentage - 100).toFixed(1)}% (${fmtDiff} ${volumeUnit}) di atas target.`,
      };
    }

    return {
      type: "danger",
      title: "Boros Energi",
      text: `Over ${(percentage - 100).toFixed(1)}% (${fmtDiff} ${volumeUnit}). Segera evaluasi.`,
    };
  }, [chartData, volumeUnit]);

  const costInsights = useMemo(() => {
    if (chartData.length === 0) return null;

    let totalBiayaAktual = 0,
      totalBiayaTarget = 0;
    chartData.forEach((d) => {
      totalBiayaAktual += d.biayaAktual;
      totalBiayaTarget += d.biayaTarget;
    });

    const fmtRupiah = (val: number) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(val);
    const selisihBiaya = totalBiayaAktual - totalBiayaTarget;
    const fmtSelisih = fmtRupiah(Math.abs(selisihBiaya));

    if (totalBiayaTarget === 0) {
      return {
        type: "neutral",
        title: "Realisasi Biaya",
        text: `Total biaya bulan ini: ${fmtRupiah(totalBiayaAktual)}. Anggaran belum ditetapkan.`,
      };
    }

    const percentageCost = (totalBiayaAktual / totalBiayaTarget) * 100;
    const isOverBudget = totalBiayaAktual > totalBiayaTarget;

    if (isOverBudget) {
      return {
        type: "over_budget",
        title: "Melebihi Anggaran",
        text: `Biaya operasional bengkak ${fmtSelisih} (${(percentageCost - 100).toFixed(1)}%) dari anggaran.`,
      };
    }
    return {
      type: "under_budget",
      title: "Hemat Anggaran",
      text: `Efisiensi biaya sebesar ${fmtSelisih} (${(100 - percentageCost).toFixed(1)}%) di bawah anggaran.`,
    };
  }, [chartData]);

  const isLoading = isTypesLoading || isMetersLoading || isAnalysisLoading;

  return {
    filters: {
      energyId,
      setEnergyId,
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
      insights,
      costInsights,
    },
    status: {
      isLoading,
      isError,
      error,
    },
  };
};
