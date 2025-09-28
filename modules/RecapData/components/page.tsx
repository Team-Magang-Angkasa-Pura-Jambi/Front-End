"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ListFilter, AlertTriangle } from "lucide-react";

import { createColumns } from "./ColumnTable";
import { RecapHeader } from "./Header";
import { RecapTable } from "./Table";
import { getRecapDataApi } from "@/services/recap.service";

type DataType = "Electricity" | "Water" | "Fuel";

export const Page = () => {
  const [filters, setFilters] = useState<{
    type: DataType;
    date: DateRange | undefined;
    sortBy: "highest" | "lowest" | undefined;
  }>({
    type: "Electricity",
    date: { from: subDays(new Date(), 30), to: new Date() },
    sortBy: undefined,
  });

  const { type, date, sortBy } = filters;

  const {
    data: queryData,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["recapData", type, date, sortBy],
    queryFn: () =>
      getRecapDataApi({
        type,
        startDate: date!.from!.toISOString(),
        endDate: date!.to!.toISOString(),
        sortBy,
      }),

    enabled: !!date?.from && !!date?.to,
  });

  const columns = useMemo(() => createColumns(type), [type]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card className="flex flex-col items-center justify-center text-center h-96">
          <CardContent className="p-6">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Memuat Data...</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Mohon tunggu sebentar.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (isError) {
      return (
        <Card className="flex flex-col items-center justify-center text-center h-96 bg-destructive/10 border-destructive">
          <CardContent className="p-6">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="mt-4 text-lg font-semibold text-destructive">
              Gagal Mengambil Data
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Terjadi kesalahan pada server. Coba muat ulang halaman.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (!queryData?.data || queryData.data.length === 0) {
      return (
        <Card className="flex flex-col items-center justify-center text-center h-96">
          <CardContent className="p-6">
            <ListFilter className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Data Tidak Ditemukan</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tidak ada data yang cocok dengan filter yang Anda pilih. Coba ubah
              periode tanggal.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <RecapTable
        columns={columns}
        data={queryData.data}
        isLoading={isFetching}
        dataType={filters.type}
        meta={queryData.meta}
      />
    );
  };

  return (
    <div className="space-y-6">
      <RecapHeader
        columns={columns}
        summary={queryData?.meta}
        filters={filters}
        setFilters={setFilters}
        isFetching={isFetching}
        dataToExport={queryData?.data || []}
      />
      {renderContent()}
    </div>
  );
};
