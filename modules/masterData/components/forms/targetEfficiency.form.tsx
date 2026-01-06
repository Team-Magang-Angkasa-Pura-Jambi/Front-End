    import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    } from "@/components/ui/form";
    import { Input } from "@/components/ui/input";
    import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    } from "@/components/ui/select";
import {
  TargetEfficiencyFormValues,
  targetEfficiencySchema,
} from "../../schemas/targetEfficiency.schema";
import { Resolver, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { getMetersApi } from "../../services/meter.service";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { TargetEfficiencyPreview } from "../targetEfficiencyPreview";
import { MeterType } from "@/common/types/meters";
import { EfficiencyTarget } from "@/common/types/efficiencyTarget";

interface TargetEfficiencyFormProps {
  initialData?: EfficiencyTarget | null;
  onSubmit: SubmitHandler<TargetEfficiencyFormValues>;
  isLoading?: boolean;
}
export function TargetEfficiencyForm({
  initialData,
  onSubmit,
  isLoading,
}: TargetEfficiencyFormProps) {
  const form = useForm<TargetEfficiencyFormValues>({
    resolver: zodResolver(
      targetEfficiencySchema
    ) as Resolver<TargetEfficiencyFormValues>,
    defaultValues: initialData
      ? {
          ...initialData,
          period_start: new Date(initialData.period_start),
          period_end: new Date(initialData.period_end),
          meter_id: initialData?.meter?.meter_id,
        }
      : {
          kpi_name: "",
          target_value: 0,
          period_start: undefined,
          period_end: undefined,
          meter_id: undefined,
        },
  });

  const { data: metersResponse, isLoading: isLoadingMeters } = useQuery({
    queryKey: ["allMeters"],
    queryFn: () => getMetersApi(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const meters = metersResponse?.data || [];

  const selectedMeterId = form.watch("meter_id");

  return (
    <Form {...form}>
      <form
        id="target-efficiency-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="meter_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meter</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ? String(field.value) : ""}
                disabled={isLoadingMeters}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingMeters ? "Memuat meter..." : "Pilih Meter"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {meters.map((meter) => (
                    <SelectItem
                      key={meter.meter_id}
                      value={String(meter.meter_id)}
                    >
                      {meter.meter_code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {selectedMeterId && (
          <>
            <FormField
              control={form.control}
              name="kpi_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama KPI</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Penghematan Listrik Gedung A"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="target_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nilai Target (
                    {meters.find(
                      (m: MeterType) => m.meter_id == selectedMeterId
                    )?.energy_type?.unit_of_measurement || "%"}
                    )
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Contoh: 5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="period_start"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Periode Mulai</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="period_end"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Periode Selesai</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}
        <TargetEfficiencyPreview />
      </form>
      <AlertDialogFooter className="pt-4">
        <Button
          type="submit"
          form="target-efficiency-form"
          disabled={isLoading}
        >
          {isLoading ? "Menyimpan..." : "Simpan"}
        </Button>
      </AlertDialogFooter>
    </Form>
  );
}
