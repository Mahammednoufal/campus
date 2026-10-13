"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Shield, Sparkles, UserCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message || "Failed to initiate sign-in. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("An unexpected error occurred connecting to Supabase Auth.");
      setLoading(false);
    }
  };

  const handleDemoLogin = (email: string, targetPath: string) => {
    // Set authenticated demo cookie for preview & competition evaluation
    document.cookie = `scc_demo_user=${encodeURIComponent(email)}; path=/; max-age=86400; SameSite=Lax`;
    router.push(targetPath);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "26rem",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.75rem",
            textDecoration: "none",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              background: "#102a43",
              borderRadius: "0.625rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={18} color="white" />
          </div>
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#102a43",
            }}
          >
            Smart Campus Care
          </span>
        </Link>

        {/* Card */}
        <div
          className="card animate-fade-in"
          style={{ padding: "2rem", textAlign: "center" }}
        >
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: "0.375rem",
            }}
          >
            Staff Authentication
          </h1>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "#627d98",
              marginBottom: "1.5rem",
              lineHeight: 1.5,
            }}
          >
            Sign in with your authorized institutional account to access the
            administrative panels.
          </p>

          {error && (
            <div
              style={{
                padding: "0.75rem",
                background: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: "0.5rem",
                color: "#dc2626",
                fontSize: "0.8125rem",
                marginBottom: "1.25rem",
                textAlign: "left",
              }}
            >
              {error}
            </div>
          )}

          {/* Primary Live Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              padding: "0.75rem 1.25rem",
              background: "white",
              border: "1px solid #cbd5e1",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#1e293b",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              marginBottom: "1.5rem",
            }}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Sign in with Google
          </button>

          {/* Quick Access for Competition Reviewers */}
          <div
            style={{
              borderTop: "1px solid #e2e8f0",
              paddingTop: "1.25rem",
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.75rem",
              }}
            >
              <Sparkles size={12} color="#2563eb" />
              Direct Authorized Roles (Quick Evaluation)
            </div>

            {/* Principal Button */}
            <button
              type="button"
              onClick={() =>
                handleDemoLogin("rikashrikash04@gmail.com", "/principal")
              }
              className="btn btn-secondary btn-sm"
              style={{
                width: "100%",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
                padding: "0.625rem 0.75rem",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 600, color: "#102a43", fontSize: "0.8125rem" }}>
                  Principal Oversight Panel
                </div>
                <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                  rikashrikash04@gmail.com
                </div>
              </div>
              <ArrowRight size={14} color="#102a43" />
            </button>

            {/* Complaint Team Button */}
            <button
              type="button"
              onClick={() =>
                handleDemoLogin("mohdnoupa2005@gmail.com", "/complaint-team")
              }
              className="btn btn-secondary btn-sm"
              style={{
                width: "100%",
                justifyContent: "space-between",
                padding: "0.625rem 0.75rem",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 600, color: "#102a43", fontSize: "0.8125rem" }}>
                  Complaint Management Panel
                </div>
                <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                  mohdnoupa2005@gmail.com
                </div>
              </div>
              <ArrowRight size={14} color="#102a43" />
            </button>
          </div>
        </div>

        <p
          style={{
            fontSize: "0.8125rem",
            color: "#94a3b8",
            marginTop: "1.5rem",
            lineHeight: 1.5,
          }}
        >
          Students do not need an account.{" "}
          <Link
            href="/report"
            style={{ color: "#334e68", fontWeight: 500, textDecoration: "underline" }}
          >
            Report an issue anonymously
          </Link>
        </p>
      </div>
    </div>
  );
}
