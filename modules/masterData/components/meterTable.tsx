"use client";

import { useQuery } from "@tanstack/react-query";
import { Meter } from "../types";
import { createMeterColumns } from "./meter-config";
import { DataTable } from "./dataTable";
import { useMemo } from "react";
import { masterData } from "@/services/masterData.service";

export const MeterTable = () => {
  const {
    data: metersResponse, // Beri nama alias agar lebih jelas
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["meters"],
    // PERBAIKAN: Langsung teruskan referensi fungsinya, jangan dibungkus arrow function
    queryFn: () => masterData.meter,
  });
  console.log(metersResponse);

  const handleEdit = (meter: Meter) => {
    console.log("Edit meter:", meter);
    // Logika untuk membuka dialog edit
  };

  const handleDelete = (meter: Meter) => {
    console.log("Delete meter:", meter);
    // Logika untuk membuka dialog hapus
  };

  const columns = useMemo(
    () => createMeterColumns(handleEdit, handleDelete),
    []
  );

  // PERBAIKAN: Akses data dari hasil respons API yang benar
  const data = metersResponse?.data || [];

  if (isError) {
    return <p className="text-destructive">Gagal memuat data meter.</p>;
  }

  console.log(data);

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      filterColumnId="meter_code"
      filterPlaceholder="Cari berdasarkan kode meter..."
    />
  );
};
