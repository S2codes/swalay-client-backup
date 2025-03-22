"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import React from "react";

export type Payment = {
    _id: string;
    labelId: string;
    amount: string;
    status: boolean;
    payout_report_url: string;
    type: string;
    time: string;
};


export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "serial",
    header: "S.No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "type",
    header: () => <div className="">Type</div>,
    cell: ({ row }) => {
      const type = row.getValue("type");
      // const color = type === "Royalty" ? "text-green-600" : "text-red-600"; // Conditional color
      return <div className={`font-medium `}>{String(type)}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const type = row.original.type; // Access the type from the row's original data
      const color = type === "Royalty" ? "text-green-600" : "text-red-600"; // Conditional color
      const icon = type === "Penalty" ? "-" : "+"; // Conditional color
      return <div className={`font-medium ${color}`}>{icon} ₹ {amount}</div>;
    },
  },
  {
    accessorKey: "payout_report_url",
    header: () => <div className="text-right">Report</div>,
    cell: ({ row }) => {
      const payout_report_url = row.getValue("payout_report_url") as string | undefined;
      
      return (
        <div className="text-right font-medium p-1">
          {payout_report_url ? (
            <Link 
            href={` ${process.env.NEXT_PUBLIC_AWS_S3_FOLDER_PATH}labels/payments/payoutReports/${payout_report_url}`} 
            target="_blank"
            className="bg-red-100 text-red-800 text-xs font-medium me-2 px-3 py-2 rounded dark:bg-red-900 dark:text-red-300"
            >
              <i className="bi bi-filetype-pdf"></i> View Report
            </Link>
          ) : (
            <span
             className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300"
            >No Report</span>
          )}
        </div>
      );
    },
  },  

  {
    accessorKey: "time",
    header: () => <div className="text-right">Date</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("time"));
      const localDate =  date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return <div className="text-right font-medium"> {localDate}</div>;

    },
  },
  
];



export function PaymentList({ data }: { data: Payment[] }) {

  console.log("data in table");
  console.log();
  
  
// export function PaymentList() {

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <h2 className="mt-5 text-3xl font-bold mb-2 capitalize ">Earning History</h2>
      <div className="flex items-center py-4">
        
        
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
