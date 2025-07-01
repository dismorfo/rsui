'use client'

import * as React from 'react'
import { Link } from '@inertiajs/react'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'

import type {
  ColumnDef,
  ColumnFiltersState
} from '@tanstack/react-table'

import type {
  Collection,
  CollectionTableProps,
  Partner,
  PartnersTableProps
} from '@/types'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = React.useState(initialValue)

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout) // eslint-disable-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <input {...props} value={value} onChange={e => setValue(e.target.value)} />
  )
}

export function PartnersTable({ partners }: PartnersTableProps) {

  const [ columnFilters, setColumnFilters ] = React.useState<ColumnFiltersState>([])

  const [ globalFilter, setGlobalFilter ] = React.useState('')

  const columns = React.useMemo<ColumnDef<Partner, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <div className="flex flex-col items-start">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Partner
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          return (
            <div className="text-left font-medium">
              <Link href={route('partner.show', row.getValue('id'))} className="flex items-center px-4 focus:outline-none">
                {row.getValue('name')}
              </Link>
            </div>
          )
        },
        enableSorting: true,
        filterFn: 'includesStringSensitive',
      },
      {
        accessorKey: 'code',
        header: () => (
          <div className="flex flex-col items-start">
            <div className="text-left py-2 px-4">Code</div>
          </div>
        ),
        enableSorting: true,
        filterFn: 'includesStringSensitive',
        cell: ({ row }) => {
          return (
            <div className="text-left font-medium">
              <Link href={route('partner.show', row.getValue('id'))} className="flex items-center px-4 focus:outline-none">
                {row.getValue('code')}
              </Link>
            </div>
          )
        },
      },
      {
        accessorKey: "path",
        header: () => (
          <div className="flex flex-col items-start">
            <div className="text-left py-2 px-4">R* Path</div>
          </div>
        ),
        cell: ({ row }) => {
          return (
            <div className="text-left font-medium">
              <Link href={route('partner.show', row.getValue('id'))} className="flex items-center px-4 focus:outline-none">
                {row.getValue('path')}
              </Link>
            </div>
          )
        },
      },
      {
        accessorKey: "id",
        header: () => <></>,
        cell: ({ row }) => {
          return (
            <Link href={route('collection.show', row.getValue('id'))} className="flex items-center px-4 focus:outline-none">
              <ChevronRight size={24} className="text-gray-400" />
            </Link>
          )
        },
      },
    ],
    []
  )

  // Initialize data state with partners and update if partners prop changes
  const [ data, setData ] = React.useState<Partner[]>(partners)

  React.useEffect(() => {
    setData(partners)
  }, [partners])

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      globalFilter,
    },
    initialState: {
      columnOrder: [ 'name', 'code' ],
      columnVisibility: {
        id: true,
      },
      sorting: [
        {
          id: 'name',
          desc: false,
        },
      ],
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  return (
    <div>
      <div className="flex items-center py-4">
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-sm"
          placeholder="Filter by partner name or code"
        />
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
                  )
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
                  className="group odd:bg-muted [&>td]:whitespace-nowrap [&>td]:hover:bg-gray-100 dark:[&>td]:hover:bg-gray-400"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function PartnerCollectionsTable({ collections }: CollectionTableProps) {

  const [ columnFilters, setColumnFilters ] = React.useState<ColumnFiltersState>([])

  const [ globalFilter, setGlobalFilter ] = React.useState('')

  const columns = React.useMemo<ColumnDef<Collection[], any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <div className="flex flex-col items-start">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Collection name
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          return (
            <div className="text-left font-medium">
              <a href={`/collections/${row.getValue('id')}`}>{row.getValue('name')}</a>
            </div>
          )
        },
        enableSorting: true,
        filterFn: 'includesStringSensitive',
      },
      {
        accessorKey: 'display_code',
        header: () => (
          <div className="flex flex-col items-start">
            <div className="text-left py-2 px-4">Code</div>
          </div>
        ),
        enableSorting: true,
        filterFn: 'includesStringSensitive',
      },
      {
        accessorKey: "path",
        header: () => (
          <div className="flex flex-col items-start">
            <div className="text-left py-2 px-4">R* Path</div>
          </div>
        ),
        cell: ({ row }) => {
          return (
            <div className="text-left font-medium">
              <Link href={route('partner.show', row.getValue('id'))} className="flex items-center px-4 focus:outline-none">
                {row.getValue('path')}
              </Link>
            </div>
          )
        },
      },
      {
        accessorKey: "id",
        header: () => <div className="text-left">Unique Id</div>,
      },
    ],
    []
  )

  // Initialize data state with partners and update if partners prop changes
  const [ data, setData ] = React.useState<Collection[]>(collections)

  React.useEffect(() => {
    setData(collections)
  }, [collections])

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      globalFilter,
    },
    initialState: {
      columnOrder: [ 'name', 'code' ],
      columnVisibility: {
        id: false,
      },
      sorting: [
        {
          id: 'name',
          desc: false,
        },
      ],
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString', // https://tanstack.com/table/v8/docs/api/features/column-filtering
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  return (
    <div>
      <div className="flex items-center py-4">
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-sm"
          placeholder="Find by collection name or code..."
        />
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
                  )
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
