"use client";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Location } from "@/common/types/location";
import { Tenant } from "@/common/types/tenant";
import { Edit2, Phone, User } from "lucide-react";
import { useEntityManager } from "../../hooks/useEntityManagement";

interface EntityListProps<T extends Tenant | Location> {
  type: "tenant" | "location";
}

export const EntityListContent = <T extends Tenant | Location>({ type }: EntityListProps<T>) => {
  const { data, isLoading, setEditingData } = useEntityManager<T>(type);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted h-24 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  // JIKA TYPE ADALAH TENANT (Tampilan Grid/Card)
  if (type === "tenant") {
    const tenants = data as Tenant[];
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tenants.map((item) => (
          <div
            key={item.tenant_id}
            className="group bg-card relative rounded-xl border p-4 transition-all hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between">
              <h4 className="text-primary leading-tight font-bold">{item.name}</h4>
              <Badge variant="secondary" className="text-[10px]">
                {item.category}
              </Badge>
            </div>
            <div className="text-muted-foreground space-y-1 text-sm">
              <p className="flex items-center gap-2">
                <User size={14} /> {item.contact_person}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} /> {item.phone}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => setEditingData(item as unknown as T)}
            >
              <Edit2 size={14} />
            </Button>
          </div>
        ))}
      </div>
    );
  }

  // JIKA TYPE ADALAH LOCATION (Tampilan List/Row)
  const locations = data as Location[];
  return (
    <div className="space-y-3">
      {locations.map((item) => (
        <div
          key={item.location_id}
          className="bg-muted/20 border-primary hover:bg-muted/40 flex items-center justify-between rounded-lg border-l-4 p-3 transition-all"
        >
          <div>
            <span className="block font-semibold text-slate-900 dark:text-slate-100">
              {item.name}
            </span>
            <p className="text-muted-foreground text-[10px]">
              {item._count?.meters ?? 0} Meter Terpasang • {item._count?.children ?? 0} Sub-lokasi
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setEditingData(item as unknown as T)}>
            Edit
          </Button>
        </div>
      ))}
    </div>
  );
};
