/**
 * =============================================================================
 * SRIKANDI-Lite - Upload Form Component
 * =============================================================================
 * Komponen form untuk menambah arsip surat baru.
 * Form sederhana dengan upload file PDF ke Supabase Storage.
 * =============================================================================
 */

"use client";

import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { uploadFile, createArchive, ArchiveInput } from "@/lib/supabase";
import {
  FileUp,
  Send,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  File,
  X,
} from "lucide-react";

// -----------------------------------------------------------------------------
// Upload Form Component
// -----------------------------------------------------------------------------
export default function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Form State
  // ---------------------------------------------------------------------------
  const [formData, setFormData] = useState({
    nomor_surat: "",
    judul_surat: "",
    tanggal_surat: "",
    pengirim: "",
    kategori: "Surat Masuk" as "Surat Masuk" | "Surat Keluar",
    status: "Diterima",
  });

  // State untuk file yang dipilih
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // State untuk loading dan pesan
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ---------------------------------------------------------------------------
  // Handle perubahan input
  // ---------------------------------------------------------------------------
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ---------------------------------------------------------------------------
  // Handle pemilihan file
  // ---------------------------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi: hanya terima file PDF
      if (file.type !== "application/pdf") {
        setMessage({
          type: "error",
          text: "Hanya file PDF yang diperbolehkan!",
        });
        return;
      }

      // Validasi: maksimal 10MB
      if (file.size > 10 * 1024 * 1024) {
        setMessage({
          type: "error",
          text: "Ukuran file maksimal 10MB!",
        });
        return;
      }

      setSelectedFile(file);
      setMessage(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Hapus file yang dipilih
  // ---------------------------------------------------------------------------
  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ---------------------------------------------------------------------------
  // Handle submit form
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Variabel untuk menyimpan URL file
      let fileUrl: string | null = null;

      // Step 1: Upload file jika ada
      if (selectedFile) {
        // Generate nama file unik dengan timestamp dan nomor surat
        const safeNomorSurat = formData.nomor_surat.replace(
          /[^a-zA-Z0-9]/g,
          "-",
        );
        const fileName = `${Date.now()}-${safeNomorSurat}.pdf`;

        fileUrl = await uploadFile(selectedFile, fileName);

        if (!fileUrl) {
          throw new Error("Gagal mengupload file. Silakan coba lagi.");
        }
      }

      // Step 2: Simpan data arsip ke database
      const archiveData: ArchiveInput = {
        nomor_surat: formData.nomor_surat,
        judul_surat: formData.judul_surat,
        tanggal_surat: formData.tanggal_surat,
        pengirim: formData.pengirim,
        kategori: formData.kategori,
        file_url: fileUrl,
        status: formData.status,
      };

      const result = await createArchive(archiveData);

      if (!result) {
        throw new Error("Gagal menyimpan data arsip. Silakan coba lagi.");
      }

      // Sukses!
      setMessage({
        type: "success",
        text: "Arsip berhasil disimpan! Mengalihkan ke halaman utama...",
      });

      // Reset form
      setFormData({
        nomor_surat: "",
        judul_surat: "",
        tanggal_surat: "",
        pengirim: "",
        kategori: "Surat Masuk",
        status: "Diterima",
      });
      setSelectedFile(null);

      // Redirect ke halaman utama setelah 2 detik
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render Form
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <a
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke Beranda
        </a>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Arsip Baru</h1>
        <p className="text-gray-600 mt-1">
          Isi formulir di bawah untuk menambahkan arsip surat baru.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        {/* Pesan Sukses/Error */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nomor Surat */}
          <div>
            <label
              htmlFor="nomor_surat"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nomor Surat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nomor_surat"
              name="nomor_surat"
              value={formData.nomor_surat}
              onChange={handleInputChange}
              required
              placeholder="Contoh: 001/DPRD/I/2026"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Judul Surat */}
          <div>
            <label
              htmlFor="judul_surat"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Judul / Perihal Surat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="judul_surat"
              name="judul_surat"
              value={formData.judul_surat}
              onChange={handleInputChange}
              required
              placeholder="Contoh: Undangan Rapat Paripurna"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Grid: Tanggal & Kategori */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tanggal Surat */}
            <div>
              <label
                htmlFor="tanggal_surat"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tanggal Surat <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="tanggal_surat"
                name="tanggal_surat"
                value={formData.tanggal_surat}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Kategori */}
            <div>
              <label
                htmlFor="kategori"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                id="kategori"
                name="kategori"
                value={formData.kategori}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="Surat Masuk">Surat Masuk</option>
                <option value="Surat Keluar">Surat Keluar</option>
              </select>
            </div>
          </div>

          {/* Grid: Pengirim & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pengirim */}
            <div>
              <label
                htmlFor="pengirim"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pengirim / Asal Surat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="pengirim"
                name="pengirim"
                value={formData.pengirim}
                onChange={handleInputChange}
                required
                placeholder="Contoh: Dinas Pendidikan"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="Diterima">Diterima</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
                <option value="Dikirim">Dikirim</option>
              </select>
            </div>
          </div>

          {/* Upload File PDF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload File Surat (PDF)
            </label>

            {/* Area Upload */}
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Klik untuk memilih file atau drag & drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Hanya file PDF, maksimal 10MB
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="hidden"
                />
              </div>
            ) : (
              /* File yang dipilih */
              <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                  <File className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Tombol Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 text-white font-medium rounded-lg transition-colors ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sedang mengupload...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Simpan Arsip
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Tips:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Pastikan nomor surat unik dan tidak duplikat.</li>
          <li>
            • File PDF akan disimpan di cloud dan bisa diunduh kapan saja.
          </li>
          <li>• Semua field bertanda (*) wajib diisi.</li>
        </ul>
      </div>
    </div>
  );
}
