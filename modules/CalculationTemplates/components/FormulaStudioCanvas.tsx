"use client";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Switch } from "@/common/components/ui/switch";
import { Textarea } from "@/common/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AvailableVariablesResponse,
  CalculationTemplate,
  FormulaDefinition,
  FormulaVariable,
  getAvailableVariablesApi,
} from "@/modules/masterData/services/calculationTemplate.service";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Code2,
  Cpu,
  Loader2,
  Play,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Variable,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface FormulaStudioCanvasProps {
  initialData?: CalculationTemplate | null;
  onBack: () => void;
  onSave: (formData: {
    name: string;
    description?: string;
    definitions: FormulaDefinition[];
  }) => void;
  isSaving?: boolean;
}

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export const FormulaStudioCanvas = ({
  initialData,
  onBack,
  onSave,
  isSaving,
}: FormulaStudioCanvasProps) => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");

  const [definitions, setDefinitions] = useState<FormulaDefinition[]>(
    initialData?.definitions && initialData.definitions.length > 0
      ? initialData.definitions
      : [
          {
            name: "Perhitungan Konsumsi Utama",
            is_main: true,
            formula_items: {
              formula: "(STAND_NOW - STAND_PREV) * MULTIPLIER",
              variables: [
                {
                  label: "STAND_NOW",
                  type: "reading",
                  readingTypeId: 1,
                  timeShift: 0,
                },
                {
                  label: "STAND_PREV",
                  type: "reading",
                  readingTypeId: 1,
                  timeShift: -1,
                },
                {
                  label: "MULTIPLIER",
                  type: "spec",
                  specField: "multiplier",
                },
              ],
            },
          },
        ]
  );

  const [activeDefIndex, setActiveDefIndex] = useState(0);

  // Fetch available variables dictionary
  const { data: availableVars, isLoading: __isLoadingVars } = useQuery<AvailableVariablesResponse>({
    queryKey: ["availableVariablesStudio"],
    queryFn: getAvailableVariablesApi,
    staleTime: 1000 * 60 * 5,
  });

  // State untuk form penambahan variabel baru di sidebar
  const [newVarLabel, setNewVarLabel] = useState("");
  const [newVarType, setNewVarType] = useState<"reading" | "spec" | "constant">("reading");
  const [newReadingTypeId, setNewReadingTypeId] = useState<number>(1);
  const [newTimeShift, setNewTimeShift] = useState<number>(0);
  const [newSpecField, setNewSpecField] = useState<string>("multiplier");
  const [newConstantVal, setNewConstantVal] = useState<number>(1);
  const [newMeterId, __setNewMeterId] = useState<number | undefined>(undefined);

  // Playground simulation values
  const [mockValues, setMockValues] = useState<Record<string, number>>({});
  const [testResult, setTestResult] = useState<number | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      if (initialData.definitions && initialData.definitions.length > 0) {
        setDefinitions(initialData.definitions);
      }
    }
  }, [initialData]);

  const activeDef = definitions[activeDefIndex] || definitions[0];

  const updateActiveDefinition = (updater: (prev: FormulaDefinition) => FormulaDefinition) => {
    setDefinitions((prev) => {
      const copy = [...prev];
      if (copy[activeDefIndex]) {
        copy[activeDefIndex] = updater(copy[activeDefIndex]);
      }
      return copy;
    });
  };

  const handleAddDefinition = () => {
    const newDef: FormulaDefinition = {
      name: `Sub-Kalkulasi #${definitions.length + 1}`,
      is_main: false,
      formula_items: {
        formula: "STAND_NOW * 1",
        variables: [
          {
            label: "STAND_NOW",
            type: "reading",
            readingTypeId: 1,
            timeShift: 0,
          },
        ],
      },
    };
    setDefinitions((prev) => [...prev, newDef]);
    setActiveDefIndex(definitions.length);
  };

  const handleRemoveDefinition = (idx: number) => {
    if (definitions.length <= 1) {
      toast.error("Minimal harus memiliki 1 definisi rumus.");
      return;
    }
    setDefinitions((prev) => prev.filter((_, i) => i !== idx));
    setActiveDefIndex((prev) => (prev >= idx ? Math.max(0, prev - 1) : prev));
  };

  const handleAddVariable = () => {
    const cleanLabel = newVarLabel
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, "_");
    if (!cleanLabel) {
      toast.error("Label variabel wajib diisi (huruf kapital, angka, underscore).");
      return;
    }

    const currentVars = activeDef.formula_items.variables || [];
    if (currentVars.some((v) => v.label === cleanLabel)) {
      toast.error(`Variabel '${cleanLabel}' sudah terdaftar dalam rumus aktif.`);
      return;
    }

    let variableObj: FormulaVariable;
    if (newVarType === "reading") {
      variableObj = {
        label: cleanLabel,
        type: "reading",
        readingTypeId: Number(newReadingTypeId) || 1,
        timeShift: Number(newTimeShift) || 0,
        meterId: newMeterId ? Number(newMeterId) : undefined,
      };
    } else if (newVarType === "spec") {
      variableObj = {
        label: cleanLabel,
        type: "spec",
        specField: newSpecField,
        meterId: newMeterId ? Number(newMeterId) : undefined,
      };
    } else {
      variableObj = {
        label: cleanLabel,
        type: "constant",
        value: Number(newConstantVal) || 0,
      };
    }

    updateActiveDefinition((prev) => ({
      ...prev,
      formula_items: {
        ...prev.formula_items,
        variables: [...(prev.formula_items.variables || []), variableObj],
      },
    }));

    setNewVarLabel("");
    toast.success(`Variabel '${cleanLabel}' berhasil ditambahkan ke palet rumus!`);
  };

  const handleRemoveVariable = (varIndex: number) => {
    updateActiveDefinition((prev) => ({
      ...prev,
      formula_items: {
        ...prev.formula_items,
        variables: prev.formula_items.variables.filter((_, i) => i !== varIndex),
      },
    }));
  };

  const insertVariableIntoFormula = (label: string) => {
    updateActiveDefinition((prev) => ({
      ...prev,
      formula_items: {
        ...prev.formula_items,
        formula: `${prev.formula_items.formula} ${label}`.trim(),
      },
    }));
  };

  const applyPreset = (presetType: string) => {
    if (presetType === "standard") {
      updateActiveDefinition((prev) => ({
        ...prev,
        name: "Konsumsi Stand Listrik / Flow Meter",
        formula_items: {
          formula: "(STAND_NOW - STAND_PREV) * MULTIPLIER",
          variables: [
            { label: "STAND_NOW", type: "reading", readingTypeId: 1, timeShift: 0 },
            { label: "STAND_PREV", type: "reading", readingTypeId: 1, timeShift: -1 },
            { label: "MULTIPLIER", type: "spec", specField: "multiplier" },
          ],
        },
      }));
    } else if (presetType === "rollover") {
      updateActiveDefinition((prev) => ({
        ...prev,
        name: "Stand Meter dengan Rollover Limit",
        formula_items: {
          formula:
            "(STAND_NOW >= STAND_PREV ? STAND_NOW - STAND_PREV : (ROLLOVER + STAND_NOW) - STAND_PREV) * MULTIPLIER",
          variables: [
            { label: "STAND_NOW", type: "reading", readingTypeId: 1, timeShift: 0 },
            { label: "STAND_PREV", type: "reading", readingTypeId: 1, timeShift: -1 },
            { label: "ROLLOVER", type: "spec", specField: "rollover_limit" },
            { label: "MULTIPLIER", type: "spec", specField: "multiplier" },
          ],
        },
      }));
    } else if (presetType === "tank_cylinder_volume") {
      updateActiveDefinition((prev) => ({
        ...prev,
        name: "Volume Sisa Tangki Silinder Tegak (Liter)",
        formula_items: {
          formula: "PI * ((DIAMETER / 2) ^ 2) * TINGGI_BBM / 1000",
          variables: [
            { label: "PI", type: "constant", value: 3.14159265 },
            { label: "DIAMETER", type: "spec", specField: "diameter_cm" },
            { label: "TINGGI_BBM", type: "reading", readingTypeId: 1, timeShift: 0 },
          ],
        },
      }));
    } else if (presetType === "tank_cylinder_usage") {
      updateActiveDefinition((prev) => ({
        ...prev,
        name: "Pemakaian BBM Tangki Silinder (Liter)",
        formula_items: {
          formula: "PI * ((DIAMETER / 2) ^ 2) * (TINGGI_PREV - TINGGI_NOW) / 1000",
          variables: [
            { label: "PI", type: "constant", value: 3.14159265 },
            { label: "DIAMETER", type: "spec", specField: "diameter_cm" },
            { label: "TINGGI_PREV", type: "reading", readingTypeId: 1, timeShift: -1 },
            { label: "TINGGI_NOW", type: "reading", readingTypeId: 1, timeShift: 0 },
          ],
        },
      }));
    } else if (presetType === "tank_box_volume") {
      updateActiveDefinition((prev) => ({
        ...prev,
        name: "Volume Sisa Tangki Persegi (Liter)",
        formula_items: {
          formula: "(PANJANG * LEBAR * TINGGI_BBM) / 1000",
          variables: [
            { label: "PANJANG", type: "spec", specField: "length_cm" },
            { label: "LEBAR", type: "spec", specField: "width_cm" },
            { label: "TINGGI_BBM", type: "reading", readingTypeId: 1, timeShift: 0 },
          ],
        },
      }));
    } else if (presetType === "tank_box_usage") {
      updateActiveDefinition((prev) => ({
        ...prev,
        name: "Pemakaian BBM Tangki Persegi (Liter)",
        formula_items: {
          formula: "(PANJANG * LEBAR * (TINGGI_PREV - TINGGI_NOW)) / 1000",
          variables: [
            { label: "PANJANG", type: "spec", specField: "length_cm" },
            { label: "LEBAR", type: "spec", specField: "width_cm" },
            { label: "TINGGI_PREV", type: "reading", readingTypeId: 1, timeShift: -1 },
            { label: "TINGGI_NOW", type: "reading", readingTypeId: 1, timeShift: 0 },
          ],
        },
      }));
    } else if (presetType === "tank_capacity_ratio") {
      updateActiveDefinition((prev) => ({
        ...prev,
        name: "Pemakaian BBM Berdasarkan Rasio Kapasitas",
        formula_items: {
          formula: "((TINGGI_PREV - TINGGI_NOW) / HEIGHT_MAX) * CAPACITY",
          variables: [
            { label: "TINGGI_PREV", type: "reading", readingTypeId: 1, timeShift: -1 },
            { label: "TINGGI_NOW", type: "reading", readingTypeId: 1, timeShift: 0 },
            { label: "HEIGHT_MAX", type: "spec", specField: "height_max_cm" },
            { label: "CAPACITY", type: "spec", specField: "capacity_liters" },
          ],
        },
      }));
    } else if (presetType === "tank_percent") {
      updateActiveDefinition((prev) => ({
        ...prev,
        name: "Tingkat Persentase Sisa Tangki (%)",
        formula_items: {
          formula: "(TINGGI_BBM / HEIGHT_MAX) * 100",
          variables: [
            { label: "TINGGI_BBM", type: "reading", readingTypeId: 1, timeShift: 0 },
            { label: "HEIGHT_MAX", type: "spec", specField: "height_max_cm" },
          ],
        },
      }));
    }
    toast.success("Preset rumus industri berhasil diterapkan!");
  };

  // Test Run Evaluator Sandbox
  const runTestEvaluation = () => {
    try {
      setTestError(null);
      const rawFormula = activeDef.formula_items.formula;
      if (!rawFormula.trim()) {
        throw new Error("Formula masih kosong.");
      }

      let jsExpr = rawFormula
        .replace(/\^/g, "**")
        .replace(/PI/g, "Math.PI")
        .replace(/pow\(/g, "Math.pow(");

      const vars = activeDef.formula_items.variables || [];
      const scope: Record<string, number> = {};

      vars.forEach((v) => {
        const val = mockValues[v.label] ?? (v.type === "constant" ? (v.value ?? 1) : 100);
        scope[v.label] = Number(val);
      });

      const paramNames = Object.keys(scope);
      const paramValues = Object.values(scope);
      const func = new Function(...paramNames, `"use strict"; return (${jsExpr});`);
      const result = func(...paramValues);

      if (typeof result !== "number" || isNaN(result)) {
        throw new Error("Hasil evaluasi bukan angka valid.");
      }

      setTestResult(result);
      toast.success(`Evaluasi Sukses: Hasil = ${result.toLocaleString("id-ID")}`);
    } catch (err: any) {
      setTestResult(null);
      setTestError(err.message || "Sintaks formula tidak valid.");
      toast.error(`Evaluasi Gagal: ${err.message}`);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Nama template rumus wajib diisi.");
      return;
    }
    if (definitions.length === 0) {
      toast.error("Minimal harus memiliki 1 definisi rumus.");
      return;
    }

    for (let i = 0; i < definitions.length; i++) {
      const def = definitions[i];
      if (!def.name.trim()) {
        toast.error(`Nama sub-rumus #${i + 1} belum diisi.`);
        return;
      }
      if (!def.formula_items.formula.trim()) {
        toast.error(`Ekspresi rumus pada '${def.name}' belum diisi.`);
        return;
      }
      if (!def.formula_items.variables || def.formula_items.variables.length === 0) {
        toast.error(`Rumus '${def.name}' harus memiliki minimal 1 variabel terdaftar.`);
        return;
      }
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      definitions,
    });
  };

  return (
    <motion.div className="space-y-6" initial="initial" animate="animate" variants={fadeIn}>
      {/* TOP NAVIGATION BAR & ACTION BUTTONS */}
      <div className="border-border/60 bg-card flex flex-col gap-4 rounded-2xl border p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            className="border-border/60 h-9 gap-1.5 px-3 font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>

          <div>
            <h2 className="text-foreground flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
              <Sparkles className="text-primary h-5 w-5" />
              {initialData
                ? `Studio Editor: ${initialData.name}`
                : "Studio Pembuat Formula Rumus Baru"}
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Rancang logika matematika untuk otomatisasi perhitungan konsumsi energi & profiling
              tangki.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-border/60 h-9"
            onClick={() => onBack()}
          >
            Batal
          </Button>

          <Button
            type="button"
            size="sm"
            className="shadow-primary/20 h-9 gap-1.5 font-bold shadow-md"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Simpan Formula
              </>
            )}
          </Button>
        </div>
      </div>

      {/* WORKSPACE 2-COLUMN FULL-SCREEN LAYOUT */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN (4 COLS): TEMPLATE META & VARIABLE PALETTE */}
        <div className="space-y-5 lg:col-span-4">
          {/* Card 1: Template Metadata */}
          <Card className="border-border/60 bg-card shadow-xs">
            <CardHeader className="border-border/40 border-b pb-3">
              <CardTitle className="text-foreground flex items-center gap-2 text-sm font-bold">
                <Cpu className="text-primary h-4 w-4" />
                Identitas Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="space-y-1.5">
                <Label className="text-foreground text-xs font-bold">
                  Nama Template Formula <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Rumus Listrik PLN Selisih Multiplier"
                  className="bg-background border-border/60 h-9 text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-foreground text-xs font-bold">
                  Deskripsi / Catatan Teknis
                </Label>
                <Textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Catatan tujuan atau spesifikasi meter yang menggunakan rumus ini..."
                  className="bg-background border-border/60 text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Variable Palette & Generator */}
          <Card className="border-border/60 bg-card shadow-xs">
            <CardHeader className="border-border/40 border-b pb-3">
              <CardTitle className="text-foreground flex items-center gap-2 text-sm font-bold">
                <Variable className="text-primary h-4 w-4" />
                Daftarkan Variabel Baru
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Tambahkan variabel parameter telemetry atau spesifikasi fisik ke palet rumus aktif.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 p-4 text-xs">
              <div className="space-y-1">
                <Label className="text-foreground text-[11px] font-bold">
                  Label Variabel (Huruf Besar)
                </Label>
                <Input
                  value={newVarLabel}
                  onChange={(e) => setNewVarLabel(e.target.value)}
                  placeholder="Contoh: STAND_NOW, TINGGI_BBM"
                  className="bg-background border-border/60 h-8 font-mono text-xs font-bold uppercase"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-foreground text-[11px] font-bold">Kategori Variabel</Label>
                <Select value={newVarType} onValueChange={(val: any) => setNewVarType(val)}>
                  <SelectTrigger className="bg-background border-border/60 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reading">⚡ Parameter Bacaan Sensor (Telemetry)</SelectItem>
                    <SelectItem value="spec">📟 Spesifikasi Meter & Profil Tangki</SelectItem>
                    <SelectItem value="constant">🔢 Nilai Angka Statis (Konstanta)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional Inputs */}
              {newVarType === "reading" && (
                <div className="space-y-2 pt-1">
                  <div className="space-y-1">
                    <Label className="text-foreground text-[11px] font-bold">
                      Parameter Sensor / Bacaan
                    </Label>
                    <Select
                      value={newReadingTypeId.toString()}
                      onValueChange={(v) => setNewReadingTypeId(Number(v))}
                    >
                      <SelectTrigger className="bg-background border-border/60 h-8 text-xs">
                        <SelectValue placeholder="Pilih Tipe..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVars?.readings.map((r) => (
                          <SelectItem key={r.id} value={r.id.toString()}>
                            {r.name} ({r.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-foreground text-[11px] font-bold">
                      Konteks Waktu (Time Shift)
                    </Label>
                    <Select
                      value={newTimeShift.toString()}
                      onValueChange={(v) => setNewTimeShift(Number(v))}
                    >
                      <SelectTrigger className="bg-background border-border/60 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVars?.timeContext.map((t) => (
                          <SelectItem key={t.value} value={t.value.toString()}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {newVarType === "spec" && (
                <div className="space-y-1 pt-1">
                  <Label className="text-foreground text-[11px] font-bold">Field Spesifikasi</Label>
                  <Select value={newSpecField} onValueChange={setNewSpecField}>
                    <SelectTrigger className="bg-background border-border/60 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVars?.specs.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          [{s.category || "Spec"}] {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {newVarType === "constant" && (
                <div className="space-y-1 pt-1">
                  <Label className="text-foreground text-[11px] font-bold">
                    Nilai Angka Konstanta
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    value={newConstantVal}
                    onChange={(e) => setNewConstantVal(parseFloat(e.target.value) || 0)}
                    placeholder="Contoh: 3.14159 atau 1000"
                    className="bg-background border-border/60 h-8 font-mono text-xs"
                  />
                </div>
              )}

              <Button
                type="button"
                className="mt-2 h-8 w-full gap-1 text-xs font-bold shadow-xs"
                onClick={handleAddVariable}
              >
                <Plus className="h-3.5 w-3.5" /> Daftarkan Variabel ke Rumus
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN (8 COLS): FORMULA TABS, SYNTAX EDITOR, PRESETS & PLAYGROUND */}
        <div className="space-y-5 lg:col-span-8">
          <Card className="border-border/60 bg-card shadow-xs">
            {/* Sub-formula Tabs Header */}
            <CardHeader className="border-border/40 border-b pb-3">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <Code2 className="text-primary h-5 w-5" />
                  <CardTitle className="text-foreground text-base font-bold">
                    Editor Ekspresi Matematika
                  </CardTitle>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-border/60 text-primary hover:bg-primary/10 h-8 gap-1 text-xs"
                  onClick={handleAddDefinition}
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Sub-Kalkulasi
                </Button>
              </div>

              {/* Sub-formula Tabs Bar */}
              <div className="flex gap-2 overflow-x-auto pt-2">
                {definitions.map((def, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveDefIndex(idx)}
                    className={cn(
                      "flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all",
                      activeDefIndex === idx
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted border-border/60 hover:text-foreground"
                    )}
                  >
                    <span>{def.name || `Sub-Rumus #${idx + 1}`}</span>
                    {def.is_main && (
                      <Badge
                        className={cn(
                          "px-1.5 py-0 text-[9px] font-bold",
                          activeDefIndex === idx
                            ? "bg-white/20 text-white"
                            : "bg-primary/10 text-primary border-primary/20"
                        )}
                      >
                        UTAMA
                      </Badge>
                    )}
                    {definitions.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveDefinition(idx);
                        }}
                        className="ml-1 text-sm font-bold hover:text-red-300"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </CardHeader>

            <CardContent className="space-y-5 p-5 text-xs">
              {/* Row 1: Sub-formula Name & Is Main Switch */}
              <div className="bg-muted/30 border-border/50 grid grid-cols-1 items-center gap-4 rounded-xl border p-3.5 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-foreground text-xs font-bold">Nama Sub-Kalkulasi</Label>
                  <Input
                    value={activeDef.name}
                    onChange={(e) =>
                      updateActiveDefinition((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Contoh: Konsumsi Utama / Pemakaian BBM"
                    className="bg-background border-border/60 h-8 text-xs font-medium"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end sm:pt-2">
                  <div className="text-right">
                    <Label className="text-foreground cursor-pointer text-xs font-bold">
                      Jadikan Nilai Konsumsi Utama (Main Metric)
                    </Label>
                    <p className="text-muted-foreground text-[10px]">
                      Hasil evaluasi rumus ini disimpan ke total summary harian
                    </p>
                  </div>
                  <Switch
                    checked={activeDef.is_main}
                    onCheckedChange={(val) =>
                      updateActiveDefinition((prev) => ({ ...prev, is_main: val }))
                    }
                  />
                </div>
              </div>

              {/* QUICK FORMULA PRESETS BAR */}
              <div className="bg-primary/5 border-primary/20 space-y-2 rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-primary flex items-center gap-1.5 text-[11px] font-bold">
                    <Sparkles className="h-3.5 w-3.5" /> Preset Rumus Industri & Template Cepat:
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    Klik preset untuk langsung memuat formula & variabel siap pakai
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Kategori 1: Listrik & Meter */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-background border-border/60 hover:bg-primary/10 hover:text-primary h-7 text-[11px]"
                    onClick={() => applyPreset("standard")}
                  >
                    ⚡ Stand Selisih (H0 - H1) × Multiplier
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-background border-border/60 hover:bg-primary/10 hover:text-primary h-7 text-[11px]"
                    onClick={() => applyPreset("rollover")}
                  >
                    🔄 Selisih + Rollover Limit
                  </Button>

                  {/* Kategori 2: Tangki Silinder */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-background border-border/60 hover:bg-primary/10 hover:text-primary h-7 text-[11px]"
                    onClick={() => applyPreset("tank_cylinder_volume")}
                  >
                    🛢️ Volume Tangki Silinder (Liter)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-background border-border/60 hover:bg-primary/10 hover:text-primary h-7 text-[11px]"
                    onClick={() => applyPreset("tank_cylinder_usage")}
                  >
                    ⛽ Pemakaian BBM Tangki Silinder
                  </Button>

                  {/* Kategori 3: Tangki Kotak */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-background border-border/60 hover:bg-primary/10 hover:text-primary h-7 text-[11px]"
                    onClick={() => applyPreset("tank_box_volume")}
                  >
                    📦 Volume Tangki Persegi (Liter)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-background border-border/60 hover:bg-primary/10 hover:text-primary h-7 text-[11px]"
                    onClick={() => applyPreset("tank_box_usage")}
                  >
                    📉 Pemakaian BBM Tangki Persegi
                  </Button>

                  {/* Kategori 4: Rasio Kapasitas & % */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-background border-border/60 hover:bg-primary/10 hover:text-primary h-7 text-[11px]"
                    onClick={() => applyPreset("tank_capacity_ratio")}
                  >
                    💧 Pemakaian dari Rasio Kapasitas
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-background border-border/60 hover:bg-primary/10 hover:text-primary h-7 text-[11px]"
                    onClick={() => applyPreset("tank_percent")}
                  >
                    📊 Persentase Sisa Tangki (%)
                  </Button>
                </div>
              </div>

              {/* FORMULA CODE EDITOR */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                    <Code2 className="text-primary h-4 w-4" />
                    Ekspresi Formula Matematika
                  </Label>
                  <span className="text-muted-foreground font-mono text-[10px]">
                    Operators: + - * / ^ ( ) Math functions: min, max, pow
                  </span>
                </div>

                <Textarea
                  rows={3}
                  value={activeDef.formula_items.formula}
                  onChange={(e) =>
                    updateActiveDefinition((prev) => ({
                      ...prev,
                      formula_items: { ...prev.formula_items, formula: e.target.value },
                    }))
                  }
                  placeholder="Contoh: (STAND_NOW - STAND_PREV) * MULTIPLIER"
                  className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-sm font-bold tracking-wide text-indigo-400 dark:text-indigo-300"
                />
              </div>

              {/* REGISTERED VARIABLES PALETTE ON ACTIVE FORMULA */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                    <Variable className="text-primary h-4 w-4" />
                    Variabel Terdaftar ({activeDef.formula_items.variables?.length || 0}) —{" "}
                    <span className="text-muted-foreground font-normal">
                      Klik pada nama variabel untuk menyisipkannya ke ekspresi rumus:
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {!activeDef.formula_items.variables ||
                  activeDef.formula_items.variables.length === 0 ? (
                    <div className="text-muted-foreground border-border/70 bg-muted/10 col-span-2 rounded-xl border border-dashed p-6 text-center italic">
                      Belum ada variabel terdaftar. Tambahkan variabel dari panel sebelah kiri.
                    </div>
                  ) : (
                    activeDef.formula_items.variables.map((v, vIdx) => {
                      let typeDesc = "";
                      if (v.type === "reading") {
                        const rName =
                          availableVars?.readings.find((r) => r.id === v.readingTypeId)?.name ||
                          `Tipe #${v.readingTypeId}`;
                        const tName =
                          v.timeShift === 0
                            ? "Stand H-0"
                            : v.timeShift === -1
                              ? "Stand H-1"
                              : `H${v.timeShift}`;
                        typeDesc = `${rName} [${tName}]`;
                      } else if (v.type === "spec") {
                        const sName =
                          availableVars?.specs.find((s) => s.value === v.specField)?.label ||
                          v.specField;
                        typeDesc = `Spec: ${sName}`;
                      } else {
                        typeDesc = `Konstanta: ${v.value}`;
                      }

                      return (
                        <div
                          key={vIdx}
                          className="border-border/60 bg-background hover:border-primary/50 flex items-center justify-between rounded-xl border p-2.5 shadow-xs transition-all"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <button
                              type="button"
                              onClick={() => insertVariableIntoFormula(v.label)}
                              title="Klik untuk menyisipkan ke rumus"
                              className="bg-primary/10 text-primary hover:bg-primary/20 shrink-0 rounded-lg px-2 py-0.5 font-mono text-xs font-bold transition-colors"
                            >
                              + {v.label}
                            </button>
                            <span
                              className="text-muted-foreground truncate text-[11px]"
                              title={typeDesc}
                            >
                              {typeDesc}
                            </span>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive h-6 w-6 shrink-0"
                            onClick={() => handleRemoveVariable(vIdx)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* SIMULATION PLAYGROUND / SANDBOX TESTER */}
              <div className="border-border/70 bg-muted/30 space-y-3 rounded-xl border p-4">
                <div className="border-border/40 flex flex-col justify-between gap-2 border-b pb-2 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2">
                    <Play className="text-primary h-4 w-4" />
                    <span className="text-foreground text-xs font-bold">
                      Sandbox Simulator (Uji Coba Hasil Rumus Secara Langsung)
                    </span>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    className="h-7 gap-1 text-xs font-bold shadow-xs"
                    onClick={runTestEvaluation}
                  >
                    <Play className="h-3 w-3" /> Jalankan Simulasi
                  </Button>
                </div>

                {/* Input Sample Mock Values for Variables */}
                {activeDef.formula_items.variables &&
                  activeDef.formula_items.variables.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
                      {activeDef.formula_items.variables.map((v) => (
                        <div key={v.label} className="space-y-1">
                          <Label className="text-muted-foreground font-mono text-[10px] font-bold">
                            {v.label} =
                          </Label>
                          <Input
                            type="number"
                            step="any"
                            value={
                              mockValues[v.label] ??
                              (v.type === "constant"
                                ? (v.value ?? 1)
                                : v.label.includes("PREV")
                                  ? 1000
                                  : 1250)
                            }
                            onChange={(e) =>
                              setMockValues((prev) => ({
                                ...prev,
                                [v.label]: parseFloat(e.target.value) || 0,
                              }))
                            }
                            className="bg-background border-border/60 h-7 font-mono text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                {/* Test Result Display */}
                {testResult !== null && (
                  <div className="flex items-center justify-between rounded-lg border border-emerald-500/40 bg-slate-950 p-3 font-mono text-xs text-emerald-400 shadow-inner">
                    <span className="text-[11px] text-slate-400">Hasil Kalkulasi:</span>
                    <span className="text-base font-black">
                      {testResult.toLocaleString("id-ID", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {testError && (
                  <div className="bg-destructive/10 border-destructive/30 text-destructive rounded-lg border p-3 font-mono text-xs">
                    💥 Error Evaluasi: {testError}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
