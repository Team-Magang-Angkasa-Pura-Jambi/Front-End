import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDailyAveragePaxApi } from "../service/visualizations.service";

export const useDailyAveragePax = () => {
  const [year, setYear] = useState<string>(() =>
    new Date().getFullYear().toString()
  );

  const [month, setMonth] = useState<string>(() =>
    (new Date().getMonth() + 1).toString()
  );

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      {
        value: (currentYear - 1).toString(),
        label: (currentYear - 1).toString(),
      },
      { value: currentYear.toString(), label: currentYear.toString() },
      {
        value: (currentYear + 1).toString(),
        label: (currentYear + 1).toString(),
      },
    ];
  }, []);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const date = new Date(2000, i, 1);
      return {
        value: m.toString(),
        label: date.toLocaleDateString("id-ID", { month: "long" }),
      };
    });
  }, []);

  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["daily-average-pax", year, month],
    queryFn: () => getDailyAveragePaxApi(parseInt(year), parseInt(month)),

    placeholderData: (previousData) => previousData,
  });

  const chartData = useMemo(() => {
    return apiResponse?.data || [];
  }, [apiResponse]);

  return {
    filters: {
      year,
      setYear,
      month,
      setMonth,
    },

    options: {
      years: yearOptions,
      months: monthOptions,
    },

    data: chartData,

    status: {
      isLoading,
      isFetching,
      isError,
      error,
    },
  };
};
