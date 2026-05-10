import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminTableProps = {
  columns: string[];
  rows: Array<Array<React.ReactNode>>;
};

export function AdminTable({ columns, rows }: AdminTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <Table className="min-w-[760px]">
        <TableHeader className="bg-muted/60">
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column}
                className="px-5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="text-foreground/80">
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} className="px-5 py-4 align-middle">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
