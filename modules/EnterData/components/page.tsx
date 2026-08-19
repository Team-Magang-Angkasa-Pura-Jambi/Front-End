"use client";

import { getEnergyTypesApi } from "@/modules/masterData/services/energyType.service";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { cardData } from "../constant/cardData";
import { DialogType } from "../types";
import { DataEntryCard } from "./DataEntryCard";
import { DataEntryDialog } from "./DataEntryDialog";
import { getDialogDetails } from "./getDialogDetails";

export const DataEntryPage = () => {
  const [openDialog, setOpenDialog] = useState<DialogType>(null);

  const { data: energyRes, isLoading } = useQuery({
    queryKey: ["master", "energy-types-list"],
    queryFn: () => getEnergyTypesApi(),
    staleTime: Infinity,
  });

  const dynamicCards = useMemo(() => {
    const apiEnergies = energyRes?.data || [];

    return cardData.map((card) => {
      const match = apiEnergies.find((e) => e.name.toLowerCase() === card.type.toLowerCase());

      return {
        ...card,
        energy_id: match?.energy_type_id,

        isReady: match || card.type === "Pax" || card.type === "Log",
      };
    });
  }, [energyRes]);

  return (
    <div className="space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight">Input Data Harian</h1>
        <p className="text-muted-foreground text-sm">
          Pilih kategori untuk mencatat pemakaian terbaru.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dynamicCards.map((card) => (
          <DataEntryCard
            key={card.type}
            title={card.title}
            description={card.description}
            icon={card.icon}
            disabled={isLoading || !card.isReady}
            onClick={() => setOpenDialog(card.type as DialogType)}
          />
        ))}
      </div>

      <DataEntryDialog
        isOpen={!!openDialog}
        onClose={() => setOpenDialog(null)}
        details={getDialogDetails(openDialog, energyRes?.data, () => setOpenDialog(null))}
      />
    </div>
  );
};
