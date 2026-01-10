import {
  IconAlertTriangle,
  IconBell,
  IconCircleCheck,
} from "@tabler/icons-react";

export const CHART_COLORS = {
  initial: "#3b82f6",
  remaining: "#10b981",
  expense: "#f43f5e",
  line: "#10b981",
};

export const MONTH_CONFIG = [
  { value: "1", label: "Januari", shortCut: "Jan" },
  { value: "2", label: "Februari", shortCut: "Feb" },
  { value: "3", label: "Maret", shortCut: "Mar" },
  { value: "4", label: "April", shortCut: "Apr" },
  { value: "5", label: "Mei", shortCut: "Mei" },
  { value: "6", label: "Juni", shortCut: "Jun" },
  { value: "7", label: "Juli", shortCut: "Jul" },
  { value: "8", label: "Agustus", shortCut: "Agu" },
  { value: "9", label: "September", shortCut: "Sep" },
  { value: "10", label: "Oktober", shortCut: "Okt" },
  { value: "11", label: "November", shortCut: "Nov" },
  { value: "12", label: "Desember", shortCut: "Des" },
];
export const getStatusConfig = (status: string) => {
  switch (status) {
    case "BOROS":
      return { color: "bg-red-500", label: "Critical", text: "text-red-700" };
    case "WARNING":
      return {
        color: "bg-orange-400",
        label: "Warning",
        text: "text-orange-700",
      };
    case "NORMAL":
      return {
        color: "bg-green-400",
        label: "Normal",
        text: "text-green-700",
      };
    case "HEMAT":
      return {
        color: "bg-emerald-600",
        label: "Efficient",
        text: "text-emerald-700",
      };
    default:
      return {
        color: "bg-slate-300",
        label: "Unknown",
        text: "text-slate-700",
      };
  }
};
export const yearlyDummyData = [
  { month: "Jan", consumption: 400, cost: 600000, budget: 800000 },
  { month: "Feb", consumption: 380, cost: 570000, budget: 800000 },
  { month: "Mar", consumption: 420, cost: 630000, budget: 800000 },
  { month: "Apr", consumption: 450, cost: 675000, budget: 800000 },
  { month: "Mei", consumption: 510, cost: 765000, budget: 800000 },
  { month: "Jun", consumption: 580, cost: 870000, budget: 800000 },
  { month: "Jul", consumption: 600, cost: 900000, budget: 800000 },
  { month: "Agu", consumption: 590, cost: 885000, budget: 800000 },
  { month: "Sep", consumption: 520, cost: 780000, budget: 800000 },
  { month: "Okt", consumption: 480, cost: 720000, budget: 800000 },
  { month: "Nov", consumption: 430, cost: 645000, budget: 800000 },
  { month: "Des", consumption: 410, cost: 615000, budget: 800000 },
];

export const getNotificationStyle = (title: string) => {
  const lowerCaseTitle = title?.toLowerCase();
  if (
    lowerCaseTitle?.includes("risiko") ||
    lowerCaseTitle?.includes("anomali")
  ) {
    return { Icon: IconAlertTriangle, color: "red" };
  }
  if (
    lowerCaseTitle?.includes("sukses") ||
    lowerCaseTitle?.includes("selesai")
  ) {
    return { Icon: IconCircleCheck, color: "green" };
  }

  return { Icon: IconBell, color: "yellow" };
};

export const colorClasses = {
  red: { bg: "bg-red-100", text: "text-red-600" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
  green: { bg: "bg-green-100", text: "text-green-600" },
};
