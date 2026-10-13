"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { UserCheck, Clock, CheckCircle2 } from "lucide-react";
import { Complaint, MaintenanceTeam, MaintenanceStaff } from "@/lib/types";
import { getTimeRemaining, formatTimeAgo } from "@/lib/utils";

export default function ComplaintTeamAssignmentsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setComplaints(data.complaints || []);
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

  const assignedTasks = complaints.filter(
    (c) => !!c.assigned_team_id && !["verified", "closed"].includes(c.status)
  );

  if (loading && complaints.length === 0) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <div className="spinner" />
        <p style={{ marginTop: "1rem", color: "#64748b", fontSize: "0.875rem" }}>Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="page-title">Workload Dispatch & Task Assignments</h1>
          <p className="page-subtitle">
            Real-time roster tracking of maintenance squads and technician allocations.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#059669", animation: "pulseGlow 2s ease-in-out infinite" }} />
          <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>Live • {assignedTasks.length} active</span>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Issue Summary</th>
              <th>Location</th>
              <th>Assigned Squad</th>
              <th>Lead Technician</th>
              <th>Target Deadline</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {assignedTasks.length > 0 ? (
              assignedTasks.map((item) => {
                const remaining = item.resolution_deadline
                  ? getTimeRemaining(item.resolution_deadline)
                  : null;

                return (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#102a43" }}>
                        {item.ticket_id}
                      </span>
                    </td>
                    <td>
                      <div style={{ maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
                        {item.title}
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        Assigned {formatTimeAgo(item.assigned_at || item.submitted_at)}
                      </span>
                    </td>
                    <td>{item.location?.name || "Campus"}</td>
                    <td>
                      <strong>{item.assigned_team?.name || "General Squad"}</strong>
                    </td>
                    <td>
                      {item.assigned_staff ? (
                        <div>
                          <div style={{ fontWeight: 500 }}>{item.assigned_staff.name}</div>
                          <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                            {item.assigned_staff.phone || "On Campus"}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Squad General</span>
                      )}
                    </td>
                    <td>
                      {remaining ? (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: remaining.isOverdue ? "#dc2626" : "#2563eb",
                          }}
                        >
                          {remaining.text}
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Active</span>
                      )}
                    </td>
                    <td>
                      <Link
                        href={`/complaint-team/complaints/${item.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "0.25rem 0.5rem" }}
                      >
                        Reassign / View →
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "3rem" }}>
                  <div className="empty-state">
                    <UserCheck />
                    <div>No active assigned tasks. Dispatch tickets from the main queue.</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
