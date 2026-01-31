/**
 * =============================================================================
 * SRIKANDI-Lite - Archive Table Component
 * =============================================================================
 * Komponen tabel untuk menampilkan data arsip dalam format Excel-like.
 * Menggunakan @tanstack/react-table untuk fitur sorting, filtering, dll.
 * =============================================================================
 */

"use client";

import { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { Archive, getArchives } from "@/lib/supabase";
import {
  Download,
  ArrowUpDown,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// -----------------------------------------------------------------------------
// Column Helper untuk type-safe column definitions
// -----------------------------------------------------------------------------
const columnHelper = createColumnHelper<Archive>();

// -----------------------------------------------------------------------------
// Format tanggal ke format Indonesia (DD/MM/YYYY)
// -----------------------------------------------------------------------------
function formatTanggal(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// -----------------------------------------------------------------------------
// Archive Table Component
// -----------------------------------------------------------------------------
export default function ArchiveTable() {
  // State untuk data arsip
  const [data, setData] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk sorting
  const [sorting, setSorting] = useState<SortingState>([]);

  // State untuk pencarian global
  const [globalFilter, setGlobalFilter] = useState("");

  // ---------------------------------------------------------------------------
  // Fetch data dari Supabase saat komponen dimount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const archives = await getArchives();
      setData(archives);
      setLoading(false);
    }
    fetchData();
  }, []);

  // ---------------------------------------------------------------------------
  // Definisi kolom tabel
  // ---------------------------------------------------------------------------
  const columns = useMemo(
    () => [
      // Kolom: Nomor Surat
      columnHelper.accessor("nomor_surat", {
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-semibold hover:text-blue-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            No. Surat
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => (
          <span className="font-medium text-gray-900">{info.getValue()}</span>
        ),
      }),

      // Kolom: Tanggal Surat
      columnHelper.accessor("tanggal_surat", {
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-semibold hover:text-blue-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tanggal
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => formatTanggal(info.getValue()),
      }),

      // Kolom: Pengirim
      columnHelper.accessor("pengirim", {
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-semibold hover:text-blue-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Pengirim
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => info.getValue(),
      }),

      // Kolom: Judul Surat
      columnHelper.accessor("judul_surat", {
        header: "Judul",
        cell: (info) => (
          <span className="line-clamp-2" title={info.getValue()}>
            {info.getValue()}
          </span>
        ),
      }),

      // Kolom: Kategori (dengan badge)
      columnHelper.accessor("kategori", {
        header: "Kategori",
        cell: (info) => {
          const kategori = info.getValue();
          const isMasuk = kategori === "Surat Masuk";
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                isMasuk
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {kategori}
            </span>
          );
        },
      }),

      // Kolom: Status
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            {info.getValue()}
          </span>
        ),
      }),

      // Kolom: Aksi (Download)
      columnHelper.accessor("file_url", {
        header: "Aksi",
        cell: (info) => {
          const fileUrl = info.getValue();
          if (!fileUrl) {
            return (
              <span className="text-gray-400 text-xs">Tidak ada file</span>
            );
          }
          return (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              title="Download File"
            >
              <Download className="h-3 w-3" />
              Unduh
            </a>
          );
        },
      }),
    ],
    [],
  );

  // ---------------------------------------------------------------------------
  // Inisialisasi tabel dengan @tanstack/react-table
  // ---------------------------------------------------------------------------
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Memuat data arsip...</span>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Empty State
  // ---------------------------------------------------------------------------
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Belum ada arsip
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Mulai dengan menambahkan arsip surat baru.
          </p>
          <div className="mt-6">
            <a
              href="/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Tambah Arsip Baru
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render Tabel
  // ---------------------------------------------------------------------------
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari arsip (nomor surat, pengirim, judul...)"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table Container - Excel-like styling */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          {/* Table Header */}
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300 last:border-r-0"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Table Body - Zebra striping untuk Excel-like look */}
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={`
                  ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  hover:bg-blue-50 transition-colors
                `}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-2 text-sm text-gray-700 border-r border-gray-200 last:border-r-0 whitespace-nowrap"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="text-sm text-gray-600">
          Menampilkan{" "}
          <span className="font-medium">
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}
          </span>{" "}
          -{" "}
          <span className="font-medium">
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              data.length,
            )}
          </span>{" "}
          dari <span className="font-medium">{data.length}</span> arsip
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Previous */}
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Sebelumnya
          </button>

          {/* Info Halaman */}
          <span className="text-sm text-gray-600">
            Halaman{" "}
            <span className="font-medium">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            dari <span className="font-medium">{table.getPageCount()}</span>
          </span>

          {/* Tombol Next */}
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Berikutnya
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
