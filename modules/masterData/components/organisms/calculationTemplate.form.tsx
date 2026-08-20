"use client";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
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
import { useQuery } from "@tanstack/react-query";
import { Calculator, Code2, Loader2, Plus, Sparkles, Trash2, Variable } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AvailableVariablesResponse,
  CalculationTemplate,
  FormulaDefinition,
  FormulaVariable,
  getAvailableVariablesApi,
} from "../../services/calculationTemplate.service";

interface CalculationTemplateFormProps {
  initialData?: CalculationTemplate | null;
  onSubmit: (data: {
    name: string;
    description?: string;
    definitions: FormulaDefinition[];
  }) => void;
  isLoading?: boolean;
}

export const CalculationTemplateForm = ({
  initialData,
  onSubmit,
  isLoading,
}: CalculationTemplateFormProps) => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");

  // Definitions state
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

  // Active definition tab
  const [activeDefIndex, setActiveDefIndex] = useState(0);

  // Fetch available variable specs & readings
  const { data: availableVars, } = useQuery<AvailableVariablesResponse>({
    queryKey: ["availableVariables"],
    queryFn: getAvailableVariablesApi,
    staleTime: 1000 * 60 * 5,
  });

  // State untuk form penambahan variabel baru
  const [newVarLabel, setNewVarLabel] = useState("");
  const [newVarType, setNewVarType] = useState<"reading" | "spec" | "constant">("reading");
  const [newReadingTypeId, setNewReadingTypeId] = useState<number>(1);
  const [newTimeShift, setNewTimeShift] = useState<number>(0);
  const [newSpecField, setNewSpecField] = useState<string>("multiplier");
  const [newConstantVal, setNewConstantVal] = useState<number>(1);
  const [newMeterId, __setNewMeterId] = useState<number | undefined>(undefined);

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
      name: `Rumus Turunan #${definitions.length + 1}`,
      is_main: false,
      formula_items: {
        formula: "X * 1",
        variables: [
          {
            label: "X",
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
      toast.error("Minimal harus memiliki 1 definisi rumus perhitungan.");
      return;
    }
    setDefinitions((prev) => prev.filter((_, i) => i !== idx));
    setActiveDefIndex((prev) => (prev >= idx ? Math.max(0, prev - 1) : prev));
  };

  const handleAddVariableToActiveDef = () => {
    const cleanLabel = newVarLabel
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, "_");
    if (!cleanLabel) {
      toast.error("Label variabel wajib diisi (contoh: STAND_H0, TINGGI_BBM)");
      return;
    }

    const currentVars = activeDef.formula_items.variables || [];
    if (currentVars.some((v) => v.label === cleanLabel)) {
      toast.error(`Variabel dengan label '${cleanLabel}' sudah ada dalam rumus ini.`);
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
    toast.success(`Variabel '${cleanLabel}' berhasil ditambahkan ke rumus!`);
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

  const insertTextToFormula = (text: string) => {
    updateActiveDefinition((prev) => ({
      ...prev,
      formula_items: {
        ...prev.formula_items,
        formula: `${prev.formula_items.formula} ${text}`.trim(),
      },
    }));
  };

  const applyFormulaPreset = (presetType: string) => {
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
    toast.success("Preset rumus berhasil diterapkan!");
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama template kalkulasi wajib diisi.");
      return;
    }
    if (definitions.length === 0) {
      toast.error("Minimal harus ada 1 definisi rumus.");
      return;
    }

    for (let i = 0; i < definitions.length; i++) {
      const def = definitions[i];
      if (!def.name.trim()) {
        toast.error(`Nama rumus pada tab #${i + 1} belum diisi.`);
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

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      definitions,
    });
  };

  return (
    <form onSubmit={handleSubmitForm} className="space-y-6 text-xs">
      {/* SECTION 1: INFORMASI UMUM TEMPLATE */}
      <div className="bg-muted/20 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2 dark:border-slate-800">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Nama Template Kalkulasi <span className="text-red-500">*</span>
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Rumus Listrik PLN Selisih Multiplier"
            className="bg-background h-9 font-medium"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Deskripsi / Catatan Teknis
          </Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Menghitung konsumsi harian dari stand H-0 dikurangi H-1"
            className="bg-background h-9"
          />
        </div>
      </div>

      {/* SECTION 2: DEFINISI RUMUS & TABS */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Daftar Definisi Rumus ({definitions.length})
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1 border-indigo-200 text-[11px] text-indigo-600 dark:border-indigo-900"
              onClick={handleAddDefinition}
            >
              <Plus className="h-3 w-3" /> Tambah Sub-Rumus
            </Button>
          </div>
        </div>

        {/* Tab Header untuk Sub-Rumus */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {definitions.map((def, idx) => (
            <div
              key={idx}
              onClick={() => setActiveDefIndex(idx)}
              className={cn(
                "flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                activeDefIndex === idx
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted border-slate-200 dark:border-slate-800"
              )}
            >
              <span>{def.name || `Rumus #${idx + 1}`}</span>
              {def.is_main && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "px-1 py-0 text-[9px]",
                    activeDefIndex === idx
                      ? "bg-white/20 text-white"
                      : "bg-indigo-500/10 text-indigo-600"
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
                  className="ml-1 hover:text-red-300"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Form Isi Rumus Aktif */}
        {activeDef && (
          <div className="bg-card space-y-4 rounded-xl border border-slate-200 p-4 shadow-xs dark:border-slate-800">
            {/* Header Rumus: Nama & Toggle Is Main */}
            <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Nama Definisi Rumus</Label>
                <Input
                  value={activeDef.name}
                  onChange={(e) =>
                    updateActiveDefinition((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Contoh: Konsumsi Utama / Pemakaian BBM"
                  className="bg-background h-8"
                />
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end sm:pt-4">
                <div className="text-right">
                  <Label className="cursor-pointer text-[11px] font-bold">
                    Sebagai Nilai Konsumsi Utama (Main Metric)
                  </Label>
                  <p className="text-muted-foreground text-[10px]">
                    Hasil rumus ini akan disimpan ke total konsumsi harian
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

            {/* PRESET RUMUS POPULER */}
            <div className="bg-primary/5 border-primary/20 space-y-2 rounded-lg border p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-primary flex items-center gap-1 text-[10px] font-bold">
                  <Sparkles className="h-3 w-3" /> Template / Preset Rumus Cepat:
                </span>
                <span className="text-muted-foreground text-[9px]">
                  Klik untuk langsung menerapkan formula dan variabel
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-background hover:bg-primary/10 hover:text-primary h-6 text-[10px]"
                  onClick={() => applyFormulaPreset("standard")}
                >
                  ⚡ Stand Selisih (H0 - H1) × Multiplier
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-background hover:bg-primary/10 hover:text-primary h-6 text-[10px]"
                  onClick={() => applyFormulaPreset("rollover")}
                >
                  🔄 Selisih + Rollover Limit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-background hover:bg-primary/10 hover:text-primary h-6 text-[10px]"
                  onClick={() => applyFormulaPreset("tank_cylinder_volume")}
                >
                  🛢️ Volume Tangki Silinder
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-background hover:bg-primary/10 hover:text-primary h-6 text-[10px]"
                  onClick={() => applyFormulaPreset("tank_cylinder_usage")}
                >
                  ⛽ Pemakaian BBM Tangki Silinder
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-background hover:bg-primary/10 hover:text-primary h-6 text-[10px]"
                  onClick={() => applyFormulaPreset("tank_box_volume")}
                >
                  📦 Volume Tangki Persegi
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-background hover:bg-primary/10 hover:text-primary h-6 text-[10px]"
                  onClick={() => applyFormulaPreset("tank_box_usage")}
                >
                  📉 Pemakaian BBM Tangki Persegi
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-background hover:bg-primary/10 hover:text-primary h-6 text-[10px]"
                  onClick={() => applyFormulaPreset("tank_capacity_ratio")}
                >
                  💧 Pemakaian dari Rasio Kapasitas
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-background hover:bg-primary/10 hover:text-primary h-6 text-[10px]"
                  onClick={() => applyFormulaPreset("tank_percent")}
                >
                  📊 Persentase Sisa Tangki (%)
                </Button>
              </div>
            </div>

            {/* FORMULA EXPRESSION INPUT */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-[11px] font-bold">
                  <Code2 className="h-3.5 w-3.5 text-indigo-600" />
                  Ekspresi Rumus Matematika
                </Label>
                <span className="text-muted-foreground text-[10px]">
                  Gunakan +, -, *, /, ^, (), dan nama variabel yang terdaftar di bawah
                </span>
              </div>

              <Textarea
                rows={2}
                value={activeDef.formula_items.formula}
                onChange={(e) =>
                  updateActiveDefinition((prev) => ({
                    ...prev,
                    formula_items: { ...prev.formula_items, formula: e.target.value },
                  }))
                }
                placeholder="Contoh: (STAND_NOW - STAND_PREV) * MULTIPLIER"
                className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-xs font-bold tracking-wide text-indigo-700 dark:text-indigo-300"
              />
            </div>

            {/* VARIABLE BUILDER SECTION */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-t pt-3">
                <h5 className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Variable className="h-3.5 w-3.5 text-indigo-600" />
                  Daftar Variabel Terdaftar pada Rumus Ini (
                  {activeDef.formula_items.variables?.length || 0})
                </h5>
              </div>

              {/* Table of registered variables in this formula */}
              <div className="bg-muted/10 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                {!activeDef.formula_items.variables ||
                  activeDef.formula_items.variables.length === 0 ? (
                  <div className="text-muted-foreground p-4 text-center text-[11px] italic">
                    Belum ada variabel terdaftar. Tambahkan variabel dari form di bawah.
                  </div>
                ) : (
                  activeDef.formula_items.variables.map((v, vIdx) => {
                    let desc = "";
                    if (v.type === "reading") {
                      const rName =
                        availableVars?.readings.find((r) => r.id === v.readingTypeId)?.name ||
                        `Tipe #${v.readingTypeId}`;
                      const tLabel =
                        v.timeShift === 0
                          ? "Hari Ini (H-0)"
                          : v.timeShift === -1
                            ? "Kemarin (H-1)"
                            : `${v.timeShift} Hari`;
                      desc = `Bacaan: ${rName} [${tLabel}]`;
                    } else if (v.type === "spec") {
                      const sName =
                        availableVars?.specs.find((s) => s.value === v.specField)?.label ||
                        v.specField;
                      desc = `Spesifikasi: ${sName}`;
                    } else {
                      desc = `Nilai Tetap (Konstanta): ${v.value}`;
                    }

                    return (
                      <div
                        key={vIdx}
                        className="hover:bg-muted/30 flex items-center justify-between p-2.5 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => insertTextToFormula(v.label)}
                            title="Klik untuk memasukkan ke ekspresi rumus"
                            className="rounded-md bg-indigo-500/10 px-2 py-0.5 font-mono text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-500/20 dark:text-indigo-400"
                          >
                            + {v.label}
                          </button>
                          <Badge variant="outline" className="text-[10px] font-normal uppercase">
                            {v.type}
                          </Badge>
                          <span className="text-muted-foreground text-[11px]">{desc}</span>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground h-6 w-6 hover:text-red-500"
                          onClick={() => handleRemoveVariable(vIdx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Form Menambahkan Variabel Baru */}
              <div className="space-y-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/40">
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  ➕ Daftarkan Variabel Baru ke Rumus:
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                  {/* Label Variabel */}
                  <div className="space-y-1">
                    <Label className="text-[10px]">Label di Rumus (Huruf Besar)</Label>
                    <Input
                      value={newVarLabel}
                      onChange={(e) => setNewVarLabel(e.target.value)}
                      placeholder="Contoh: STAND_H0"
                      className="bg-background h-8 font-mono font-bold"
                    />
                  </div>

                  {/* Tipe Variabel */}
                  <div className="space-y-1">
                    <Label className="text-[10px]">Kategori Variabel</Label>
                    <Select value={newVarType} onValueChange={(val: any) => setNewVarType(val)}>
                      <SelectTrigger className="bg-background h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reading">⚡ Parameter Bacaan Sensor</SelectItem>
                        <SelectItem value="spec">📟 Spesifikasi Meter / Tangki</SelectItem>
                        <SelectItem value="constant">🔢 Angka Konstanta Tetap</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Form Kondisional Berdasarkan Tipe */}
                  {newVarType === "reading" && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Pilih Parameter Bacaan</Label>
                        <Select
                          value={newReadingTypeId.toString()}
                          onValueChange={(v) => setNewReadingTypeId(Number(v))}
                        >
                          <SelectTrigger className="bg-background h-8">
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
                        <Label className="text-[10px]">Waktu Sesi (Time Shift)</Label>
                        <Select
                          value={newTimeShift.toString()}
                          onValueChange={(v) => setNewTimeShift(Number(v))}
                        >
                          <SelectTrigger className="bg-background h-8">
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
                    </>
                  )}

                  {newVarType === "spec" && (
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-[10px]">Pilih Field Spesifikasi</Label>
                      <Select value={newSpecField} onValueChange={setNewSpecField}>
                        <SelectTrigger className="bg-background h-8">
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
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-[10px]">Nilai Angka Konstanta</Label>
                      <Input
                        type="number"
                        step="any"
                        value={newConstantVal}
                        onChange={(e) => setNewConstantVal(parseFloat(e.target.value) || 0)}
                        placeholder="Contoh: 3.14159 / 1000"
                        className="bg-background h-8 font-mono"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 gap-1 bg-indigo-600 text-[11px] text-white hover:bg-indigo-700"
                    onClick={handleAddVariableToActiveDef}
                  >
                    <Plus className="h-3 w-3" /> Tambahkan Variabel ke Rumus
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER ACTION */}
      <div className="flex items-center justify-end gap-2 border-t pt-4">
        <Button
          type="submit"
          size="lg"
          className="w-full bg-indigo-600 font-bold text-white shadow-md hover:bg-indigo-700 sm:w-auto"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan Template...
            </>
          ) : (
            "Simpan Konfigurasi Template Rumus"
          )}
        </Button>
      </div>
    </form>
  );
};
