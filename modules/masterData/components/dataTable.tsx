import { ColumnDef } from "@tanstack/react-table";

// Helper function to get nested property value
const getNestedValue = (obj: any, path: string) => {
  return path.split(".").reduce((acc, part) => {
    return acc && acc[part];
  }, obj);
};

export const DataTable = <TData, TValue>({
  columns,
  data,
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}) => {
  return (
    // PERBAIKAN: Menambahkan overflow-x-auto agar tabel dapat di-scroll secara horizontal di layar kecil
    <div className="w-full overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr className="border-b">
            {columns.map((column, index) => {
              const headerContent =
                typeof column.header === "function"
                  ? column.header({} as unknown)
                  : column.header;
              return (
                <th
                  key={index}
                  className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                >
                  {String(headerContent)}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b transition-colors hover:bg-muted/50"
              >
                {columns.map((column, colIndex) => {
                  let cellContent: React.ReactNode = null;

                  if (column.cell) {
                    // Jika ada fungsi cell, gunakan itu
                    cellContent = (column.cell as any)({
                      row: { original: row },
                    });
                  } else if ("accessorKey" in column && column.accessorKey) {
                    // Jika tidak, gunakan accessorKey untuk mengambil data
                    cellContent = getNestedValue(
                      row,
                      column.accessorKey as string
                    );
                  }
                  return (
                    <td key={colIndex} className="p-4 align-middle">
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center">
                Tidak ada data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
