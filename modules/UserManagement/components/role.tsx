"use client";

import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import { getRolesApi, Role } from "@/services/role.service";
import { DataTable } from "@/common/components/table/dataTable";

const createRoleColumns = (): ColumnDef<Role>[] => [
  {
    accessorKey: "role_name",
    header: "Nama Peran",
  },
];

export default function RolesPage() {
  const { data: rolesResponse, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: getRolesApi,
  });
  const roles = rolesResponse?.data || [];

  const columns = useMemo(() => createRoleColumns(), []);

  return (
    <div className="space-y-6">
      <DataTable columns={columns} data={roles} isLoading={isLoading} />
    </div>
  );
}
