"use client";

import React, { useMemo } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Users, Edit, CalendarDays, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/common/components/ui/card";
import { ReadingHistory } from "../services/reading.service";

export interface DailyPaxData {
  date: string;
  pax: number;
  paxId: number;
}

interface PaxDailyTableProps {
  data: ReadingHistory[];
  onEdit: (paxData: DailyPaxData) => void;
  onDelete: (paxData: DailyPaxData) => void;
}

export const PaxDailyTable: React.FC<PaxDailyTableProps> = ({
  data,
  onEdit,
  onDelete,
}) => {
  const dailyPaxData = useMemo<DailyPaxData[]>(() => {
    const paxByDate: {
      [key: string]: {
        totalPax: number;
        firstSessionId: number;
        paxId: number | null;
      };
    } = {};

    data.forEach((session) => {
      const dateStr = format(new Date(session.reading_date), "yyyy-MM-dd");
      if (!paxByDate[dateStr]) {
        paxByDate[dateStr] = {
          totalPax: 0,
          firstSessionId: session.session_id,
          paxId: null,
        };
      }

      if (session.paxData.pax !== null && session.paxData.pax_id !== null) {
        paxByDate[dateStr].totalPax = session.paxData.pax;
        paxByDate[dateStr].paxId = session.paxData.pax_id;
      }
    });

    return Object.entries(paxByDate)
      .map(([date, { totalPax, firstSessionId, paxId }]) => ({
        date,
        pax: totalPax,
        session_id: firstSessionId,
        paxId: paxId,
      }))
      .filter((item) => item.paxId !== null);
  }, [data]);

  if (dailyPaxData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" /> Ringkasan Pax Harian
        </CardTitle>
        <CardDescription>
          Tabel ini menampilkan total penumpang (Pax) per hari. Klik
          &apos;Edit&apos; untuk memperbarui jumlah Pax pada hari tersebut.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* PERBAIKAN: Mengganti placeholder dengan tabel data Pax yang fungsional */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Jumlah Pax</TableHead>
                <TableHead className="w-[100px] text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyPaxData.map((paxData) => (
                <TableRow key={paxData.date}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(paxData.date), "dd MMMM yyyy", {
                      locale: id,
                    })}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {new Intl.NumberFormat("id-ID").format(paxData.pax)}
                  </TableCell>
                  {/* PERUBAHAN: Menambahkan tombol Hapus di samping Edit */}
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(paxData)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onDelete(paxData)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
