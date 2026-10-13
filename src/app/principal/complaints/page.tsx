"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ClipboardList,
  Search,
  Eye,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  RefreshCw,
} from "lucide-react";
import {
  Complaint,
  STATUS_LABELS,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
} from "@/lib/types";
import { formatDateTime, getTimeRemaining, formatTimeAgo } from "@/lib/utils";

export default function PrincipalComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
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

  const filtered = complaints.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.ticket_id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (c.location?.name && c.location.name.toLowerCase().includes(q)) ||
      (c.reporter_name && c.reporter_name.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || c.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  if (loading && complaints.length === 0) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <div className="spinner" />
        <p style={{ marginTop: "1rem", color: "#64748b", fontSize: "0.875rem" }}>Loading complaints...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="page-title">Campus-Wide Complaint Monitoring</h1>
          <p className="page-subtitle">
            Supervise all registered student & faculty complaints across campus facilities.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#059669", animation: "pulseGlow 2s ease-in-out infinite" }} />
          <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>Live • {complaints.length} total</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: "1rem",
          marginBottom: "1.25rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem", flex: "1 1 300px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={16}
              color="#94a3b8"
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              placeholder="Search by ticket ID, keyword, location, or reporter..."
              className="input"
              style={{ paddingLeft: "2.25rem" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <select
            className="input select"
            style={{ width: "auto", fontSize: "0.8125rem" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved (Awaiting Verification)</option>
            <option value="verified">Verified & Closed</option>
            <option value="reopened">Reopened</option>
          </select>

          <select
            className="input select"
            style={{ width: "auto", fontSize: "0.8125rem" }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>

          <select
            className="input select"
            style={{ width: "auto", fontSize: "0.8125rem" }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="electrical">Electrical</option>
            <option value="plumbing">Plumbing</option>
            <option value="furniture">Furniture</option>
            <option value="cleaning">Cleaning</option>
            <option value="it_equipment">IT Equipment</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="other">Other</option>
          </select>

          {(statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter("all");
                setPriorityFilter("all");
                setCategoryFilter("all");
                setSearchQuery("");
              }}
              className="btn btn-secondary btn-sm"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Complaints Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Issue Summary</th>
              <th>Location</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Assignment</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item) => {
                const remaining = item.resolution_deadline
                  ? getTimeRemaining(item.resolution_deadline)
                  : null;
                const isClosed = ["resolved", "verified", "closed"].includes(item.status);

                return (
                  <tr key={item.id}>
                    <td>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 700,
                          color: "#102a43",
                        }}
                      >
                        {item.ticket_id}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          maxWidth: "240px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: 500,
                        }}
                      >
                        {item.title}
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        by {item.reporter_name || "Anonymous"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8125rem", color: "#334e68" }}>
                        {item.location?.name || "Campus Area"}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-neutral">
                        {CATEGORY_LABELS[item.category] || item.category}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          item.is_critical_safety || item.priority === "critical"
                            ? "badge badge-error"
                            : item.priority === "high"
                            ? "badge badge-warning"
                            : item.priority === "normal"
                            ? "badge badge-info"
                            : "badge badge-neutral"
                        }
                      >
                        {PRIORITY_LABELS[item.priority] || item.priority}
                      </span>
                    </td>
                    <td>
                      {item.assigned_team ? (
                        <div style={{ fontSize: "0.8125rem" }}>
                          <span style={{ fontWeight: 500, color: "#1e293b" }}>
                            {item.assigned_team.name}
                          </span>
                          {item.assigned_staff && (
                            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                              {item.assigned_staff.name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td>
                      {remaining && !isClosed ? (
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
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {isClosed ? "Completed" : "—"}
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className={
                          item.status === "verified" || item.status === "closed"
                            ? "badge badge-success"
                            : item.status === "resolved"
                            ? "badge badge-info"
                            : item.status === "in_progress"
                            ? "badge badge-warning"
                            : "badge badge-neutral"
                        }
                      >
                        {STATUS_LABELS[item.status] || item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedComplaint(item)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "0.25rem 0.5rem" }}
                      >
                        <Eye size={14} />
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "3rem" }}>
                  <div className="empty-state">
                    <ClipboardList />
                    <div>
                      {complaints.length === 0
                        ? "No complaints submitted yet. Students can report issues at /report."
                        : "No complaints matched your filter criteria."}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Complaint Inspection Modal */}
      {selectedComplaint && (
        <div className="dialog-overlay" onClick={() => setSelectedComplaint(null)}>
          <div
            className="dialog"
            style={{ maxWidth: "38rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="dialog-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: "1.125rem",
                    color: "#102a43",
                  }}
                >
                  {selectedComplaint.ticket_id}
                </span>
                <span
                  className={
                    selectedComplaint.status === "verified"
                      ? "badge badge-success"
                      : "badge badge-neutral"
                  }
                  style={{ marginLeft: "0.5rem" }}
                >
                  {STATUS_LABELS[selectedComplaint.status]}
                </span>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="dialog-body">
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: "0.75rem",
                }}
              >
                {selectedComplaint.title}
              </h2>

              {/* Quick details */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                  background: "#f8fafc",
                  padding: "0.875rem",
                  borderRadius: "0.5rem",
                  marginBottom: "1rem",
                  fontSize: "0.8125rem",
                }}
              >
                <div>
                  <span style={{ color: "#64748b" }}>Location:</span>{" "}
                  <strong>{selectedComplaint.location?.name || "Campus"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>Category:</span>{" "}
                  <strong>{CATEGORY_LABELS[selectedComplaint.category]}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>Priority:</span>{" "}
                  <strong>{selectedComplaint.priority}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>Assigned Team:</span>{" "}
                  <strong>{selectedComplaint.assigned_team?.name || "None"}</strong>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "1.25rem" }}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#64748b",
                    marginBottom: "0.25rem",
                  }}
                >
                  Complaint Description
                </div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#334e68",
                    lineHeight: 1.6,
                    background: "#f8fafc",
                    padding: "0.75rem",
                    borderRadius: "0.375rem",
                  }}
                >
                  {selectedComplaint.description}
                </p>
              </div>

              {/* Resolution Notes (if any) */}
              {selectedComplaint.resolution_notes && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#166534",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Maintenance Technician Resolution Notes
                  </div>
                  <div
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      padding: "0.75rem",
                      borderRadius: "0.375rem",
                      fontSize: "0.8125rem",
                      color: "#166534",
                    }}
                  >
                    {selectedComplaint.resolution_notes}
                  </div>
                </div>
              )}

              {/* Activity Audit Trail */}
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#64748b",
                    marginBottom: "0.5rem",
                  }}
                >
                  Activity Audit Trail
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {selectedComplaint.updates?.map((upd, idx) => (
                    <div
                      key={upd.id || idx}
                      style={{
                        padding: "0.5rem 0.75rem",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.375rem",
                        fontSize: "0.8125rem",
                      }}
                    >
                      <div style={{ fontWeight: 500, color: "#1e293b" }}>
                        {upd.description}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                        By {upd.performer_name || "System"} • {formatTimeAgo(upd.created_at)}
                      </div>
                    </div>
                  ))}
                  {(!selectedComplaint.updates || selectedComplaint.updates.length === 0) && (
                    <p style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>No activity records yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="dialog-footer">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
