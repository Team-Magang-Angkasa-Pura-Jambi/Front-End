"use client";

import React, { useState, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { startOfMonth } from "date-fns";
import { Card, CardContent } from "@/common/components/ui/card";
import { Loader2, ListFilter, AlertTriangle } from "lucide-react";
import { createColumns } from "./ColumnTable";
import { RecapHeader } from "./Header";
import { RecapTable } from "./Table";
import { ConsumpFilter } from "../types/recap.type";
import { getRecapDataApi } from "../services/recap.service";
import { motion, AnimatePresence } from "framer-motion";

export const Page = () => {
  const [filters, setFilters] = useState<ConsumpFilter>({
    type: "Electricity",
    date: { from: startOfMonth(new Date()), to: new Date() },
    sortBy: "",
    meterId: undefined,
  });

  const { type, date, sortBy, meterId } = filters;

  const formatToISO = (d: Date | undefined) => {
    if (!d) return new Date().toISOString();
    return new Date(
      Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
    ).toISOString();
  };

  const {
    data: queryData,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["recapData", type, date?.from, date?.to, sortBy, meterId],
    queryFn: () =>
      getRecapDataApi({
        type,
        startDate: formatToISO(date?.from),
        endDate: formatToISO(date?.to),
        meterId,
      }),
    enabled: !!date?.from && !!date?.to,

    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const columns = useMemo(
    () => createColumns(type, Number(meterId)),
    [meterId, type]
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <motion.div
          key="loading"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Card className="flex h-96 flex-col items-center justify-center border-dashed text-center">
            <CardContent className="p-6">
              <Loader2 className="text-primary/60 mx-auto h-12 w-12 animate-spin" />
              <h3 className="text-foreground mt-4 text-lg font-semibold">
                Menganalisis Data Beban...
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Kalkulasi besar sedang diproses di server.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    if (isError) {
      return (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-destructive/5 border-destructive/20 flex h-96 flex-col items-center justify-center text-center">
            <CardContent className="p-6">
              <AlertTriangle className="text-destructive mx-auto h-12 w-12" />
              <h3 className="text-destructive mt-4 text-lg font-semibold">
                Gagal Sinkronisasi Data
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Pastikan koneksi internet stabil atau hubungi admin.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    const hasNoData = !queryData?.data || queryData.data.length === 0;
    if (hasNoData && !isFetching) {
      return (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="flex h-96 flex-col items-center justify-center text-center">
            <CardContent className="p-6">
              <ListFilter className="text-muted-foreground/50 mx-auto h-12 w-12" />
              <h3 className="mt-4 text-lg font-semibold">
                Data Tidak Ditemukan
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Coba sesuaikan rentang tanggal atau pilih meteran lain.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="table"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <RecapTable
          columns={columns}
          data={queryData?.data || []}
          isLoading={isFetching}
          dataType={type}
          meta={queryData?.meta}
        />
      </motion.div>
    );
  };

  return (
    <div className="container mx-auto space-y-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <RecapHeader
          columns={columns}
          summary={queryData?.meta}
          filters={filters}
          setFilters={setFilters}
          isFetching={isFetching}
          dataToExport={queryData?.data || []}
        />
      </motion.div>
      <AnimatePresence mode="wait">
        <div className="transition-all duration-300">{renderContent()}</div>
      </AnimatePresence>
    </div>
  );
};
