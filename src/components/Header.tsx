/**
 * =============================================================================
 * SRIKANDI-Lite - Header Component
 * =============================================================================
 * Komponen header yang menampilkan logo, navigasi, info user, dan tombol logout.
 * =============================================================================
 */

"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  Plus,
  LogOut,
  User,
  ChevronDown,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function Header() {
  const { user, signOut, loading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ---------------------------------------------------------------------------
  // Handle Logout
  // ---------------------------------------------------------------------------
  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
  };

  // ---------------------------------------------------------------------------
  // Get user display name (email atau nama)
  // ---------------------------------------------------------------------------
  const getUserDisplayName = () => {
    if (!user) return "User";
    // Ambil bagian sebelum @ dari email
    const emailName = user.email?.split("@")[0];
    return emailName || "User";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">SRIKANDI-Lite</h1>
              <p className="text-xs text-gray-500">Sistem Arsip Digital DPRD</p>
            </div>
          </Link>

          {/* Right Side: Add Button + User Menu */}
          <div className="flex items-center gap-4">
            {/* Tombol Tambah Arsip */}
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Tambah Arsip</span>
            </Link>

            {/* User Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="hidden sm:inline font-medium max-w-[120px] truncate">
                    {getUserDisplayName()}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    />

                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {loggingOut ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Keluar...
                          </>
                        ) : (
                          <>
                            <LogOut className="h-4 w-4" />
                            Keluar dari Akun
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
