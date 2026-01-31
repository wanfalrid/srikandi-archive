/**
 * =============================================================================
 * SRIKANDI-Lite - Supabase Client Configuration
 * =============================================================================
 * File ini berisi konfigurasi koneksi ke Supabase.
 * Pastikan environment variables sudah di-set di file .env.local
 * =============================================================================
 */

import { createBrowserClient } from "@supabase/ssr";

// -----------------------------------------------------------------------------
// Environment Variables
// -----------------------------------------------------------------------------
// Ambil URL dan Anonymous Key dari environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------
// Pastikan environment variables sudah di-set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL dan Anon Key harus di-set di environment variables!\n" +
      "Buat file .env.local dengan isi:\n" +
      "NEXT_PUBLIC_SUPABASE_URL=your-supabase-url\n" +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key",
  );
}

// -----------------------------------------------------------------------------
// Supabase Client Instance
// -----------------------------------------------------------------------------
// Buat instance Supabase client untuk digunakan di seluruh aplikasi (Client Side)
// Menggunakan createBrowserClient agar session tersimpan di Cookies
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------
// Tipe data untuk record di tabel archives
export type Archive = {
  id: string;
  created_at: string;
  nomor_surat: string;
  judul_surat: string;
  kategori: "Surat Masuk" | "Surat Keluar";
  tanggal_surat: string;
  pengirim: string;
  file_url: string | null;
  status: string;
};

// Tipe data untuk form input (tanpa id dan created_at)
export type ArchiveInput = Omit<Archive, "id" | "created_at">;

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------
/**
 * Upload file ke Supabase Storage dan dapatkan public URL
 * @param file - File yang akan diupload
 * @param fileName - Nama file (opsional, akan di-generate jika tidak ada)
 * @returns Public URL dari file yang diupload
 */
export async function uploadFile(
  file: File,
  fileName?: string,
): Promise<string | null> {
  // Generate nama file unik jika tidak diberikan
  const uniqueFileName = fileName || `${Date.now()}-${file.name}`;

  // Upload file ke bucket 'srikandi-files'
  const { data, error } = await supabase.storage
    .from("srikandi-files")
    .upload(uniqueFileName, file, {
      cacheControl: "3600",
      upsert: false, // Jangan timpa file yang sudah ada
    });

  if (error) {
    console.error("Error uploading file:", error.message);
    return null;
  }

  // Dapatkan public URL dari file yang diupload
  const { data: urlData } = supabase.storage
    .from("srikandi-files")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Ambil semua data arsip dari database
 * @returns Array of Archive records
 */
export async function getArchives(): Promise<Archive[]> {
  const { data, error } = await supabase
    .from("archives")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching archives:", error.message);
    return [];
  }

  return data || [];
}

/**
 * Tambah arsip baru ke database
 * @param archive - Data arsip yang akan ditambahkan
 * @returns Archive record yang baru dibuat, atau null jika gagal
 */
export async function createArchive(
  archive: ArchiveInput,
): Promise<Archive | null> {
  const { data, error } = await supabase
    .from("archives")
    .insert([archive])
    .select()
    .single();

  if (error) {
    console.error("Error creating archive:", error.message);
    return null;
  }

  return data;
}

/**
 * Hitung jumlah arsip berdasarkan kategori
 * @param kategori - 'Surat Masuk' atau 'Surat Keluar'
 * @returns Jumlah arsip
 */
export async function countArchivesByKategori(
  kategori: "Surat Masuk" | "Surat Keluar",
): Promise<number> {
  const { count, error } = await supabase
    .from("archives")
    .select("*", { count: "exact", head: true })
    .eq("kategori", kategori);

  if (error) {
    console.error("Error counting archives:", error.message);
    return 0;
  }

  return count || 0;
}

/**
 * Hitung jumlah arsip yang dibuat bulan ini
 * @returns Jumlah arsip bulan ini
 */
export async function countArchivesThisMonth(): Promise<number> {
  // Dapatkan tanggal awal bulan ini
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const { count, error } = await supabase
    .from("archives")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString());

  if (error) {
    console.error("Error counting archives this month:", error.message);
    return 0;
  }

  return count || 0;
}
