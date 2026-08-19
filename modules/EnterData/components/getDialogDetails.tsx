import { EnergyType } from "@/common/types/energy";
import { DialogType } from "../types";
import { BaseEnergyReadingForm } from "./BaseEnergyReadingForm";
import { FormReadingPax } from "./formPax";

export const getDialogDetails = (
  openDialog: DialogType,
  energyData: EnergyType[] | undefined,
  onSuccess?: () => void
) => {
  if (!openDialog) return null;

  // Helper untuk cari ID berdasarkan nama
  const findId = (name: string) =>
    energyData?.find((e) => e.name.toLowerCase() === name.toLowerCase())?.energy_type_id;

  // Logika mapping dialog ke form
  const configs: Record<string, any> = {
    Electricity: {
      title: "⚡ Data Listrik",
      description: "Catat angka meteran listrik harian.",
      id: findId("Electricity"),
    },
    Water: {
      title: "💧 Data Air",
      description: "Catat angka pembacaan meter air.",
      id: findId("Water"),
    },
    Fuel: {
      title: "⛽ Data BBM",
      description: "Catat angka pembacaan meter BBM.",
      id: findId("Fuel"),
    },
  };

  // Jika yang dipilih adalah kategori energi (Electricity/Water/Fuel)
  if (configs[openDialog]) {
    const config = configs[openDialog];
    return {
      title: config.title,
      description: config.description,
      form: config.id ? (
        <BaseEnergyReadingForm energy_type_id={config.id} onSuccess={onSuccess} />
      ) : (
        <p className="p-4 text-center text-sm italic">ID Energi tidak ditemukan di database...</p>
      ),
    };
  }

  // Handle tipe non-energi (Pax, Log, dll)
  if (openDialog === "Pax") {
    return {
      title: "✈️ Data Penumpang",
      description: "Masukkan jumlah kedatangan dan keberangkatan.",
      form: <FormReadingPax onSuccess={onSuccess} />,
    };
  }

  return null;
};
