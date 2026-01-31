/**
 * =============================================================================
 * SRIKANDI-Lite - Login Page
 * =============================================================================
 * Halaman login untuk autentikasi pengguna.
 * Menggunakan Supabase Auth dengan email dan password.
 * =============================================================================
 */

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  LogIn,
  UserPlus,
  Loader2,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, loading: authLoading } = useAuth();

  // ---------------------------------------------------------------------------
  // Form State
  // ---------------------------------------------------------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // ---------------------------------------------------------------------------
  // Handle Form Submit
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        // Register new user
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setSuccess(
            "Registrasi berhasil! Silakan cek email Anda untuk verifikasi.",
          );
          setIsSignUp(false);
        }
      } else {
        // Login existing user
        const { error } = await signIn(email, password);
        if (error) {
          // Translate common error messages to Indonesian
          if (error.message.includes("Invalid login credentials")) {
            setError("Email atau password salah. Silakan coba lagi.");
          } else if (error.message.includes("Email not confirmed")) {
            setError("Email belum diverifikasi. Silakan cek inbox email Anda.");
          } else {
            setError(error.message);
          }
        } else {
          // Login berhasil - refresh dulu kemudian redirect
          setSuccess("Login berhasil! Mengalihkan...");
          router.refresh();
          // Delay sedikit untuk memastikan cookies ter-set
          await new Promise((resolve) => setTimeout(resolve, 500));
          window.location.href = "/";
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Loading State (waiting for auth context)
  // ---------------------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Memuat...</span>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render Login Form
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SRIKANDI-Lite</h1>
          <p className="text-gray-600 mt-1">Sistem Arsip Digital DPRD</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            {isSignUp ? "Buat Akun Baru" : "Masuk ke Akun Anda"}
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nama@dprd.go.id"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 text-white font-medium rounded-lg transition-colors ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isSignUp ? "Mendaftar..." : "Masuk..."}
                </>
              ) : isSignUp ? (
                <>
                  <UserPlus className="h-5 w-5" />
                  Daftar Akun
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Masuk
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignUp ? "Sudah punya akun?" : "Belum punya akun?"}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccess(null);
                }}
                className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
              >
                {isSignUp ? "Masuk di sini" : "Daftar di sini"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2026 SRIKANDI-Lite - Sistem Arsip Digital DPRD
        </p>
      </div>
    </div>
  );
}
