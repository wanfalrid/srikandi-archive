/**
 * =============================================================================
 * SRIKANDI-Lite - Dashboard Page
 * =============================================================================
 * Halaman utama aplikasi yang menampilkan:
 * - 3 Summary Cards: Total Surat Masuk, Total Surat Keluar, Arsip Baru Bulan Ini
 * - Tabel arsip dengan fitur Excel-like
 * =============================================================================
 */

import { Suspense } from "react";
import {
  countArchivesByKategori,
  countArchivesThisMonth,
} from "@/lib/supabase";
import ArchiveTable from "@/components/ArchiveTable";
import Header from "@/components/Header";
import { Mail, Send, CalendarDays } from "lucide-react";

// -----------------------------------------------------------------------------
// Summary Card Component
// -----------------------------------------------------------------------------
interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "green" | "blue" | "purple";
  description?: string;
}

function SummaryCard({
  title,
  value,
  icon,
  color,
  description,
}: SummaryCardProps) {
  const colorClasses = {
    green: "bg-green-50 border-green-200 text-green-600",
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
  };

  const iconBgClasses = {
    green: "bg-green-100",
    blue: "bg-blue-100",
    purple: "bg-purple-100",
  };

  return (
    <div
      className={`rounded-lg border p-5 ${colorClasses[color]} transition-transform hover:scale-[1.02]`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${iconBgClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Dashboard Stats Component (Server Component)
// -----------------------------------------------------------------------------
async function DashboardStats() {
  // Fetch data dari Supabase (berjalan di server)
  const [suratMasuk, suratKeluar, arsipBulanIni] = await Promise.all([
    countArchivesByKategori("Surat Masuk"),
    countArchivesByKategori("Surat Keluar"),
    countArchivesThisMonth(),
  ]);

  // Nama bulan dalam Bahasa Indonesia
  const namaBulan = new Date().toLocaleDateString("id-ID", { month: "long" });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <SummaryCard
        title="Total Surat Masuk"
        value={suratMasuk}
        icon={<Mail className="h-6 w-6" />}
        color="green"
        description="Seluruh surat masuk"
      />
      <SummaryCard
        title="Total Surat Keluar"
        value={suratKeluar}
        icon={<Send className="h-6 w-6" />}
        color="blue"
        description="Seluruh surat keluar"
      />
      <SummaryCard
        title="Arsip Baru Bulan Ini"
        value={arsipBulanIni}
        icon={<CalendarDays className="h-6 w-6" />}
        color="purple"
        description={`Bulan ${namaBulan}`}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Loading Component untuk Stats
// -----------------------------------------------------------------------------
function StatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg border bg-gray-50 border-gray-200 p-5 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-8 w-16 bg-gray-200 rounded mt-2"></div>
            </div>
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main Dashboard Page
// -----------------------------------------------------------------------------
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header dengan User Menu */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <Suspense fallback={<StatsLoading />}>
          <DashboardStats />
        </Suspense>

        {/* Archive Table Section */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Daftar Arsip Surat
          </h2>
          <p className="text-sm text-gray-600">
            Klik header kolom untuk mengurutkan, atau gunakan kotak pencarian.
          </p>
        </div>

        {/* Archive Table */}
        <ArchiveTable />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2026 SRIKANDI-Lite - Sistem Arsip Digital DPRD. Dibuat oleh Wina Ambar Yustika ❤️.
          </p>
        </div>
      </footer>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Metadata untuk SEO
// -----------------------------------------------------------------------------
export const metadata = {
  title: "SRIKANDI-Lite - Dashboard",
  description: "Sistem Arsip Digital DPRD - Pengelolaan surat masuk dan keluar",
};

// -----------------------------------------------------------------------------
// Revalidate setiap 60 detik (ISR)
// -----------------------------------------------------------------------------
export const revalidate = 60;
