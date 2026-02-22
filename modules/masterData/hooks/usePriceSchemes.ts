// hooks/usePriceSchemes.ts
import { PriceSchemeType } from "@/common/types/schemaPrice";
import { SchemaFormValues } from "../schemas/schemaPrice.schema";
import {
  createPriceSchemeApi,
  deletePriceSchemeApi,
  getPriceSchemesApi,
  updatePriceSchemeApi,
} from "../services/priceSchema.service";
import { useResource } from "./useResource";

export function usePriceSchemes() {
  return useResource<PriceSchemeType, SchemaFormValues, "id">({
    key: ["priceSchemes"],
    idField: "id",
    api: {
      getAll: getPriceSchemesApi,
      create: createPriceSchemeApi,
      update: updatePriceSchemeApi,
      delete: deletePriceSchemeApi,
    },
  });
}
