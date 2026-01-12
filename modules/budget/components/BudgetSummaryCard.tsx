import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { LucideIcon } from "lucide-react";

interface BudgetSummaryCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  description: string;
}
export const BudgetSummaryCard = ({
  icon: Icon,
  title,
  value,
  description,
}: BudgetSummaryCardProps) => (
  <Card className="h-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="text-muted-foreground h-4 w-4" />
    </CardHeader>
    <CardContent>
      <div className="text-primary text-2xl font-bold">{value}</div>
      <p className="text-muted-foreground text-xs">{description}</p>
    </CardContent>
  </Card>
);
