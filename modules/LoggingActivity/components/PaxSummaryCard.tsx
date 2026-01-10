"use client";

import React, { useMemo } from "react";
import { Users, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { ReadingHistory } from "../services/reading.service";

interface PaxSummaryCardProps {
  data: ReadingHistory[];
  isLoading: boolean;
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("id-ID").format(value);
};

export const PaxSummaryCard: React.FC<PaxSummaryCardProps> = ({
  data,
  isLoading,
}) => {
  const totalPax = useMemo(() => {
    return data.reduce((sum, session) => sum + (session.paxData.pax || 0), 0);
  }, [data]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Pax</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <div className="text-2xl font-bold">{formatNumber(totalPax)}</div>
        )}
        <p className="text-xs text-muted-foreground">
          Total penumpang selama periode yang dipilih.
        </p>
      </CardContent>
    </Card>
  );
};
