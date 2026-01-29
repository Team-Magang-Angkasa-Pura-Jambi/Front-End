"use client";

import React, { useState } from "react";
import { DataEntryCard } from "./DataEntryCard";
import { DataEntryDialog } from "./DataEntryDialog";
import { getDialogDetails } from "./getDialogDetails";
import { cardData } from "../constant/cardData";
import { DialogType } from "../types";



export const Page = () => {
  const [openDialog, setOpenDialog] = useState<DialogType>(null);
  const [formData] = useState({});

  const isPending = false;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting data for:", openDialog, formData);

    setOpenDialog(null);
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Input Data Harian</h1>
        <p className="text-muted-foreground">
          Pilih kategori untuk memasukkan data harian Anda.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cardData.map((card) => (
          <DataEntryCard
            key={card.type}
            title={card.title}
            description={card.description}
            icon={card.icon}
            onClick={() => setOpenDialog(card.type as DialogType)}
          />
        ))}
      </div>

      <DataEntryDialog
        isOpen={!!openDialog}
        onClose={() => setOpenDialog(null)}
        details={getDialogDetails(openDialog)}
        onSubmit={handleFormSubmit}
        isSubmitting={isPending}
      />
    </div>
  );
};
