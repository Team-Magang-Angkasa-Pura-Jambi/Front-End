import {
  IconAlertTriangle,
  IconBell,
  IconCircleCheck,
} from "@tabler/icons-react";

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
