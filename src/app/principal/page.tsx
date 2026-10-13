"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Percent,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Building,
  Wrench,
  RefreshCw,
} from "lucide-react";
import {
  DashboardSummary,
  Complaint,
  PRIORITY_LABELS,
  STATUS_LABELS,
  CATEGORY_LABELS,
} from "@/lib/types";
import { formatTimeAgo, getTimeRemaining } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function PrincipalOverviewPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [urgentComplaints, setUrgentComplaints] = useState<Complaint[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<Array<{ name: string; count: number }>>([]);
  const [trendData, setTrendData] = useState<Array<{ day: string; logged: number; resolved: number }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();

      setSummary(data.summary);

      const all: Complaint[] = data.complaints || [];

      // Urgent unresolved complaints: Critical safety first, then overdue, then open high priority
      const urgent = all
        .filter((c) => !["resolved", "verified", "closed", "rejected"].includes(c.status))
        .sort((a, b) => {
          if (a.is_critical_safety && !b.is_critical_safety) return -1;
          if (!a.is_critical_safety && b.is_critical_safety) return 1;
          if (a.is_overdue && !b.is_overdue) return -1;
          if (!a.is_overdue && b.is_overdue) return 1;
          return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
        })
        .slice(0, 5);
      setUrgentComplaints(urgent);

      // Category breakdown from real data
      const catCounts: Record<string, number> = {};
      all.forEach((c) => {
        const label = CATEGORY_LABELS[c.category] || c.category;
        catCounts[label] = (catCounts[label] || 0) + 1;
      });
      setCategoryBreakdown(
        Object.entries(catCounts).map(([name, count]) => ({ name, count }))
      );

      // Build 7-day trend from real complaint dates
      const now = new Date();
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const trend: Array<{ day: string; logged: number; resolved: number }> = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dayEnd = new Date(dayStart.getTime() + 86400000);

        const logged = all.filter((c) => {
          const t = new Date(c.submitted_at).getTime();
          return t >= dayStart.getTime() && t < dayEnd.getTime();
        }).length;

        const resolved = all.filter((c) => {
          if (!c.resolved_at) return false;
          const t = new Date(c.resolved_at).getTime();
          return t >= dayStart.getTime() && t < dayEnd.getTime();
        }).length;

        trend.push({
          day: dayNames[dayStart.getDay()],
          logged,
          resolved,
        });
      }
      setTrendData(trend);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading && !summary) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <div className="spinner" />
        <p style={{ marginTop: "1rem", color: "#64748b", fontSize: "0.875rem" }}>Loading live campus data...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <p style={{ color: "#dc2626" }}>Unable to load dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 className="page-title">Executive Campus Overview</h1>
          <p className="page-subtitle">
            Strategic monitoring of campus complaints, 24-hour SLA targets, and facility health.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#059669",
              animation: "pulseGlow 2s ease-in-out infinite",
            }}
          />
          <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>Live</span>
          <Link href="/principal/complaints" className="btn btn-secondary btn-sm" style={{ marginLeft: "0.5rem" }}>
            Browse All Complaints <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        {/* Total Complaints */}
        <div className="stat-card" style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease" }}>
          <div className="stat-card-icon" style={{ background: "#f0f4f8", color: "#102a43" }}>
            <ClipboardList size={20} />
          </div>
          <div>
            <div className="stat-card-value">{summary.totalComplaints}</div>
            <div className="stat-card-label">Total Complaints</div>
          </div>
        </div>

        {/* Open Complaints */}
        <div className="stat-card" style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease" }}>
          <div className="stat-card-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
            <Clock size={20} />
          </div>
          <div>
            <div className="stat-card-value">{summary.openComplaints}</div>
            <div className="stat-card-label">Open / In Progress</div>
          </div>
        </div>

        {/* Resolved Complaints */}
        <div className="stat-card" style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease" }}>
          <div className="stat-card-icon" style={{ background: "#d1fae5", color: "#059669" }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="stat-card-value">{summary.resolvedComplaints}</div>
            <div className="stat-card-label">Resolved Issues</div>
          </div>
        </div>

        {/* Overdue Complaints */}
        <div className="stat-card" style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease" }}>
          <div className="stat-card-icon" style={{ background: "#fee2e2", color: "#dc2626" }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="stat-card-value" style={{ color: "#dc2626" }}>
              {summary.overdueComplaints}
            </div>
            <div className="stat-card-label">Overdue Target</div>
          </div>
        </div>

        {/* Critical Safety Issues */}
        <div className="stat-card" style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease" }}>
          <div className="stat-card-icon" style={{ background: "#fee2e2", color: "#b91c1c" }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="stat-card-value" style={{ color: "#b91c1c" }}>
              {summary.criticalIssues}
            </div>
            <div className="stat-card-label">Critical Hazards</div>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="stat-card" style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease" }}>
          <div className="stat-card-icon" style={{ background: "#dbeafe", color: "#2563eb" }}>
            <Percent size={20} />
          </div>
          <div>
            <div className="stat-card-value" style={{ color: "#2563eb" }}>
              {summary.slaCompliance}%
            </div>
            <div className="stat-card-label">SLA Compliance</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Trends & Urgent Queue */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "1.5rem",
          marginBottom: "1.75rem",
        }}
      >
        {/* Trend Chart Card */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#102a43",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <TrendingUp size={18} color="#2563eb" />
                7-Day Complaint Inflow vs. Resolution
              </h2>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Real-time tracking of new reports vs repairs completed
              </span>
            </div>
            <Link
              href="/principal/analytics"
              style={{ fontSize: "0.8125rem", color: "#2563eb", fontWeight: 500 }}
            >
              Full Analytics →
            </Link>
          </div>

          <div style={{ width: "100%", height: "240px" }}>
            {trendData.some((d) => d.logged > 0 || d.resolved > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "0.8125rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="logged"
                    name="New Reports"
                    stroke="#627d98"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    name="Resolved"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: "0.875rem" }}>
                Submit complaints to see live trend data
              </div>
            )}
          </div>
        </div>

        {/* Urgent Unresolved Issues Card */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#102a43",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <AlertTriangle size={18} color="#dc2626" />
              High-Attention Unresolved
            </h2>
            <Link
              href="/principal/critical-issues"
              style={{ fontSize: "0.8125rem", color: "#dc2626", fontWeight: 600 }}
            >
              Safety Queue
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {urgentComplaints.length > 0 ? (
              urgentComplaints.map((item) => {
                const remaining = item.resolution_deadline
                  ? getTimeRemaining(item.resolution_deadline)
                  : null;

                return (
                  <div
                    key={item.id}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "0.5rem",
                      background: item.is_critical_safety
                        ? "#fef2f2"
                        : item.is_overdue
                        ? "#fff1f2"
                        : "#f8fafc",
                      border: `1px solid ${
                        item.is_critical_safety
                          ? "#fecaca"
                          : item.is_overdue
                          ? "#fecdd3"
                          : "#e2e8f0"
                      }`,
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontFamily: "monospace",
                          fontWeight: 700,
                          color: "#1e293b",
                        }}
                      >
                        {item.ticket_id}
                      </span>
                      {item.is_critical_safety ? (
                        <span className="badge badge-error" style={{ fontSize: "0.65rem" }}>
                          Critical Hazard
                        </span>
                      ) : item.is_overdue ? (
                        <span className="badge badge-error" style={{ fontSize: "0.65rem" }}>
                          Overdue
                        </span>
                      ) : (
                        <span className="badge badge-warning" style={{ fontSize: "0.65rem" }}>
                          {item.priority}
                        </span>
                      )}
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
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.725rem",
                        color: "#64748b",
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "0.375rem",
                      }}
                    >
                      <span>{item.location?.name || "Campus"}</span>
                      {remaining && (
                        <span
                          style={{
                            fontWeight: 600,
                            color: remaining.isOverdue ? "#dc2626" : "#2563eb",
                          }}
                        >
                          {remaining.text}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <CheckCircle2 size={28} color="#059669" style={{ margin: "0 auto 0.5rem" }} />
                <p style={{ color: "#059669", fontSize: "0.8125rem", fontWeight: 600 }}>
                  No urgent unresolved issues
                </p>
                <p style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  Campus operations running smoothly
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Row: Category Breakdown & Maintenance Health */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
        }}
      >
        {/* Category Breakdown Card */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3
            style={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "#102a43",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Building size={16} color="#64748b" />
            Complaints by Category
          </h3>
          <div style={{ width: "100%", height: "180px" }}>
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "0.8125rem",
                    }}
                  />
                  <Bar dataKey="count" name="Reports" fill="#334e68" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: "0.875rem" }}>
                No complaint data yet — submit reports to populate
              </div>
            )}
          </div>
        </div>

        {/* Maintenance Performance Card */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3
            style={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "#102a43",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Wrench size={16} color="#64748b" />
            Institutional SLA Performance Target
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8125rem",
                  marginBottom: "0.25rem",
                }}
              >
                <span style={{ color: "#475569" }}>Standard 24-Hour Resolution Compliance</span>
                <strong style={{ color: "#059669" }}>{summary.slaCompliance}%</strong>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "#e2e8f0",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${summary.slaCompliance}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #059669, #34d399)",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8125rem",
                  marginBottom: "0.25rem",
                }}
              >
                <span style={{ color: "#475569" }}>Critical Hazard Rapid Response (&lt;30m)</span>
                <strong style={{ color: "#2563eb" }}>100%</strong>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "#e2e8f0",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(90deg, #2563eb, #60a5fa)",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: "0.5rem",
                padding: "0.75rem",
                background: summary.overdueComplaints > 0 ? "#fef2f2" : "#f0fdf4",
                border: `1px solid ${summary.overdueComplaints > 0 ? "#fecaca" : "#bbf7d0"}`,
                borderRadius: "0.5rem",
                fontSize: "0.75rem",
                color: summary.overdueComplaints > 0 ? "#991b1b" : "#166534",
                transition: "background 0.3s ease, border-color 0.3s ease",
              }}
            >
              <strong>Status:</strong>{" "}
              {summary.overdueComplaints > 0
                ? `${summary.overdueComplaints} overdue ticket(s) require immediate attention. Supervisor alerts triggered.`
                : "Campus maintenance response is operating within institution targets. Overdue tickets automatically trigger supervisory alerts."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
