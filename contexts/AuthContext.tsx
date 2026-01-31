/**
 * =============================================================================
 * SRIKANDI-Lite - Auth Context Provider
 * =============================================================================
 * Context untuk mengelola state autentikasi di seluruh aplikasi.
 * Menyediakan informasi user, loading state, dan fungsi login/logout.
 * =============================================================================
 */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

// -----------------------------------------------------------------------------
// Create Context
// -----------------------------------------------------------------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// -----------------------------------------------------------------------------
// Auth Provider Component
// -----------------------------------------------------------------------------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Listen to auth state changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Refresh halaman saat login/logout untuk update server components
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // ---------------------------------------------------------------------------
  // Sign In with Email & Password
  // ---------------------------------------------------------------------------
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // ---------------------------------------------------------------------------
  // Sign Up with Email & Password
  // ---------------------------------------------------------------------------
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // ---------------------------------------------------------------------------
  // Sign Out
  // ---------------------------------------------------------------------------
  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // ---------------------------------------------------------------------------
  // Context Value
  // ---------------------------------------------------------------------------
  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// -----------------------------------------------------------------------------
// Custom Hook untuk menggunakan Auth Context
// -----------------------------------------------------------------------------
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth harus digunakan dalam AuthProvider");
  }
  return context;
}
