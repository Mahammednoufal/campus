"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  MapPin,
  RefreshCw,
  PlusCircle,
} from "lucide-react";
import { Complaint, STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from "@/lib/types";
import { getTimeRemaining, formatTimeAgo } from "@/lib/utils";

export default function ComplaintTeamQueuePage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch live real data from persistent server API
  const fetchComplaints = async () => {
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
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // Live polling so complaints submitted in the student panel appear immediately!
    const interval = setInterval(fetchComplaints, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchComplaints();
  };

  const filtered = complaints.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.ticket_id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      (c.location?.name && c.location.name.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || c.priority === priorityFilter;
    const matchesAssignment =
      assignmentFilter === "all"
        ? true
        : assignmentFilter === "unassigned"
        ? !c.assigned_team_id
        : !!c.assigned_team_id;

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignment;
  });

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
          <h1 className="page-title">Complaint Operational Queue</h1>
          <p className="page-subtitle">
            Live campus tickets submitted by students and faculty — updates automatically in real time.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            onClick={handleManualRefresh}
            className="btn btn-secondary btn-sm"
            style={{ gap: "0.375rem" }}
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            Sync Now
          </button>
          <Link
            href="/report"
            target="_blank"
            className="btn btn-primary btn-sm"
            style={{ gap: "0.375rem" }}
          >
            <PlusCircle size={14} />
            Test Student Report
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 280px" }}>
          <Search
            size={16}
            color="#94a3b8"
            style={{
              position: "absolute",
              left: "0.875rem",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            type="text"
            placeholder="Search ticket ID, keywords, or location..."
            className="input"
            style={{ paddingLeft: "2.35rem" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
            <option value="verified">Verified / Closed</option>
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
            value={assignmentFilter}
            onChange={(e) => setAssignmentFilter(e.target.value)}
          >
            <option value="all">All Assignments</option>
            <option value="unassigned">Unassigned Only</option>
            <option value="assigned">Assigned Only</option>
          </select>
        </div>
      </div>

      {/* Queue Table */}
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
              <th>Target Deadline</th>
              <th>Status</th>
              <th>Workflow</th>
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
                          fontWeight: 800,
                          color: "#0f172a",
                          fontSize: "0.875rem",
                        }}
                      >
                        {item.ticket_id}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          maxWidth: "230px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: 700,
                          color: "#1e293b",
                        }}
                      >
                        {item.title}
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        Logged {formatTimeAgo(item.submitted_at)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8125rem", color: "#334155", fontWeight: 500 }}>
                        {item.location?.name || "Campus Location"}
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
                            : "badge badge-neutral"
                        }
                      >
                        {item.is_critical_safety ? "CRITICAL" : item.priority}
                      </span>
                    </td>
                    <td>
                      {item.assigned_team ? (
                        <div style={{ fontSize: "0.8125rem" }}>
                          <span style={{ fontWeight: 600, color: "#0f172a" }}>
                            {item.assigned_team.name}
                          </span>
                          {item.assigned_staff && (
                            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                              {item.assigned_staff.name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="badge badge-warning">Unassigned</span>
                      )}
                    </td>
                    <td>
                      {remaining && !isClosed ? (
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
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Completed</span>
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
                        {STATUS_LABELS[item.status]}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/complaint-team/complaints/${item.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "0.3rem 0.65rem", fontWeight: 600 }}
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "4rem 2rem" }}>
                  <div className="empty-state">
                    <ClipboardList size={40} style={{ opacity: 0.3, marginBottom: "0.75rem" }} />
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.25rem" }}>
                      No Complaints in Queue
                    </div>
                    <p style={{ fontSize: "0.8125rem", color: "#64748b", maxWidth: "24rem", margin: "0 auto 1.25rem" }}>
                      When students scan QR codes and submit issues on the reporting page, they will appear here in real time.
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
  );
}
