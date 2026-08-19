"use client";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { Skeleton } from "@/common/components/ui/skeleton";
import { MeterType } from "@/common/types/meters";
import { motion } from "framer-motion";
import { Edit, Eye, MapPin, MoreVertical, Trash, Zap } from "lucide-react";
import { useMeter } from "../../context/MeterContext";
import { MeterStatusBadge } from "./meterStatusBadge";

export const MetersCard = ({ meter }: { meter: MeterType }) => {
  const { handleOpenDetail, handleOpenEdit, handleOpenDelete } = useMeter();

  // Guard Clause: Jika data meter rusak parah
  if (!meter) return <Skeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -5 }}
    >
      <Card className="group hover:border-primary/50 relative flex h-full flex-col justify-between overflow-hidden border transition-all duration-300 hover:shadow-xl">
        <div className="bg-primary/5 absolute -top-12 -right-12 h-32 w-32 rounded-full transition-all duration-500 group-hover:scale-150" />

        <CardHeader className="relative z-10 px-6 pt-6 pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5 pr-2">
              <CardTitle
                className="group-hover:text-primary line-clamp-2 text-lg leading-tight font-semibold transition-colors"
                title={meter.name ?? meter.meter_code}
              >
                {/* Gunakan Optional Chaining dan Fallback */}
                {meter.name || "Meter Tanpa Nama"}
              </CardTitle>
              <div className="flex items-center gap-2">
                <code className="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary rounded px-1.5 py-0.5 font-mono text-[11px] transition-colors">
                  {meter?.meter_code || "NO-CODE"}
                </code>
                {meter.is_virtual && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px] font-normal">
                    Virtual
                  </Badge>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground -mt-2 -mr-2 h-8 w-8"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => handleOpenDetail(meter.meter_id)}>
                  <Eye className="mr-2 h-4 w-4" /> Detail
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleOpenEdit(meter.meter_id)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-50 focus:text-red-600"
                  onClick={() => handleOpenDelete(meter.meter_id)}
                >
                  <Trash className="mr-2 h-4 w-4" /> Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 px-6 pt-2 pb-6">
          <div className="space-y-4">
            {/* Info Energi - Gunakan optional chaining untuk relasi */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                <Zap className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-[10px] font-bold uppercase">
                  Energi
                </span>
                <span className="text-foreground font-medium">
                  {meter.energy_type?.name || "Kategori N/A"}
                </span>
              </div>
            </div>

            {/* Info Lokasi - Gunakan optional chaining untuk relasi */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-[10px] font-bold uppercase">
                  Lokasi
                </span>
                <span
                  className="text-foreground max-w-[150px] truncate font-medium"
                  title={meter.location?.name || "Lokasi Belum Diatur"}
                >
                  {meter.location?.name || "Lokasi Belum Diatur"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/5 group-hover:bg-muted/10 relative z-10 flex items-center justify-between border-t px-6 py-3 transition-colors">
          {/* Status Badge dengan Fallback */}
          <MeterStatusBadge status={meter.status || "UNKNOWN"} />
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:bg-primary hover:text-primary-foreground h-8 px-2 text-xs font-medium transition-all"
            onClick={() => handleOpenDetail(meter.meter_id)}
          >
            Detail{" "}
            <Eye className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
