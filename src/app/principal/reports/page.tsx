"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Printer, CheckCircle2, TrendingUp, Calendar, RefreshCw, AlertCircle } from "lucide-react";
import { Complaint, DashboardSummary, CATEGORY_LABELS, STATUS_LABELS } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function PrincipalReportsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setComplaints(json.complaints || []);
        setSummary(json.summary || null);
      }
    } catch (err) {
      console.error("Failed to load reports data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (complaints.length === 0) {
      alert("No complaints submitted yet to export.");
      return;
    }

    const headers = [
      "Ticket ID",
      "Title",
      "Category",
      "Priority",
      "Status",
      "Location",
      "Submitted At",
      "Resolved At",
      "Assigned Squad",
      "Assigned Technician",
    ];

    const rows = complaints.map((c) => [
      c.ticket_id,
      `"${(c.title || "").replace(/"/g, '""')}"`,
      c.category,
      c.priority,
      c.status,
      `"${c.location?.name || ""}"`,
      c.submitted_at,
      c.resolved_at || "N/A",
      `"${c.assigned_team?.name || "Unassigned"}"`,
      `"${c.assigned_staff?.name || "Unassigned"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `campus_maintenance_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <h1 className="page-title" style={{ margin: 0 }}>Executive Maintenance Reports</h1>
            <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              Live Audit Log
            </span>
          </div>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Export institutional records, compliance certs, and comprehensive complaint lifecycle audits.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            onClick={() => loadData()}
            className="btn btn-secondary btn-sm"
            title="Refresh Report"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Sync
          </button>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm">
            <Printer size={16} /> Print Report
          </button>
          <button onClick={handleExportCSV} className="btn btn-primary btn-sm">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Box */}
      {summary && (
        <div
          className="card"
          style={{
            padding: "1.5rem",
            marginBottom: "1.5rem",
            background: "white",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: "1rem",
              marginBottom: "1rem",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#102a43", margin: 0 }}>
                Campus Maintenance Health Summary
              </h2>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Real-Time Institutional Audit • Smart Campus Care System
              </span>
            </div>
            <span className="badge badge-success" style={{ fontSize: "0.8125rem" }}>
              SLA Compliance: {summary.slaCompliance}%
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "1rem",
              textAlign: "center",
            }}
          >
            <div style={{ padding: "0.75rem", background: "#f8fafc", borderRadius: "0.5rem" }}>
              <div style={{ fontSize: "1.375rem", fontWeight: 700, color: "#102a43" }}>
                {summary.totalComplaints}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Total Logged</div>
            </div>
            <div style={{ padding: "0.75rem", background: "#f8fafc", borderRadius: "0.5rem" }}>
              <div style={{ fontSize: "1.375rem", fontWeight: 700, color: "#059669" }}>
                {summary.resolvedComplaints}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Resolved</div>
            </div>
            <div style={{ padding: "0.75rem", background: "#f8fafc", borderRadius: "0.5rem" }}>
              <div style={{ fontSize: "1.375rem", fontWeight: 700, color: "#d97706" }}>
                {summary.openComplaints}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>In Progress</div>
            </div>
            <div style={{ padding: "0.75rem", background: "#f8fafc", borderRadius: "0.5rem" }}>
              <div style={{ fontSize: "1.375rem", fontWeight: 700, color: summary.overdueComplaints > 0 ? "#dc2626" : "#64748b" }}>
                {summary.overdueComplaints}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Overdue Target</div>
            </div>
          </div>
        </div>
      )}

      {/* Report Records Table */}
      <div className="table-container">
        {complaints.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#64748b" }}>
            <FileText size={40} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#334e68", marginBottom: "0.25rem" }}>
              No Complaints Logged Yet
            </h3>
            <p style={{ fontSize: "0.8125rem", margin: 0 }}>
              Live complaints submitted by students will automatically populate this executive audit log.
            </p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Category</th>
                <th>Issue Summary</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Squad</th>
                <th>Date Logged</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#0f766e" }}>
                      {c.ticket_id}
                    </span>
                  </td>
                  <td>{CATEGORY_LABELS[c.category] || c.category}</td>
                  <td style={{ maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.title}
                  </td>
                  <td>{c.location?.name || "Campus"}</td>
                  <td>
                    <span
                      className={
                        c.priority === "critical"
                          ? "badge badge-error"
                          : c.priority === "high"
                          ? "badge badge-warning"
                          : "badge badge-neutral"
                      }
                      style={{ textTransform: "capitalize" }}
                    >
                      {c.priority}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-neutral">
                      {STATUS_LABELS[c.status] || c.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.8125rem", color: "#334e68" }}>
                      {c.assigned_team?.name || "—"}
                    </span>
                  </td>
                  <td>{formatDate(c.submitted_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
