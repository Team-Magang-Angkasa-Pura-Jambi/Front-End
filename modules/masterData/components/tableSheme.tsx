"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createPriceSchemeColumns, PriceScheme } from "./price-scheme-config";
import { DataTable } from "./dataTable";
import { masterData } from "@/services/masterData.service";

export const PriceSchemeTable = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["priceSchemes"],
    queryFn: () => masterData.priceScheme,
  });

  const handleEdit = (scheme: PriceScheme) =>
    console.log("Edit scheme:", scheme);
  const handleDelete = (scheme: PriceScheme) =>
    console.log("Delete scheme:", scheme);

  const columns = useMemo(
    () => createPriceSchemeColumns(handleEdit, handleDelete),
    []
  );
  const tableData = data?.data || [];

  if (isError)
    return <p className="text-destructive">Gagal memuat data skema harga.</p>;

  return (
    <DataTable
      columns={columns}
      data={tableData}
      isLoading={isLoading}
      filterColumnId="scheme_name"
      filterPlaceholder="Cari nama skema..."
    />
  );
};
