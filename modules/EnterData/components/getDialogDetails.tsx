import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InputData } from "./InputData";
import { DialogType } from "../types/inde";

export const getDialogDetails = (openDialog: DialogType) => {
  switch (openDialog) {
    case "listrik":
      return {
        title: "Input Data Pemakaian Listrik",
        description: "Masukkan total pemakaian listrik (kWh) untuk hari ini.",
        form: (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pemakaian-kwh" className="text-right">
                Pemakaian (kWh)
              </Label>
              <InputData digits={7} />
            </div>
          </div>
        ),
      };
    case "air":
      return {
        title: "Input Data Pemakaian Air",
        description: "Masukkan total pemakaian air (m³) untuk hari ini.",
        form: (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pemakaian-air" className="text-right">
                Pemakaian (m³)
              </Label>
              <InputData digits={5} />
            </div>
          </div>
        ),
      };
    case "bbm":
      return {
        title: "Input Data Pemakaian BBM Solar  ",
        description: "Masukkan total pemakaian dalam liter.",
        form: (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pemakaian-liter" className="text-right">
                Pemakaian (Liter)
              </Label>
              <InputData digits={5} />
            </div>
          </div>
        ),
      };
    case "pax":
      return {
        title: "Input Data Penumpang (PAX)",
        description: "Masukkan jumlah penumpang keberangkatan dan kedatangan.",
        form: (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pax-datang" className="text-right">
                Kedatangan
              </Label>
              <InputData digits={5} />
            </div>
          </div>
        ),
      };
    case "log":
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
