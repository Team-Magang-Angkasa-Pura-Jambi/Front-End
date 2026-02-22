import { EfficiencyTarget } from "@/common/types/efficiencyTarget";
import { TargetEfficiencyFormValues } from "../schemas/targetEfficiency.schema";
import {
  createEfficiencyTargetApi,
  deleteEfficiencyTargetApi,
  EfficiencyTargetQueryParams,
  getEfficiencyTargetsApi,
  updateEfficiencyTargetApi,
} from "../services/targetEfficiency.service";
import { useResource } from "./useResource";

export function useEfficiencyTargets() {
  return useResource<
    EfficiencyTarget,
    TargetEfficiencyFormValues,
    "target_id",
    EfficiencyTargetQueryParams
  >({
    key: ["efficiencyTargets"],
    idField: "target_id",
    api: {
      getAll: getEfficiencyTargetsApi,

      create: (data) => createEfficiencyTargetApi(data),

      update: (id, data) => updateEfficiencyTargetApi(id, data),

      delete: (id) => deleteEfficiencyTargetApi(id),
    },
  });
}
