"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Clock,
  UserX,
  UserCheck,
  Wrench,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  PlusCircle,
} from "lucide-react";
import { DashboardSummary, Complaint, CATEGORY_LABELS, STATUS_LABELS } from "@/lib/types";
import { formatTimeAgo, getTimeRemaining } from "@/lib/utils";

export default function ComplaintTeamOverviewPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [urgentQueue, setUrgentQueue] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);

        const all: Complaint[] = data.complaints || [];
        const sorted = all
          .filter((c) => !["resolved", "verified", "closed", "rejected"].includes(c.status))
          .sort((a, b) => {
            if (a.is_critical_safety && !b.is_critical_safety) return -1;
            if (!a.is_critical_safety && b.is_critical_safety) return 1;
            if (a.is_overdue && !b.is_overdue) return -1;
            if (!a.is_overdue && b.is_overdue) return 1;
            if (!a.assigned_team_id && b.assigned_team_id) return -1;
            if (a.assigned_team_id && !b.assigned_team_id) return 1;
            return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
          });

        setUrgentQueue(sorted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !summary) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
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
          <h1 className="page-title">Operations Control Center</h1>
          <p className="page-subtitle">
            Live student tickets, dispatch maintenance personnel, and meet the 24-hour campus target.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/report" target="_blank" className="btn btn-secondary btn-sm" style={{ gap: "0.375rem" }}>
            <PlusCircle size={14} /> Submit Test Ticket
          </Link>
          <Link href="/complaint-team/complaints" className="btn btn-primary btn-sm">
            View All Complaints <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Operational KPI Grid */}
      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
              <Inbox size={20} />
            </div>
            <div>
              <div className="stat-card-value">{summary.newComplaints}</div>
              <div className="stat-card-label">New Logged</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: "#fffbeb", color: "#d97706" }}>
              <UserX size={20} />
            </div>
            <div>
              <div className="stat-card-value" style={{ color: summary.unassignedComplaints > 0 ? "#d97706" : "#0f172a" }}>
                {summary.unassignedComplaints}
              </div>
              <div className="stat-card-label">Unassigned</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: "#f1f5f9", color: "#0f172a" }}>
              <UserCheck size={20} />
            </div>
            <div>
              <div className="stat-card-value">{summary.assignedTasks}</div>
              <div className="stat-card-label">Assigned</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: "#e0e7ff", color: "#4f46e5" }}>
              <Wrench size={20} />
            </div>
            <div>
              <div className="stat-card-value">{summary.inProgressTasks}</div>
              <div className="stat-card-label">In Progress</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: "#fef2f2", color: "#dc2626" }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="stat-card-value" style={{ color: summary.overdueComplaints > 0 ? "#dc2626" : "#0f172a" }}>
                {summary.overdueComplaints}
              </div>
              <div className="stat-card-label">Overdue</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: "#fee2e2", color: "#991b1b" }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="stat-card-value" style={{ color: summary.criticalIssues > 0 ? "#991b1b" : "#0f172a" }}>
                {summary.criticalIssues}
              </div>
              <div className="stat-card-label">Critical Safety</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="stat-card-value" style={{ color: "#059669" }}>
                {summary.awaitingVerification}
              </div>
              <div className="stat-card-label">Verification Req.</div>
            </div>
          </div>
        </div>
      )}

      {/* Prioritized Task Dispatch Queue */}
      <div className="card" style={{ padding: "1.75rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>
              Active Task Queue (Prioritized)
            </h2>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Sorted by emergency risk, deadline proximity, and unassigned status
            </span>
          </div>
          <span className="badge badge-neutral">{urgentQueue.length} Active Tasks</span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Priority</th>
                <th>Issue Details</th>
                <th>Location</th>
                <th>Assigned Technician</th>
                <th>Remaining SLA</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {urgentQueue.length > 0 ? (
                urgentQueue.map((item) => {
                  const remaining = item.resolution_deadline
                    ? getTimeRemaining(item.resolution_deadline)
                    : null;

                  return (
                    <tr
                      key={item.id}
                      style={{
                        background: item.is_critical_safety
                          ? "rgba(254, 226, 226, 0.25)"
                          : "transparent",
                      }}
                    >
                      <td>
                        <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#0f172a" }}>
                          {item.ticket_id}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            item.is_critical_safety
                              ? "badge badge-error"
                              : item.priority === "high"
                              ? "badge badge-warning"
                              : "badge badge-neutral"
                          }
                        >
                          {item.is_critical_safety ? "CRITICAL HAZARD" : item.priority}
                        </span>
                      </td>
                      <td>
                        <div style={{ maxWidth: "230px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 700, color: "#1e293b" }}>
                          {item.title}
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {CATEGORY_LABELS[item.category]} • {formatTimeAgo(item.submitted_at)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.8125rem", color: "#334155", fontWeight: 500 }}>
                          {item.location?.name || "Campus"}
                        </span>
                      </td>
                      <td>
                        {item.assigned_team ? (
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#0f172a" }}>
                              {item.assigned_team.name}
                            </div>
                            {item.assigned_staff && (
                              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                                {item.assigned_staff.name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="badge badge-warning">Unassigned</span>
                        )}
                      </td>
                      <td>
                        {remaining ? (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: remaining.isOverdue ? "#dc2626" : "#2563eb",
                            }}
                          >
                            {remaining.text}
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>—</span>
                        )}
                      </td>
                      <td>
                        <Link
                          href={`/complaint-team/complaints/${item.id}`}
                          className="btn btn-primary btn-sm"
                          style={{ padding: "0.3rem 0.65rem", fontWeight: 600 }}
                        >
                          Manage Repair →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "4rem 2rem" }}>
                    <div className="empty-state">
                      <CheckCircle2 size={36} color="#059669" style={{ marginBottom: "0.5rem" }} />
                      <div style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.25rem" }}>
                        All Campus Tasks Cleared!
                      </div>
                      <p style={{ color: "#64748b", fontSize: "0.8125rem", maxWidth: "26rem", margin: "0 auto 1.25rem" }}>
                        Submit a complaint through the public student portal to test the real-time queue.
                      </p>
                      <Link href="/report" target="_blank" className="btn btn-primary btn-sm">
                        Submit a Test Complaint on /report
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
