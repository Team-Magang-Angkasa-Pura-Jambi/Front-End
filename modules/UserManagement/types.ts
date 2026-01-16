import { User } from "@/common/types/user";
import { FormUserValues } from "./schemas/user.schema";

export interface UserFormProps {
  onSubmit: (values: FormUserValues) => void;
  isPending: boolean;
  defaultValues?: Partial<User>;
}
