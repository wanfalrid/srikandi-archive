/**
 * =============================================================================
 * SRIKANDI-Lite - Upload Page
 * =============================================================================
 * Halaman untuk menambahkan arsip surat baru.
 * =============================================================================
 */

import UploadForm from "@/components/UploadForm";
import Header from "@/components/Header";

// -----------------------------------------------------------------------------
// Upload Page Component
// -----------------------------------------------------------------------------
export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header dengan User Menu */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UploadForm />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2026 SRIKANDI-Lite - Sistem Arsip Digital DPRD. Dibuat oleh Wina
            Ambar Yustika ❤️.
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
  title: "Tambah Arsip Baru - SRIKANDI-Lite",
  description: "Tambahkan arsip surat baru ke sistem SRIKANDI-Lite",
};
