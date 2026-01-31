/**
 * =============================================================================
 * SRIKANDI-Lite - Supabase Client Configuration
 * =============================================================================
 * File ini berisi konfigurasi koneksi ke Supabase.
 * Pastikan environment variables sudah di-set di file .env.local
 * =============================================================================
 */

import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

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
    "\n\n❌ ERROR FATAL: Konfigurasi Supabase Hilang!\n" +
      "----------------------------------------------------\n" +
      "Environment Variables belum di-set. Aplikasi tidak bisa berjalan.\n\n" +
      "👉 SOLUSI LOCAL (Di Komputer Sendiri):\n" +
      "   Pastikan file .env.local ada dan berisi:\n" +
      "   NEXT_PUBLIC_SUPABASE_URL=...\n" +
      "   NEXT_PUBLIC_SUPABASE_ANON_KEY=...\n\n" +
      "👉 SOLUSI VERCEL (Saat Deploy):\n" +
      "   1. Buka Dashboard Project anda di Vercel\n" +
      "   2. Klik menu 'Settings' (di atas)\n" +
      "   3. Pilih menu 'Environment Variables' (di kiri)\n" +
      "   4. Masukkan Variable:\n" +
      "      - Key: NEXT_PUBLIC_SUPABASE_URL\n" +
      "      - Value: (Copy dari Supabase Project Settings)\n" +
      "   5. Tambah lagi:\n" +
      "      - Key: NEXT_PUBLIC_SUPABASE_ANON_KEY\n" +
      "      - Value: (Copy dari Supabase Project Settings)\n" +
      "   6. Redeploy project anda.\n" +
      "----------------------------------------------------\n",
  );
}

// -----------------------------------------------------------------------------
// Supabase Client Instance
// -----------------------------------------------------------------------------
// Gunakan instance yang sesuai dengan environment (Browser vs Server)
// - Di Browser: Gunakan createBrowserClient (dari @supabase/ssr) agar auth cookies bekerja
// - Di Server (Build Time/SSG): Gunakan createSupabaseClient (dari supabase-js) untuk fetch data public
export const supabase =
  typeof window !== "undefined"
    ? createBrowserClient(supabaseUrl, supabaseAnonKey)
    : createSupabaseClient(supabaseUrl, supabaseAnonKey);

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
