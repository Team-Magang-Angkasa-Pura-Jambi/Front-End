import api from "@/lib/api";

const prefix = "/calculation-templates";

export interface FormulaVariable {
  label: string;
  type: "reading" | "spec" | "constant";
  readingTypeId?: number;
  timeShift?: number;
  specField?: string;
  meterId?: number;
  value?: number;
}

export interface FormulaDefinition {
  def_id?: string;
  name: string;
  is_main: boolean;
  formula_items: {
    formula: string;
    variables: FormulaVariable[];
  };
}

export interface CalculationTemplate {
  template_id: string;
  name: string;
  description?: string | null;
  validations?: any;
  created_at?: string;
  updated_at?: string;
  definitions?: FormulaDefinition[];
  _count?: {
    meters: number;
  };
  creator?: {
    username: string;
  };
  updater?: {
    username: string;
  };
  meters?: Array<{
    meter_id: number;
    name: string;
    meter_code: string;
  }>;
}

export interface AvailableVariablesResponse {
  readings: Array<{
    id: number;
    name: string;
    unit: string;
  }>;
  timeContext: Array<{
    label: string;
    value: number;
  }>;
  specs: Array<{
    label: string;
    value: string;
    category?: string;
  }>;
  meters: Array<{
    id: number;
    code: string;
    name: string;
    category?: string;
  }>;
}

export interface CalculationTemplateListResponse {
  data: CalculationTemplate[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export const getCalculationTemplatesApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<CalculationTemplateListResponse> => {
  const response = await api.get(prefix, { params });
  return response.data;
};

export const getCalculationTemplateByIdApi = async (id: string): Promise<CalculationTemplate> => {
  const response = await api.get(`${prefix}/${id}`);
  return response.data.data;
};

export const getAvailableVariablesApi = async (): Promise<AvailableVariablesResponse> => {
  const response = await api.get(`${prefix}/availableVariables`);
  return response.data.data;
};

export const createCalculationTemplateApi = async (payload: {
  template: {
    name: string;
    description?: string;
    definitions: Array<{
      name: string;
      is_main?: boolean;
      formula_items: {
        formula: string;
        variables: FormulaVariable[];
      };
    }>;
  };
}) => {
  const response = await api.post(prefix, payload);
  return response.data;
};

export const updateCalculationTemplateApi = async (
  id: string,
  payload: {
    template: {
      name?: string;
      description?: string;
      definitions?: Array<{
        name: string;
        is_main?: boolean;
        formula_items: {
          formula: string;
          variables: FormulaVariable[];
        };
      }>;
    };
  }
) => {
  const response = await api.patch(`${prefix}/${id}`, payload);
  return response.data;
};

export const deleteCalculationTemplateApi = async (id: string) => {
  const response = await api.delete(`${prefix}/${id}`);
  return response.data;
};
