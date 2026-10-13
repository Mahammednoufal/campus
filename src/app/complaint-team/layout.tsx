"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Wrench,
  Inbox,
  ClipboardList,
  UserCheck,
  Users,
  AlertTriangle,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

const COMPLAINT_TEAM_NAV_ITEMS = [
  { href: "/complaint-team", label: "Operations Overview", icon: Inbox },
  { href: "/complaint-team/complaints", label: "Complaint Queue", icon: ClipboardList },
  { href: "/complaint-team/assignments", label: "Task Dispatch", icon: UserCheck },
  { href: "/complaint-team/overdue", label: "Overdue & Escalations", icon: AlertTriangle, badge: "Alerts" },
  { href: "/complaint-team/staff", label: "Technicians & Staff", icon: Users },
];

function NavLinks({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {COMPLAINT_TEAM_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/complaint-team"
            ? pathname === "/complaint-team"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`sidebar-nav-item ${isActive ? "active" : ""}`}
            style={{
              padding: "0.625rem 0.875rem",
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontWeight: isActive ? 600 : 500,
              fontSize: "0.875rem",
            }}
          >
            <Icon size={18} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span
                className="badge badge-warning"
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

export default function ComplaintTeamLayout({
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
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        backgroundImage: `radial-gradient(at 100% 0%, rgba(241, 245, 249, 0.6) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(248, 250, 252, 0.8) 0px, transparent 50%)`,
      }}
    >
      {/* Mobile backdrop */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "2.25rem",
                height: "2.25rem",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                borderRadius: "0.625rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 10px rgba(15, 23, 42, 0.12)",
              }}
            >
              <Wrench size={16} color="white" />
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                Smart Campus Care
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "#d97706",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Complaint Operations Desk
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
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card: Clean, modern, executive badge (replaces ugly yellow box) */}
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
          <div
            style={{
              padding: "0.75rem 0.875rem",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "0.625rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.25rem" }}>
              <ShieldCheck size={14} color="#d97706" />
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#b45309",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Authorized Coordinator
              </span>
            </div>
            <div
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#1e293b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              mohdnoupa2005@gmail.com
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav style={{ padding: "0.75rem 0.75rem", flex: 1, overflowY: "auto" }}>
          <Suspense fallback={<div style={{ padding: "1rem", color: "#94a3b8" }}>Loading...</div>}>
            <NavLinks onNavigate={() => setMobileMenuOpen(false)} />
          </Suspense>
        </nav>

        {/* Bottom Actions */}
        <div
          style={{
            padding: "1rem 1.25rem",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: "0.375rem",
          }}
        >
          <Link
            href="/report"
            target="_blank"
            className="sidebar-nav-item"
            style={{ fontSize: "0.8125rem", padding: "0.5rem 0.75rem" }}
          >
            <ExternalLink size={16} />
            <span>Open Student Portal</span>
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
              padding: "0.5rem 0.75rem",
              fontSize: "0.8125rem",
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-secondary btn-sm"
              style={{ display: "none" }}
            >
              <Menu size={18} />
            </button>
            <div>
              <span style={{ fontSize: "0.8125rem", color: "#64748b" }}>Campus Operations:</span>{" "}
              <strong style={{ fontSize: "0.875rem", color: "#0f172a" }}>
                Active Maintenance Dispatch Console
              </strong>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link
              href="/complaint-team/overdue"
              className="btn btn-secondary btn-sm"
              style={{ color: "#dc2626", borderColor: "#fecaca" }}
            >
              <AlertTriangle size={14} />
              Overdue Watch
            </Link>
          </div>
        </header>

        <main style={{ padding: "2rem" }}>{children}</main>
      </div>
    </div>
  );
}
