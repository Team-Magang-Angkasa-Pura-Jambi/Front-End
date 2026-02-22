"use client";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { Tenant } from "@/common/types/tenant";
import { Edit2, Phone, Trash2, User } from "lucide-react";
import { TableSkeleton } from "./TableSkeleton";

interface TenantTableProps {
  data: Tenant[];
  isLoading: boolean;
  onEdit: (tenant: Tenant) => void;
  onDelete: (id: number) => void;
}

export const TenantTable = ({ data, isLoading, onEdit, onDelete }: TenantTableProps) => {
  if (isLoading) return <TableSkeleton />;

  return (
    <div className="bg-card rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-bold">Nama Tenant</TableHead>
            <TableHead className="font-bold">Kategori</TableHead>
            <TableHead className="font-bold">Kontak</TableHead>
            <TableHead className="text-right font-bold">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground h-24 text-center italic">
                Belum ada data tenant.
              </TableCell>
            </TableRow>
          ) : (
            data.map((tenant) => (
              <TableRow key={tenant.tenant_id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{tenant.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    {tenant.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3 w-3" /> {tenant.contact_person}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Phone className="h-3 w-3" /> {tenant.phone}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(tenant)}
                      className="h-8 w-8 text-blue-500"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(tenant.tenant_id)}
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
