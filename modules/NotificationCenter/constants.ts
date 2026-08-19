// NotificationCenter/constants.ts
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  BellRing,
  Settings,
  Wrench,
  Wallet,
  Database,
} from "lucide-react";
import { NotificationCategory, NotificationSeverity } from "./types";

export const SEVERITY_CONFIG: Record<
  NotificationSeverity,
  { icon: any; color: string; bg: string }
> = {
  CRITICAL: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50/50" },
  WARNING: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50/50" },
  INFO: { icon: Info, color: "text-blue-500", bg: "bg-blue-50/50" },
  SUCCESS: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50/50" },
};

export const CATEGORY_ICON: Record<NotificationCategory, any> = {
  SYSTEM: Settings,
  THRESHOLD_BREACH: BellRing,
  ANOMALY_DETECTED: AlertTriangle,
  MAINTENANCE: Wrench,
  BUDGET_WARNING: Wallet,
  DATA_ENTRY: Database,
};
