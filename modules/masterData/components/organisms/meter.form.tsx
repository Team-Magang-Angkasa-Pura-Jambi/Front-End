"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  BoxSelect,
  Database,
  Gauge,
  Plus,
  QrCode,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { Resolver, SubmitHandler, useFieldArray, useForm } from "react-hook-form";

import { ComponentLoader } from "@/common/components/ComponentLoader";
import { Alert, AlertDescription, AlertTitle } from "@/common/components/ui/alert";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Separator } from "@/common/components/ui/separator";
import { Switch } from "@/common/components/ui/switch";

import {
  meterFormSchema,
  MeterFormValues,
  MeterStatus,
  TankShape,
} from "../../schemas/meter.schema";
import { getEnergyTypesApi } from "../../services/energyType.service";
import { getMeterByIdApi } from "../../services/meter.service";
import { getReadingTypesApi } from "../../services/readingsType.service";

const ENERGY_TYPES = {
  FUEL: "Fuel",
  WATER: "Water",
  ELECTRICITY: "Electricity",
};

interface MeterFormProps {
  initialData?: number | null;
  onSubmit: (data: MeterFormValues) => void;
  isLoading?: boolean;
}

export const MeterForm = ({
  initialData: meterId,
  onSubmit,
  isLoading: isSubmitting,
}: MeterFormProps) => {
  const {
    data: energyRes,
    isSuccess: isEnergyLoaded,
    isLoading: isEnergyLoading,
  } = useQuery({
    queryKey: ["energyTypes"],
    queryFn: () => getEnergyTypesApi(),
  });

  const { data: readingTypeRes } = useQuery({
    queryKey: ["readingTypes"],
    queryFn: () => getReadingTypesApi(),
  });

  const {
    data: meterDetailRes,
    isLoading: loadingMeterDetail,
    isSuccess: isDetailLoaded,
  } = useQuery({
    queryKey: ["meter", meterId],
    queryFn: () => getMeterByIdApi(meterId!),
    enabled: !!meterId,
  });

  const energyTypes = useMemo(() => energyRes?.data || [], [energyRes]);
  
  const allReadingTypes = useMemo(() => readingTypeRes?.data || [], [readingTypeRes]);

  const form = useForm<MeterFormValues>({
    resolver: zodResolver(meterFormSchema) as Resolver<MeterFormValues>,
    defaultValues: {
      meter: {
        meter_code: "",
        name: "",
        serial_number: "",
        energy_type_id: undefined,
        status: MeterStatus.ACTIVE,
        multiplier: 1,
        is_virtual: false,
        allow_gap: false,
        allow_decrease: false,
        has_rollover: false,
        rollover_limit: undefined,
      },
      meter_profile: undefined,
      reading_config: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "reading_config",
  });

  const energyTypeId = form.watch("meter.energy_type_id");
  const hasRollover = form.watch("meter.has_rollover");
  const tankShape = form.watch("meter_profile.shape");

  useEffect(() => {
    if (meterId && isDetailLoaded && isEnergyLoaded && meterDetailRes?.data) {
      const data = meterDetailRes.data;

      form.reset({
        meter: {
          meter_code: data.meter_code,
          name: data.name ?? "",
          serial_number: data.serial_number ?? "",
          energy_type_id: data.energy_type_id,
          status: data.status as MeterStatus,
          multiplier: Number(data.multiplier) || 1,
          is_virtual: data.is_virtual,
          allow_gap: data.allow_gap,
          allow_decrease: data.allow_decrease,
          has_rollover: !!data.rollover_limit,
          rollover_limit: data.rollover_limit ?? undefined,
        },
        meter_profile: data.tank_profile
          ? {
              shape: data.tank_profile.shape as TankShape,
              capacity_liters: data.tank_profile.capacity_liters,
              height_max_cm: data.tank_profile.height_max_cm,
              diameter_cm: data.tank_profile.diameter_cm ?? undefined,
              length_cm: data.tank_profile.length_cm ?? undefined,
              width_cm: data.tank_profile.width_cm ?? undefined,
            }
          : undefined,
        reading_config:
          data.reading_configs?.map((rc) => ({
            reading_type_id: rc.reading_type?.reading_type_id,
            is_active: rc.is_active,
            alarm_min_threshold: rc.alarm_min_threshold,
            alarm_max_threshold: rc.alarm_max_threshold,
          })) || [],
      });
    }
  }, [meterDetailRes, isDetailLoaded, isEnergyLoaded, meterId, form]);

  const filteredReadingTypes = useMemo(() => {
    if (!energyTypeId) return [];
    return allReadingTypes.filter((rt) => rt.energy_type_id === energyTypeId);
  }, [allReadingTypes, energyTypeId]);

  const isFluid = useMemo(() => {
    const selected = energyTypes.find((e) => e.energy_type_id === energyTypeId);
    return selected?.name === ENERGY_TYPES.FUEL;
  }, [energyTypes, energyTypeId]);

  const handleFormSubmit: SubmitHandler<MeterFormValues> = (data) => {
    onSubmit(data);
  };

  const formErrors = form.formState.errors;

  if (meterId && isEnergyLoading) return <ComponentLoader />;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="grid grid-cols-1 gap-6 lg:grid-cols-12"
      >
        <div className="space-y-6 lg:col-span-8">
          {/* Ringkasan Error Skema (Global Feedback) */}
          {Object.keys(formErrors).length > 0 && (
            <Alert variant="destructive" className="bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Validasi Gagal</AlertTitle>
              <AlertDescription>
                Beberapa kolom wajib diisi atau memiliki format yang salah. Silakan periksa kolom
                dengan tanda merah di bawah.
              </AlertDescription>
            </Alert>
          )}

          {/* Section 1: Identity */}
          <Card className="border-t-4 border-t-blue-500 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Identitas Meter</CardTitle>
                  <CardDescription>Informasi dasar identitas perangkat.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="meter.meter_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Kode Meter <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="MTR-001" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage className="text-[11px] font-medium" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="meter.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Label</FormLabel>
                    <FormControl>
                      <Input placeholder="Genset Utama" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage className="text-[11px] font-medium" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="meter.energy_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tipe Energi <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value?.toString() ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Energi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {energyTypes.map((e) => (
                          <SelectItem key={e.energy_type_id} value={e.energy_type_id.toString()}>
                            <div className="flex items-center gap-2">
                              {e.name === ENERGY_TYPES.FUEL ? (
                                <Database className="h-3 w-3" />
                              ) : (
                                <Activity className="h-3 w-3" />
                              )}
                              {e.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[11px] font-medium" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section 2: Parameters */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <Gauge className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Parameter Bacaan</CardTitle>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!energyTypeId}
                onClick={() => append({ reading_type_id: 0, is_active: true })}
                className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <Plus className="h-4 w-4" /> Tambah
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {!energyTypeId && (
                <div className="bg-muted/10 text-muted-foreground flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center text-sm italic">
                  Pilih tipe energi terlebih dahulu untuk mengatur parameter.
                </div>
              )}
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 items-start gap-3 rounded-xl border bg-slate-50/50 p-4"
                >
                  <div className="col-span-12 md:col-span-5">
                    <FormField
                      control={form.control}
                      name={`reading_config.${index}.reading_type_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground text-[10px] font-bold uppercase">
                            Parameter
                          </FormLabel>
                          <Select
                            onValueChange={(v) => field.onChange(Number(v))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Pilih..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredReadingTypes.map((rt) => (
                                <SelectItem
                                  key={rt.reading_type_id}
                                  value={rt.reading_type_id.toString()}
                                >
                                  {rt.type_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-5 md:col-span-3">
                    <FormField
                      control={form.control}
                      name={`reading_config.${index}.alarm_min_threshold`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground text-[10px] font-bold uppercase">
                            Min
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ""}
                              className="h-9"
                            />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-5 md:col-span-3">
                    <FormField
                      control={form.control}
                      name={`reading_config.${index}.alarm_max_threshold`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground text-[10px] font-bold uppercase">
                            Max
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ""}
                              className="h-9"
                            />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-2 flex justify-end pt-5 md:col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {formErrors.reading_config && (
                <p className="text-[11px] font-medium text-red-500 italic">
                  {formErrors.reading_config.message}
                </p>
              )}
            </CardContent>
          </Card>

          {isFluid && (
            <Card className="border-t-4 border-t-orange-500 bg-orange-50/10 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Profil Tangki</CardTitle>
                    <CardDescription>Dimensi untuk kalkulasi volume.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="meter_profile.shape"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bentuk Tangki</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Bentuk" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TankShape.CYLINDER_VERTICAL}>
                            Silinder Tegak
                          </SelectItem>
                          <SelectItem value={TankShape.CYLINDER_HORIZONTAL}>
                            Silinder Tidur
                          </SelectItem>
                          <SelectItem value={TankShape.BOX}>Kotak (Box)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meter_profile.capacity_liters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kapasitas (Liter)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meter_profile.height_max_cm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tinggi Max (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Conditional Dimensions */}
                {(tankShape === TankShape.CYLINDER_VERTICAL ||
                  tankShape === TankShape.CYLINDER_HORIZONTAL) && (
                  <FormField
                    control={form.control}
                    name="meter_profile.diameter_cm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diameter (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {tankShape === TankShape.BOX && (
                  <>
                    <FormField
                      control={form.control}
                      name="meter_profile.length_cm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Panjang (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} value={field.value ?? ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="meter_profile.width_cm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lebar (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} value={field.value ?? ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="space-y-6 lg:col-span-4">
          <Card className="border-l-primary sticky top-6 border-l-4 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="text-primary h-4 w-4" /> Status & Kontrol
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormField
                control={form.control}
                name="meter.status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Perangkat</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={MeterStatus.ACTIVE}>Aktif</SelectItem>
                        <SelectItem value={MeterStatus.INACTIVE}>Non-Aktif</SelectItem>
                        <SelectItem value={MeterStatus.MAINTENANCE}>Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="meter.multiplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase">Multiplier</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
              <Separator />
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="meter.is_virtual"
                  render={({ field }) => (
                    <FormItem className="bg-muted/5 flex items-center justify-between rounded-lg border p-3">
                      <FormLabel className="text-sm font-medium">Virtual Meter</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meter.has_rollover"
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-3">
                      <FormLabel className="flex items-center gap-1.5 text-sm font-medium">
                        <BoxSelect className="text-primary h-4 w-4" /> Auto Rollover
                      </FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </div>
                  )}
                />
                {hasRollover && (
                  <FormField
                    control={form.control}
                    name="meter.rollover_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Batas Rollover"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full font-bold shadow-lg transition-all active:scale-[0.98]"
              >
                {isSubmitting ? "Sedang Menyimpan..." : "Simpan Perubahan"}
                {!isSubmitting && <Save className="ml-2 h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
};
