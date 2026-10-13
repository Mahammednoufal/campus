"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Complaint, CATEGORY_LABELS } from "@/lib/types";
import { getTimeRemaining, formatTimeAgo } from "@/lib/utils";

export default function ComplaintTeamOverduePage() {
  const [overdueComplaints, setOverdueComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const all: Complaint[] = data.complaints || [];
        const overdue = all.filter(
          (c) =>
            (c.is_overdue || c.is_escalated) &&
            !["resolved", "verified", "closed"].includes(c.status)
        );
        setOverdueComplaints(overdue);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading && overdueComplaints.length === 0) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <div className="spinner" />
        <p style={{ marginTop: "1rem", color: "#64748b", fontSize: "0.875rem" }}>Checking overdue tasks...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertTriangle size={24} color="#dc2626" />
          <h1 className="page-title" style={{ color: "#991b1b" }}>
            Overdue Tasks & Supervisor Escalations
          </h1>
        </div>
        <p className="page-subtitle">
          Tasks that have exceeded the 24-hour SLA target or received emergency escalation notices.
        </p>
      </div>

      {/* Warning Callout */}
      <div
        style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "0.75rem",
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          fontSize: "0.8125rem",
          color: "#991b1b",
        }}
      >
        <strong>Executive SLA Notice:</strong> The Principal dashboard automatically monitors
        unresolved overdue tickets. Overdue tickets remain highlighted until an authorized technician
        submits verified completion notes.
      </div>

      {/* Live indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: overdueComplaints.length > 0 ? "#dc2626" : "#059669", animation: "pulseGlow 1.5s ease-in-out infinite" }} />
        <span style={{ fontSize: "0.75rem", color: overdueComplaints.length > 0 ? "#dc2626" : "#059669", fontWeight: 600 }}>
          {overdueComplaints.length > 0 ? `${overdueComplaints.length} overdue task(s) require action` : "No overdue tasks — all on track"}
        </span>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {overdueComplaints.length > 0 ? (
          overdueComplaints.map((item) => {
            const remaining = item.resolution_deadline
              ? getTimeRemaining(item.resolution_deadline)
              : null;

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  borderLeft: "4px solid #dc2626",
                  padding: "1.5rem",
                  background: "#fffbfa",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        fontSize: "1.0625rem",
                        color: "#991b1b",
                      }}
                    >
                      {item.ticket_id}
                    </span>
                    {item.is_overdue && (
                      <span className="badge badge-error">OVERDUE SLA</span>
                    )}
                    {item.is_escalated && (
                      <span className="badge badge-error">ESCALATED</span>
                    )}
                    <span className="badge badge-warning">{item.status.toUpperCase()}</span>
                  </div>

                  {remaining && (
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.8125rem",
                        color: remaining.isOverdue ? "#dc2626" : "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                      }}
                    >
                      <Clock size={14} />
                      {remaining.text}
                    </div>
                  )}
                </div>

                <h3
                  style={{
                    fontSize: "1.0625rem",
                    fontWeight: 700,
                    color: "#1e293b",
                    marginBottom: "0.5rem",
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#475569",
                    lineHeight: 1.6,
                    marginBottom: "1rem",
                  }}
                >
                  {item.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid #fee2e2",
                    fontSize: "0.8125rem",
                  }}
                >
                  <div style={{ display: "flex", gap: "1rem", color: "#64748b" }}>
                    <span>Location: <strong>{item.location?.name || "Campus"}</strong></span>
                    <span>
                      Assigned:{" "}
                      <strong>
                        {item.assigned_team?.name || "Unassigned"}
                        {item.assigned_staff && ` (${item.assigned_staff.name})`}
                      </strong>
                    </span>
                  </div>

                  <Link
                    href={`/complaint-team/complaints/${item.id}`}
                    className="btn btn-primary btn-sm"
                    style={{ background: "#dc2626", borderColor: "#dc2626" }}
                  >
                    Expedite & Manage →
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <CheckCircle2 size={36} color="#059669" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#1e293b" }}>
              Zero Overdue Tasks
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              All campus maintenance tickets are progressing strictly within the 24-hour target.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
