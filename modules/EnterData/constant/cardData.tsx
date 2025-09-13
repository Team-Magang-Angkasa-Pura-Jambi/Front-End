import { BookText, Droplet, Fuel, Users, Zap } from "lucide-react";

export const cardData = [
    {
      type: "listrik",
      title: "Listrik",
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      description: "Catat pemakaian listrik harian dalam satuan kWh.",
    },
    {
      type: "air",
      title: "Air",
      icon: <Droplet className="h-8 w-8 text-blue-500" />,
      description: "Catat pemakaian air bersih harian dalam satuan m³.",
    },
    {
      type: "bbm",
      title: "BBM",
      icon: <Fuel className="h-8 w-8 text-orange-500" />,
      description: "Catat pemakaian bahan bakar (solar, pertalite, dll).",
    },
    {
      type: "pax",
      title: "Data PAX",
      icon: <Users className="h-8 w-8 text-green-500" />,
      description: "Catat jumlah penumpang (PAX) keberangkatan & kedatangan.",
    },
    {
      type: "log",
      title: "Log Activity",
      icon: <BookText className="h-8 w-8 text-slate-500" />,
      description:
        "Catat kejadian atau aktivitas penting yang terjadi hari ini.",
    },
  ];