import { User } from "@/types/users.types";
import { FormUserValues } from "./schemas/user.schema";

export interface UserFormProps {
  onSubmit: (values: FormUserValues) => void;
  isPending: boolean;
  defaultValues?: Partial<User>;
}
