import { User } from "@/types/users.types";
import * as z from "zod";

export const formSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter."),
  password: z.string().optional(),
  role_id: z.coerce.number().min(1, "Peran harus dipilih."),
});

export interface UserFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isPending: boolean;
  defaultValues?: Partial<User>;
}
