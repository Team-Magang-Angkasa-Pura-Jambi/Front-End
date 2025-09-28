import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// import { InputData } from "./InputData";
import { DialogType } from "../types";
import { FormReadingElectric } from "./formElectricty";
import { FormReadingWater } from "./formWater";
import { FormReadingFuel } from "./formFuel";
import { FormReadingPax } from "./formPax";

export const getDialogDetails = (openDialog: DialogType) => {
  switch (openDialog) {
    case "Electricity":
      return {
        title: "Input Data Pemakaian Listrik",
        description: "Masukkan total pemakaian listrik (kWh) untuk hari ini.",
        form: <FormReadingElectric type_name="Electricity" />,
      };
    case "Water":
      return {
        title: "Input Data Pemakaian Air",
        description: "Masukkan total pemakaian air (m³) untuk hari ini.",
        form: <FormReadingWater type_name="water" />,
      };
    case "Fuel":
      return {
        title: "Input Data Pemakaian BBM Solar  ",
        description: "Masukkan total pemakaian dalam liter.",
        form: <FormReadingFuel type_name="Fuel" />,
      };
    case "Pax":
      return {
        title: "Input Data Penumpang (PAX)",
        description: "Masukkan jumlah penumpang keberangkatan dan kedatangan.",
        form: <FormReadingPax />,
      };
    case "Log":
      return {
        title: "Catat Aktivitas/Kejadian Penting",
        description:
          "Jelaskan secara singkat kejadian penting yang terjadi hari ini.",
        form: (
          <div className="grid gap-4 py-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="log-message">Deskripsi Kejadian</Label>
              <Textarea
                placeholder="Contoh: Terjadi pemadaman listrik dari PLN pukul 14:00 - 15:00."
                id="log-message"
              />
            </div>
          </div>
        ),
      };
    default:
      return null;
  }
};
