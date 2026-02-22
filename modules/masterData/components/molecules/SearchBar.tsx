import { Input } from "@/common/components/ui/input";
import { LayoutGrid, Search } from "lucide-react";
import { useMeter } from "../../context/MeterContext";

export const SearchBar = () => {
  const { searchQuery, setSearchQuery, filteredMeters } = useMeter();
  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-lg sm:flex-row sm:items-center">
      <div className="relative w-full sm:w-72 lg:w-96">
        <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
        <Input
          placeholder="Cari berdasarkan nama atau kode..."
          className="bg-background border-input pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <LayoutGrid className="h-4 w-4" />
        <span>Total: {filteredMeters.length} Meter</span>
      </div>
    </div>
  );
};
