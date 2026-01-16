import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { getEnergyTypesApi } from "@/modules/masterData/services/energyType.service";
import { getMetersApi } from "@/modules/masterData/services/meter.service";
import { getTrentConsumptionApi } from "../service/visualizations.service";

export const useTrenConsump = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  const [typeEnergy, setTypeEnergy] = useState<string>("");

  const [selectedMeterId, setSelectedMeterId] = useState<string>("");

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

  const { year, month } = useMemo(() => {
    if (!selectedPeriod) return { year: undefined, month: undefined };
    const [yStr, mStr] = selectedPeriod.split("-");
    return {
      year: parseInt(yStr),
      month: parseInt(mStr),
    };
  }, [selectedPeriod]);

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
  });

  const chartData = useMemo(() => {
    const rawData = analysisDataResponse?.data;
    if (!rawData || rawData.length === 0) return [];

    const meterTimeSeries = rawData[0].data;

    return meterTimeSeries.map((record) => ({
      name: new Date(record.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
      pemakaian: record.actual_consumption ?? 0,
      prediksi: record.prediction ?? 0,
      target: record.efficiency_target ?? 0,
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

  const insights = useMemo(() => {
    if (chartData.length === 0) return null;

    let totalActual = 0;
    let totalTarget = 0;
    let totalPrediction = 0;
    let daysOverTarget = 0;

    chartData.forEach((d) => {
      totalActual += d.pemakaian;
      totalTarget += d.target;
      totalPrediction += d.prediksi;
      if (d.pemakaian > d.target) daysOverTarget++;
    });

    const dataCount = chartData.length;
    const lastData = chartData[dataCount - 1];

    if (totalActual === 0) {
      return {
        type: "success",
        text: "Belum ada aktivitas konsumsi energi yang tercatat pada periode ini.",
      };
    }

    if (totalActual > totalTarget) {
      const overPercentage = ((totalActual - totalTarget) / totalTarget) * 100;
      return {
        type: "warning",
        text: `PERHATIAN: Total konsumsi bulan ini telah melampaui target sebesar ${overPercentage.toFixed(
          1
        )}%. Segera lakukan evaluasi operasional untuk mencegah pembengkakan biaya.`,
      };
    }

    const deviation = lastData.pemakaian - lastData.prediksi;
    const deviationPercent =
      lastData.prediksi > 0 ? (deviation / lastData.prediksi) * 100 : 0;

    if (deviationPercent > 20) {
      return {
        type: "warning",
        text: `ANOMALI TERDETEKSI: Konsumsi hari terakhir ${deviationPercent.toFixed(
          0
        )}% lebih tinggi dari prediksi AI. Kemungkinan ada kebocoran atau alat yang tidak dimatikan.`,
      };
    }

    if (daysOverTarget > dataCount / 2) {
      return {
        type: "warning",
        text: `POLA KONSUMSI BURUK: ${daysOverTarget} dari ${dataCount} hari tercatat melebihi target harian. Diperlukan penyesuaian perilaku penggunaan energi.`,
      };
    }

    const efficiency =
      totalTarget > 0
        ? (((totalTarget - totalActual) / totalTarget) * 100).toFixed(1)
        : "0";

    return {
      type: "success",
      text: `PERFORMA BAGUS: Efisiensi energi terjaga dengan penghematan kumulatif sebesar ${efficiency}% (${(
        totalTarget - totalActual
      ).toFixed(0)} ${volumeUnit}) dibandingkan target.`,
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
      insights,
    },
    status: {
      isLoading,
      isError,
      error,
    },
  };
};
