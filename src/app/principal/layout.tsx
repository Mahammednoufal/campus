"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Shield,
  ShieldAlert,
  ClipboardList,
  ChartNoAxesCombined,
  MapPin,
  Users,
  FileText,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

const PRINCIPAL_NAV_ITEMS = [
  { href: "/principal", label: "Overview", icon: LayoutDashboard },
  { href: "/principal/complaints", label: "All Complaints", icon: ClipboardList },
  { href: "/principal/critical-issues", label: "Critical Safety", icon: ShieldAlert, badge: "Safety" },
  { href: "/principal/analytics", label: "Analytics & Trends", icon: ChartNoAxesCombined },
  { href: "/principal/locations", label: "Locations & QR", icon: MapPin },
  { href: "/principal/teams", label: "Maintenance Teams", icon: Users },
  { href: "/principal/reports", label: "Summary Reports", icon: FileText },
  { href: "/principal/settings", label: "SLA Policies & Config", icon: Settings },
];

function PrincipalNavLinks({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {PRINCIPAL_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/principal"
            ? pathname === "/principal"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`sidebar-nav-item ${isActive ? "active" : ""}`}
          >
            <Icon size={18} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span
                className="badge badge-error"
                style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem" }}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}

export default function PrincipalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    document.cookie = "scc_demo_user=; path=/; max-age=0";
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.push("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? "open" : ""}`}>
        {/* Branding */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div
              style={{
                width: "2rem",
                height: "2rem",
                background: "#102a43",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={16} color="white" />
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "#102a43",
                  lineHeight: 1.2,
                }}
              >
                Smart Campus Care
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "#2563eb",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Principal Oversight
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "none",
            }}
            className="mobile-close"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Badge */}
        <div
          style={{
            padding: "0.875rem 1.25rem",
            background: "#f0f4f8",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "#627d98" }}>Authorized Principal</div>
          <div
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#102a43",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            rikashrikash04@gmail.com
          </div>
        </div>

        {/* Navigation items */}
        <nav style={{ padding: "1rem 0.75rem", flex: 1, overflowY: "auto" }}>
          <Suspense fallback={<div style={{ padding: "1rem", color: "#94a3b8" }}>Loading nav...</div>}>
            <PrincipalNavLinks onNavigate={() => setMobileMenuOpen(false)} />
          </Suspense>
        </nav>

        {/* Bottom Actions */}
        <div
          style={{
            padding: "1rem 1.25rem",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <Link
            href="/report"
            target="_blank"
            className="sidebar-nav-item"
            style={{ fontSize: "0.8125rem", padding: "0.5rem" }}
          >
            <ExternalLink size={16} />
            <span>View Student Portal</span>
          </Link>
          <button
            onClick={handleLogout}
            className="sidebar-nav-item"
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              width: "100%",
              color: "#dc2626",
              padding: "0.5rem",
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-secondary btn-sm"
              style={{ display: "none" }}
              id="principal-menu-btn"
            >
              <Menu size={18} />
            </button>
            <div>
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "#64748b",
                  fontWeight: 500,
                }}
              >
                Institution:
              </span>{" "}
              <strong style={{ fontSize: "0.875rem", color: "#102a43" }}>
                Apex University of Engineering & Technology
              </strong>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link
              href="/principal/critical-issues"
              className="btn btn-secondary btn-sm"
              style={{ color: "#dc2626", borderColor: "#fecaca" }}
            >
              <ShieldAlert size={14} />
              Safety Watch
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: "1.75rem" }}>{children}</main>
      </div>
    </div>
  );
}
