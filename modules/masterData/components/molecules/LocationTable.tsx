"use client";

import { Button } from "@/common/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { Location } from "@/common/types/location";
import { Edit2, MapPin, Trash2 } from "lucide-react";
import { TableSkeleton } from "./TableSkeleton";

interface LocationTableProps {
  data: Location[];
  isLoading: boolean;
  onEdit: (location: Location) => void;
  onDelete: (id: number) => void;
}

export const LocationTable = ({ data, isLoading, onEdit, onDelete }: LocationTableProps) => {
  if (isLoading) return <TableSkeleton />;

  return (
    <div className="bg-card rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-bold">Nama Area / Terminal</TableHead>
            <TableHead className="font-bold">Level</TableHead>
            <TableHead className="text-center font-bold">Status Hubungan</TableHead>
            <TableHead className="text-right font-bold">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground h-24 text-center italic">
                Belum ada data lokasi.
              </TableCell>
            </TableRow>
          ) : (
            data.map((loc) => (
              <TableRow key={loc.location_id} className="hover:bg-muted/30">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-primary h-4 w-4" />
                    {loc.name}
                  </div>
                </TableCell>
                <TableCell>
                  {loc.parent_id ? (
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 uppercase">
                      Sub-Area
                    </span>
                  ) : (
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-600 uppercase">
                      Main Area
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-center text-xs">
                  {loc.parent_id ? `ID Parent: ${loc.parent_id}` : "Lokasi Utama"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(loc)}
                      className="h-8 w-8 text-blue-500"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(loc.location_id)}
                      className="h-8 w-8 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
