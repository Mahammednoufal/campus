import Link from "next/link";
import {
  QrCode,
  ClipboardList,
  CheckCircle2,
  Shield,
  Clock3,
  ChartNoAxesCombined,
  ArrowRight,
  Smartphone,
  Users,
  Zap,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Navigation */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 2.5rem",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "2.25rem",
              height: "2.25rem",
              background: "#0f172a",
              borderRadius: "0.625rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
            }}
          >
            <Shield size={18} color="white" />
          </div>
          <div>
            <span
              style={{
                fontSize: "1.125rem",
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.02em",
                display: "block",
                lineHeight: 1.1,
              }}
            >
              Smart Campus Care
            </span>
            <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500 }}>
              Institutional Maintenance OS
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <Link
            href="/report"
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#334155",
              textDecoration: "none",
            }}
          >
            Report Problem
          </Link>
          <Link
            href="/login"
            className="btn btn-primary btn-sm"
            style={{ borderRadius: "0.5rem" }}
          >
            Staff Login
          </Link>
        </div>
      </nav>

      {/* Hero Section with REAL CAMPUS PHOTOGRAPHY BACKGROUND */}
      <section
        style={{
          position: "relative",
          minHeight: "75vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0.85) 100%), url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2000&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          padding: "5rem 1.5rem",
          color: "white",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "54rem", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div
            className="animate-fade-in"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.375rem 1rem",
              borderRadius: "9999px",
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              color: "#e2e8f0",
              fontSize: "0.8125rem",
              fontWeight: 600,
              marginBottom: "1.75rem",
            }}
          >
            <Zap size={14} color="#38bdf8" />
            Next-Gen QR Campus Maintenance
          </div>

          <h1
            style={{
              fontSize: "clamp(2.25rem, 5.5vw, 3.75rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              marginBottom: "1.5rem",
              textShadow: "0 2px 20px rgba(0,0,0,0.3)",
            }}
          >
            Campus Maintenance Complaints,{" "}
            <span style={{ color: "#38bdf8" }}>Tracked to Resolution</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              color: "#cbd5e1",
              maxWidth: "42rem",
              margin: "0 auto 2.5rem",
              lineHeight: 1.7,
            }}
          >
            Students scan a QR code outside their classroom to file issues anonymously.
            Maintenance squads coordinate repairs with photographic evidence, while the
            principal monitors campus-wide SLA compliance in real time.
          </p>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/report"
              className="btn btn-lg"
              style={{
                background: "#38bdf8",
                color: "#0f172a",
                fontWeight: 700,
                border: "none",
                boxShadow: "0 10px 25px -5px rgba(56, 189, 248, 0.4)",
              }}
            >
              Scan & Report an Issue <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="btn btn-lg"
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                color: "white",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                fontWeight: 600,
              }}
            >
              Authorized Staff Portal
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Step Visual Flow */}
      <section style={{ padding: "5rem 2rem", maxWidth: "68rem", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span
            className="badge badge-info"
            style={{ marginBottom: "0.5rem", fontSize: "0.75rem" }}
          >
            Zero Friction Workflow
          </span>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            How Smart Campus Care Operates
          </h2>
          <p style={{ color: "#64748b", fontSize: "1rem", marginTop: "0.25rem" }}>
            No apps to download. No student passwords. Transparent repair accountability.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
          }}
        >
          {/* Card 1 */}
          <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
            <div
              style={{
                width: "4rem",
                height: "4rem",
                background: "#eff6ff",
                borderRadius: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                border: "1px solid #bfdbfe",
              }}
            >
              <QrCode size={28} color="#2563eb" />
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#2563eb",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.5rem",
              }}
            >
              Step 1
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem" }}>
              Scan QR Code on Wall
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6 }}>
              Point any mobile camera at the QR code mounted in classrooms, labs, washrooms, or libraries.
              The location is automatically recognized.
            </p>
          </div>

          {/* Card 2 */}
          <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
            <div
              style={{
                width: "4rem",
                height: "4rem",
                background: "#fffbeb",
                borderRadius: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                border: "1px solid #fde68a",
              }}
            >
              <ClipboardList size={28} color="#d97706" />
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#d97706",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.5rem",
              }}
            >
              Step 2
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem" }}>
              Submit in 30 Seconds
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6 }}>
              Select category, describe the breakdown, and attach a photo. Critical safety hazards
              trigger immediate emergency alarms.
            </p>
          </div>

          {/* Card 3 */}
          <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
            <div
              style={{
                width: "4rem",
                height: "4rem",
                background: "#ecfdf5",
                borderRadius: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                border: "1px solid #a7f3d0",
              }}
            >
              <CheckCircle2 size={28} color="#059669" />
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#059669",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.5rem",
              }}
            >
              Step 3
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem" }}>
              Track & Verify Repair
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6 }}>
              Follow progress live with a secure tracking link. When repairs conclude, students verify the
              fix with one tap or reopen if issues persist.
            </p>
          </div>
        </div>
      </section>

      {/* Campus Facility Real Photo Showcase */}
      <section
        style={{
          background: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          borderBottom: "1px solid #e2e8f0",
          padding: "5rem 2rem",
        }}
      >
        <div style={{ maxWidth: "68rem", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "3rem",
              alignItems: "center",
            }}
          >
            <div>
              <span className="badge badge-success" style={{ marginBottom: "0.75rem" }}>
                Proven 24-Hour SLA Target
              </span>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.25,
                  marginBottom: "1rem",
                }}
              >
                Accountability Built Directly into Campus Infrastructure
              </h2>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "#475569",
                  lineHeight: 1.7,
                  marginBottom: "1.5rem",
                }}
              >
                Traditional campus complaints get lost in informal WhatsApp groups or forgotten
                paper registers. Smart Campus Care enforces automated deadline calculations, supervisor
                escalations, and verifiable completion photos for every repair.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  "Deterministic Safety Rules: Exposed wires & flooding bypass normal targets.",
                  "Separated Role Panels: Dedicated layouts for Principal & Maintenance Operations.",
                  "Recurring Asset Failure AI: Automatically detects repeated breakdowns.",
                  "Live Verification: Tickets require physical evidence before closure.",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <div
                      style={{
                        width: "1.25rem",
                        height: "1.25rem",
                        borderRadius: "50%",
                        background: "#ecfdf5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircle2 size={12} color="#059669" />
                    </div>
                    <span style={{ fontSize: "0.875rem", color: "#334155", fontWeight: 500 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Campus Real Image Showcase Card */}
            <div
              style={{
                borderRadius: "1.25rem",
                overflow: "hidden",
                boxShadow: "0 20px 40px -15px rgba(15, 23, 42, 0.15)",
                border: "1px solid #e2e8f0",
                position: "relative",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80"
                alt="Educational Campus Building"
                style={{
                  width: "100%",
                  height: "380px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "1.5rem",
                  left: "1.5rem",
                  right: "1.5rem",
                  background: "rgba(255, 255, 255, 0.92)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "0.75rem",
                  padding: "1rem 1.25rem",
                  border: "1px solid rgba(255, 255, 255, 0.8)",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem" }}>
                      Main Academic Campus
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      100% QR-tagged classrooms & laboratories
                    </div>
                  </div>
                  <span className="badge badge-success">92% SLA Target Met</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "2.5rem 2rem",
          background: "#ffffff",
          textAlign: "center",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <div
            style={{
              width: "1.5rem",
              height: "1.5rem",
              background: "#0f172a",
              borderRadius: "0.375rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={10} color="white" />
          </div>
          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>
            Smart Campus Care
          </span>
        </div>
        <p style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
          Engineered for schools, polytechnics, and university campuses.
        </p>
      </footer>
    </div>
  );
}
