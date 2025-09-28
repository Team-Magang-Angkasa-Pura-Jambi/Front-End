import { masterData } from "@/services/masterData.service";
import { Meter, MeterForm, createMeterColumns } from "./meter-config";
import {
  ReadingType,
  ReadingTypeForm,
  createReadingTypeColumns,
} from "./reading-type-config";
import {
  PriceScheme,
  PriceSchemeForm,
  createPriceSchemeColumns,
} from "./price-scheme-config";
import {
  EfficiencyTarget,
  EfficiencyTargetForm,
  createEfficiencyTargetColumns,
} from "./target-config";
import {
  createMeterCategoryColumns,
  MeterCategoryForm,
} from "./category-config";
import { createTaxColumns, TaxForm } from "./tax-config copy";

// Tipe untuk item data di tabel
export type MasterDataItem =
  | Meter
  | ReadingType
  | PriceScheme
  | EfficiencyTarget;
// Tipe untuk kunci sub-menu
export type SubMenuKey = keyof typeof SUB_MENU_CONFIG;

export const CATEGORY_CONFIG = {
  title: "Kategori",
  columns: createMeterCategoryColumns,
  filterKey: "name", // DIUBAH: filterKey yang benar adalah 'name'
  idKey: "category_id", // DIUBAH: idKey yang benar adalah 'category_id'
  api: masterData.category, // DIUBAH: Pastikan service-nya benar
  FormComponent: MeterCategoryForm,
};

export const TAX_CONFIG = {
  title: "Pajak",
  columns: createTaxColumns,
  filterKey: "tax_name",
  idKey: "tax_id",
  api: masterData.tax, // Pastikan service 'masterData.tax' ada
  FormComponent: TaxForm,
};
// Objek konfigurasi utama yang mengatur setiap tab
export const SUB_MENU_CONFIG = {
  meters: {
    title: "Meter",
    columns: createMeterColumns,
    filterKey: "meter_code",
    idKey: "meter_id",
    api: masterData.meter,
    FormComponent: MeterForm,
  },
  reading_types: {
    title: "Tipe Pembacaan",
    columns: createReadingTypeColumns,
    filterKey: "type_name",
    idKey: "reading_type_id",
    api: masterData.readingType,
    FormComponent: ReadingTypeForm,
  },
  price_schemes: {
    title: "Skema Harga",
    columns: createPriceSchemeColumns,
    filterKey: "scheme_name",
    idKey: "scheme_id",
    api: masterData.priceScheme,
    FormComponent: PriceSchemeForm,
  },
  efficiency_targets: {
    title: "Target Efisiensi",
    columns: createEfficiencyTargetColumns,
    filterKey: "kpi_name",
    idKey: "target_id",
    api: masterData.efficiencyTarget,
    FormComponent: EfficiencyTargetForm,
  },
};
