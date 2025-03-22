"use client";

import * as React from "react";

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
export type Song = {
  _id: string;
  Album: string;
  ArtistName: string;
  Composer: string;
  Duration: string;
  ISRC: string;
  Label: string;
  Language: string;
  Lyricist: string;
  Song: string;
  Stats: string;
  UPC: string;
};

export const songColumns: ColumnDef<Song>[] = [
  {
    accessorKey: "srno",
    header: "Sr No",
    cell: (info) => info.row.index + 1,
  },
{
    accessorKey: "Album",
    header: "Album",
    cell: ({ row }) => {
      const albumName = row.getValue("Album") as string;
      const isrc = row.original.ISRC; // Assuming `isrc` is available in the row data
  
      return (
        <Link href={`/albums/olddata/viewalbum?isrc=${isrc}`} className="text-blue-500 hover:underline">
          {albumName}
        </Link>
      );
    },
  },
  {
    accessorKey: "ArtistName",
    header: "Artist",
    cell: ({ row }) => {
      const artistName = row.getValue("ArtistName") as string;
      return <div>{artistName.replace(/\|/g, ", ")}</div>;
    },
  },  
  {
    accessorKey: "Composer",
    header: "Composer",
  },
  {
    accessorKey: "Lyricist",
    header: "Lyricist",
  },
//   {
//     accessorKey: "Duration",
//     header: "Duration",
//   },
  {
    accessorKey: "ISRC",
    header: "ISRC",
  },
  {
    accessorKey: "Label",
    header: "Label",
  },
  {
    accessorKey: "Language",
    header: "Language",
  },
  {
    accessorKey: "UPC",
    header: "UPC",
  },
];

export function OldAlbumsDataTable({ data }: { data: Song[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns: songColumns,
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
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter albums..."
          value={(table.getColumn("Album")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("Album")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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
                  colSpan={songColumns.length}
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
  );
}
