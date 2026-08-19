"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarDays, Edit, Trash2, Users } from "lucide-react";
import React from "react";

import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";

// 1. Sesuaikan interface dengan response JSON dari API
export interface DailyPaxData {
  pax_id: number;
  date: string | Date; // API mengirimkan ISO string
  pax_count: number;
  location_id: number | null;
  session_id: number | null;
  created_at: string | Date;
}

interface PaxDailyTableProps {
  data: DailyPaxData[]; // Langsung menerima array data Pax
  onEdit: (paxData: DailyPaxData) => void;
  onDelete: (paxData: DailyPaxData) => void;
}

export const PaxDailyTable: React.FC<PaxDailyTableProps> = ({ data, onEdit, onDelete }) => {
  // Jika tidak ada data, jangan render tabelnya
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" /> Ringkasan Pax Harian
        </CardTitle>
        <CardDescription>
          Tabel ini menampilkan total penumpang (Pax) per hari. Klik ikon edit untuk memperbarui
          jumlah Pax atau ikon hapus untuk menghapus data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Jumlah Pax</TableHead>
                <TableHead className="w-[120px] text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                // Gunakan pax_id sebagai key karena ini adalah primary key yang unik
                <TableRow key={row.pax_id}>
                  <TableCell className="flex items-center gap-2 font-medium">
                    <CalendarDays className="text-muted-foreground h-4 w-4" />
                    {format(new Date(row.date), "dd MMMM yyyy", {
                      locale: id,
                    })}
                  </TableCell>

                  <TableCell className="text-right font-mono text-base">
                    {new Intl.NumberFormat("id-ID").format(row.pax_count)}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover:text-primary h-8 w-8"
                        onClick={() => onEdit(row)} // Passing seluruh object row ke onEdit
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        // PERBAIKAN BUG: Gunakan onDelete, bukan onEdit
                        onClick={() => onDelete(row)}
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
