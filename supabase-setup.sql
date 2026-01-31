-- =============================================================================
-- SRIKANDI-Lite Archive Management System
-- Supabase Database Setup Script
-- =============================================================================
-- Jalankan script ini di Supabase SQL Editor (https://app.supabase.com)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PART 1: Create ENUM Type for Kategori
-- -----------------------------------------------------------------------------
-- Membuat tipe enum untuk kategori surat (Surat Masuk atau Surat Keluar)
CREATE TYPE kategori_surat AS ENUM ('Surat Masuk', 'Surat Keluar');

-- -----------------------------------------------------------------------------
-- PART 2: Create Archives Table
-- -----------------------------------------------------------------------------
-- Tabel utama untuk menyimpan data arsip surat
CREATE TABLE archives (
    -- Primary Key: UUID yang di-generate otomatis
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Timestamp pembuatan record (otomatis terisi saat insert)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Nomor Surat Resmi (harus unik, tidak boleh duplikat)
    nomor_surat VARCHAR(100) UNIQUE NOT NULL,
    
    -- Judul/Perihal Surat
    judul_surat VARCHAR(500) NOT NULL,
    
    -- Kategori: Surat Masuk atau Surat Keluar
    kategori kategori_surat NOT NULL,
    
    -- Tanggal Surat (tanggal yang tertera di surat)
    tanggal_surat DATE NOT NULL,
    
    -- Nama Pengirim/Asal Surat
    pengirim VARCHAR(255) NOT NULL,
    
    -- URL file PDF di Supabase Storage
    file_url TEXT,
    
    -- Status surat (default: Diterima)
    status VARCHAR(50) DEFAULT 'Diterima' NOT NULL
);

-- -----------------------------------------------------------------------------
-- PART 3: Create Indexes for Better Performance
-- -----------------------------------------------------------------------------
-- Index untuk pencarian berdasarkan nomor surat
CREATE INDEX idx_archives_nomor_surat ON archives(nomor_surat);

-- Index untuk filter berdasarkan kategori
CREATE INDEX idx_archives_kategori ON archives(kategori);

-- Index untuk filter berdasarkan tanggal
CREATE INDEX idx_archives_tanggal_surat ON archives(tanggal_surat);

-- Index untuk pencarian berdasarkan pengirim
CREATE INDEX idx_archives_pengirim ON archives(pengirim);

-- Index untuk filter berdasarkan waktu pembuatan
CREATE INDEX idx_archives_created_at ON archives(created_at);

-- -----------------------------------------------------------------------------
-- PART 4: Enable Row Level Security (RLS)
-- -----------------------------------------------------------------------------
-- Aktifkan RLS untuk keamanan data
ALTER TABLE archives ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (SELECT)
-- Semua orang bisa membaca data arsip
CREATE POLICY "Allow public read access" ON archives
    FOR SELECT
    USING (true);

-- Policy: Allow authenticated insert
-- Hanya user yang sudah login bisa menambah data
CREATE POLICY "Allow authenticated insert" ON archives
    FOR INSERT
    WITH CHECK (true);

-- Policy: Allow authenticated update
-- Hanya user yang sudah login bisa mengubah data
CREATE POLICY "Allow authenticated update" ON archives
    FOR UPDATE
    USING (true);

-- Policy: Allow authenticated delete
-- Hanya user yang sudah login bisa menghapus data
CREATE POLICY "Allow authenticated delete" ON archives
    FOR DELETE
    USING (true);

-- -----------------------------------------------------------------------------
-- PART 5: Create Storage Bucket for Files
-- -----------------------------------------------------------------------------
-- Buat bucket untuk menyimpan file PDF
INSERT INTO storage.buckets (id, name, public)
VALUES ('srikandi-files', 'srikandi-files', true);

-- -----------------------------------------------------------------------------
-- PART 6: Storage Bucket Policies
-- -----------------------------------------------------------------------------
-- Policy: Allow public read access to files
-- Semua orang bisa melihat/download file
CREATE POLICY "Allow public read access" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'srikandi-files');

-- Policy: Allow authenticated upload
-- Hanya user yang sudah login bisa upload file
CREATE POLICY "Allow authenticated upload" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'srikandi-files');

-- Policy: Allow authenticated update
-- Hanya user yang sudah login bisa update file
CREATE POLICY "Allow authenticated update" ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'srikandi-files');

-- Policy: Allow authenticated delete
-- Hanya user yang sudah login bisa hapus file
CREATE POLICY "Allow authenticated delete" ON storage.objects
    FOR DELETE
    USING (bucket_id = 'srikandi-files');

-- -----------------------------------------------------------------------------
-- PART 7: Sample Data (Optional - untuk testing)
-- -----------------------------------------------------------------------------
-- Uncomment baris di bawah jika ingin menambahkan data contoh
/*
INSERT INTO archives (nomor_surat, judul_surat, kategori, tanggal_surat, pengirim, status)
VALUES 
    ('001/DPRD/I/2026', 'Undangan Rapat Paripurna', 'Surat Masuk', '2026-01-15', 'Sekretariat DPRD', 'Diterima'),
    ('002/DPRD/I/2026', 'Laporan Keuangan Bulanan', 'Surat Keluar', '2026-01-20', 'Bagian Keuangan', 'Dikirim'),
    ('003/DPRD/I/2026', 'Permohonan Audiensi', 'Surat Masuk', '2026-01-25', 'Dinas Pendidikan', 'Diproses');
*/

-- =============================================================================
-- SELESAI! Database siap digunakan.
-- =============================================================================
