"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { Complaint } from "@/lib/types";
import { formatTimeAgo, getTimeRemaining } from "@/lib/utils";

export default function CriticalIssuesPage() {
  const [criticalComplaints, setCriticalComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const all: Complaint[] = data.complaints || [];
        const critical = all.filter(
          (c) => c.is_critical_safety || c.priority === "critical"
        );
        setCriticalComplaints(critical);
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

  if (loading && criticalComplaints.length === 0) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <div className="spinner" />
        <p style={{ marginTop: "1rem", color: "#64748b", fontSize: "0.875rem" }}>Scanning for critical hazards...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ShieldAlert size={24} color="#dc2626" />
          <h1 className="page-title" style={{ color: "#991b1b" }}>
            Critical Safety & Emergency Hazards
          </h1>
        </div>
        <p className="page-subtitle">
          Real-time oversight for severe electrical, structural, water, and life-safety hazards.
          These bypass the ordinary queue with instant escalation.
        </p>
      </div>

      {/* Safety Protocol Banner */}
      <div
        style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "0.75rem",
          padding: "1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "#991b1b",
              marginBottom: "0.25rem",
            }}
          >
            Emergency Response SLA Policy: 30 Minutes Response / 4 Hours Resolution
          </div>
          <p style={{ fontSize: "0.8125rem", color: "#b91c1c" }}>
            When a critical hazard is detected, the area must be cordoned off immediately.
            Contact Campus Security or Facility Duty Officer for physical cordoning.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <div
            className="badge badge-error"
            style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem" }}
          >
            <Phone size={14} /> Control Room: Ext 100 / +91 98450 99999
          </div>
        </div>
      </div>

      {/* Live indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#dc2626", animation: "pulseGlow 1.5s ease-in-out infinite" }} />
        <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 600 }}>
          Live Monitoring • {criticalComplaints.length} critical issue{criticalComplaints.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Critical Complaints List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {criticalComplaints.length > 0 ? (
          criticalComplaints.map((item) => {
            const remaining = item.resolution_deadline
              ? getTimeRemaining(item.resolution_deadline)
              : null;
            const isResolved = ["resolved", "verified", "closed"].includes(item.status);

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  borderLeft: "4px solid #dc2626",
                  padding: "1.5rem",
                  background: isResolved ? "#ffffff" : "#fffbfa",
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
                        fontSize: "1rem",
                        color: "#991b1b",
                      }}
                    >
                      {item.ticket_id}
                    </span>
                    <span className="badge badge-error">CRITICAL SAFETY</span>
                    <span
                      className={
                        isResolved ? "badge badge-success" : "badge badge-warning"
                      }
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  {remaining && !isResolved && (
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: remaining.isOverdue ? "#dc2626" : "#b91c1c",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                      }}
                    >
                      <Clock size={14} />
                      Target SLA: {remaining.text}
                    </div>
                  )}
                </div>

                <h3
                  style={{
                    fontSize: "1.125rem",
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
                    flexWrap: "wrap",
                    gap: "1.25rem",
                    fontSize: "0.8125rem",
                    color: "#64748b",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <div>
                    <strong>Location:</strong> {item.location?.name || "Campus"}
                  </div>
                  <div>
                    <strong>Reported:</strong> {formatTimeAgo(item.submitted_at)}
                  </div>
                  <div>
                    <strong>Reporter:</strong> {item.reporter_name || "Campus Community"}
                  </div>
                  <div>
                    <strong>Assigned:</strong>{" "}
                    {item.assigned_team?.name || (
                      <span style={{ color: "#dc2626", fontWeight: 600 }}>
                        Awaiting Immediate Dispatch
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <CheckCircle2 size={36} color="#059669" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#1e293b" }}>
              Zero Active Safety Hazards
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              All campus facilities are currently operating without critical risk flags.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
