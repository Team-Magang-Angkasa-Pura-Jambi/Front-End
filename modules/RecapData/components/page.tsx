"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { startOfMonth } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ListFilter, AlertTriangle } from "lucide-react";

import { createColumns } from "./ColumnTable";
import { RecapHeader } from "./Header";
import { RecapTable } from "../components/Table";
import { getRecapDataApi } from "@/services/recap.service";
import { RecapMeta } from "../type"; // Import RecapMeta

type DataType = "Electricity" | "Water" | "Fuel";

export const Page = () => {
  const [filters, setFilters] = useState<{
    type: DataType;
    date: DateRange | undefined;
    sortBy: "highest" | "lowest" | undefined; // Disesuaikan dengan opsi di Header
    meterId: number | undefined;
  }>({
    type: "Electricity",
    date: { from: startOfMonth(new Date()), to: new Date() },
    sortBy: "date", // Memberikan nilai default
    meterId: undefined,
  });

  // DIUBAH: 'meterId' sekarang di-destructure agar bisa digunakan
  const { type, date, sortBy, meterId } = filters;

  const {
    data: queryData,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    // DIUBAH: 'meterId' ditambahkan ke queryKey agar query menjadi reaktif
    queryKey: ["recapData", type, date, sortBy, meterId],
    queryFn: () =>
      getRecapDataApi({
        type,
        // Non-null assertion (!) aman di sini karena ada `enabled`
        startDate: date?.from
          ? new Date(
              Date.UTC(
                date.from.getFullYear(),
                date.from.getMonth(),
                date.from.getDate()
              )
            ).toISOString()
          : new Date().toISOString(),
        endDate: date?.from
          ? new Date(
              Date.UTC(
                date.to.getFullYear(),
                date.to.getMonth(),
                date.to.getDate()
              )
            ).toISOString()
          : new Date().toISOString(),
        sortBy,
        meterId,
      }),
    // Query hanya akan berjalan jika tanggal sudah terisi
    enabled: !!date?.from && !!date?.to,
    // Mencegah query berjalan otomatis saat window/tab kembali fokus
    refetchOnWindowFocus: false,
  });

  const columns = useMemo(() => createColumns(type, meterId), [meterId, type]);

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

    if (!queryData?.data?.data || queryData.data.data.length === 0) {
      return (
        <Card className="flex flex-col items-center justify-center text-center h-96">
          <CardContent className="p-6">
            <ListFilter className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Data Tidak Ditemukan</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tidak ada data yang cocok dengan filter yang Anda pilih.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <RecapTable
        columns={columns}
        data={queryData.data.data}
        isLoading={isFetching}
        dataType={filters.type}
        meta={queryData.data.meta}
      />
    );
  };

  return (
    <div className="space-y-6">
      <RecapHeader
        columns={columns}
        summary={queryData?.data?.meta} // Cast to RecapMeta
        filters={filters}
        setFilters={setFilters}
        isFetching={isFetching}
        dataToExport={queryData?.data?.data || []}
      />
      {renderContent()}
    </div>
  );
};
