"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Wrench,
  User,
  MapPin,
  Calendar,
  RotateCcw,
  Check,
  FileText,
  Camera,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Complaint, STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from "@/lib/types";
import { formatDateTime, getTimeRemaining, formatTimeAgo } from "@/lib/utils";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ token: string }>;
}

function TrackComplaintContent({ params }: PageProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [reopenReason, setReopenReason] = useState("");
  const [showReopenInput, setShowReopenInput] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadTicket();
  }, [token]);

  const loadTicket = async () => {
    try {
      const res = await fetch("/api/data");
      if (res.ok) {
        const data = await res.json();
        const found = (data.complaints || []).find((c: Complaint) => c.tracking_token === token);
        setComplaint(found || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!complaint) return;
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, verified: true }),
      });
      if (res.ok) {
        const updated = await res.json();
        setComplaint(updated);
        setActionSuccess("Thank you! You verified the repair. This ticket is now closed.");
      }
    } catch {
      alert("Failed to confirm fix. Please try again.");
    }
  };

  const handleReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !reopenReason.trim()) return;
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, verified: false, notes: reopenReason.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setComplaint(updated);
        setShowReopenInput(false);
        setReopenReason("");
        setActionSuccess("Ticket reopened and re-flagged to the maintenance squad.");
      }
    } catch {
      alert("Failed to reopen ticket. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <div className="spinner" />
        <p style={{ marginTop: "1rem", color: "#64748b" }}>Loading ticket status...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%), url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2000&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "2rem",
        }}
      >
        <div className="glass-card" style={{ maxWidth: "28rem", textAlign: "center", padding: "2.5rem" }}>
          <AlertCircle size={36} color="#dc2626" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
            Ticket Not Found
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1.5rem" }}>
            The tracking link may be invalid. Check the confirmation link or submit a new report.
          </p>
          <Link href="/report" className="btn btn-primary">
            Submit a Complaint
          </Link>
        </div>
      </div>
    );
  }

  const remaining = complaint.resolution_deadline
    ? getTimeRemaining(complaint.resolution_deadline)
    : null;

  const isResolvedOrClosed = ["resolved", "verified", "closed"].includes(complaint.status);
  const isAwaitingVerification = complaint.status === "resolved";

  const lifecycleSteps = [
    { key: "submitted", label: "Submitted" },
    { key: "assigned", label: "Assigned" },
    { key: "in_progress", label: "In Progress" },
    { key: "resolved", label: "Resolved" },
    { key: "verified", label: "Verified & Closed" },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "submitted":
        return 0;
      case "assigned":
        return 1;
      case "in_progress":
        return 2;
      case "resolved":
        return 3;
      case "verified":
      case "closed":
        return 4;
      case "reopened":
        return 2;
      default:
        return 0;
    }
  };

  const currentStepIndex = getStepIndex(complaint.status);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.94) 0%, rgba(248, 250, 252, 0.98) 100%), url('https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=2000&q=80')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        paddingBottom: "3rem",
      }}
    >
      <header
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e2e8f0",
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            color: "#0f172a",
            fontWeight: 800,
          }}
        >
          <div
            style={{
              width: "1.75rem",
              height: "1.75rem",
              background: "#0f172a",
              borderRadius: "0.375rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={12} color="white" />
          </div>
          Smart Campus Care
        </Link>
        <Link href="/report" className="btn btn-secondary btn-sm">
          Report Another Issue
        </Link>
      </header>

      <main style={{ maxWidth: "46rem", margin: "2rem auto", padding: "0 1.25rem" }}>
        {actionSuccess && (
          <div
            className="animate-fade-in"
            style={{
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
              borderRadius: "0.5rem",
              padding: "0.875rem 1rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            <CheckCircle2 size={18} color="#059669" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Card */}
        <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                <span style={{ fontFamily: "monospace", fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
                  {complaint.ticket_id}
                </span>
                <span
                  className={
                    complaint.status === "verified" || complaint.status === "closed"
                      ? "badge badge-success"
                      : complaint.status === "resolved"
                      ? "badge badge-info"
                      : complaint.status === "in_progress"
                      ? "badge badge-warning"
                      : "badge badge-neutral"
                  }
                >
                  {STATUS_LABELS[complaint.status]}
                </span>
                {complaint.is_critical_safety && (
                  <span className="badge badge-error">Critical Safety</span>
                )}
                {complaint.is_overdue && <span className="badge badge-error">Overdue</span>}
              </div>
              <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
                {complaint.title}
              </h1>
            </div>

            {remaining && !isResolvedOrClosed && (
              <div
                style={{
                  background: remaining.isOverdue ? "#fee2e2" : "#eff6ff",
                  border: `1px solid ${remaining.isOverdue ? "#fca5a5" : "#bfdbfe"}`,
                  borderRadius: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "0.8125rem",
                  color: remaining.isOverdue ? "#dc2626" : "#2563eb",
                  fontWeight: 600,
                }}
              >
                <Clock size={14} />
                <span>Target: {remaining.text}</span>
              </div>
            )}
          </div>

          {/* Details Bar */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1.25rem",
              padding: "0.75rem 0",
              borderTop: "1px solid #f1f5f9",
              borderBottom: "1px solid #f1f5f9",
              marginBottom: "1.5rem",
              fontSize: "0.8125rem",
              color: "#475569",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <MapPin size={15} color="#059669" />
              <span>
                <strong>{complaint.location?.name || "Campus Location"}</strong>
              </span>
            </div>
            {complaint.asset && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <Wrench size={15} color="#d97706" />
                <span>
                  Asset: <strong>{complaint.asset.name}</strong>
                </span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <Calendar size={15} color="#64748b" />
              <span>Logged {formatDateTime(complaint.submitted_at)}</span>
            </div>
            {complaint.assigned_team && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <User size={15} color="#2563eb" />
                <span>
                  Squad: <strong>{complaint.assigned_team.name}</strong>
                  {complaint.assigned_staff && ` (${complaint.assigned_staff.name})`}
                </span>
              </div>
            )}
          </div>

          {/* Progress Timeline */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              Repair Progress Status
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.375rem" }}>
              {lifecycleSteps.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                return (
                  <div key={step.key} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        height: "6px",
                        borderRadius: "3px",
                        background: isPassed
                          ? idx === 4
                            ? "#059669"
                            : "#0f172a"
                          : "#e2e8f0",
                        marginBottom: "0.5rem",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: isPassed ? 700 : 400,
                        color: isPassed ? "#0f172a" : "#94a3b8",
                        display: "block",
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reported Description */}
          <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.25rem" }}>
              Reported Problem Description
            </div>
            <p style={{ fontSize: "0.875rem", color: "#334155", lineHeight: 1.6, whiteSpace: "pre-line" }}>
              {complaint.description}
            </p>
          </div>

          {/* Photo */}
          {complaint.attachments && complaint.attachments.length > 0 && (
            <div style={{ marginTop: "1.25rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.5rem" }}>
                Photographs & Evidence
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {complaint.attachments.map((att) => (
                  <div key={att.id} style={{ borderRadius: "0.5rem", overflow: "hidden", border: "1px solid #e2e8f0", width: "130px", height: "130px" }}>
                    <img src={att.file_url} alt={att.file_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* VERIFICATION BOX */}
        {isAwaitingVerification && (
          <div
            className="card animate-fade-in"
            style={{
              padding: "1.5rem",
              background: "#ecfdf5",
              border: "1.5px solid #6ee7b7",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "1rem" }}>
              <CheckCircle2 size={24} color="#059669" style={{ flexShrink: 0, marginTop: "0.1rem" }} />
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#065f46", marginBottom: "0.25rem" }}>
                  Technician Completed Repair!
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "#047857", lineHeight: 1.5 }}>
                  The maintenance crew marked this issue fixed. Please verify whether the repair is satisfactory.
                </p>
                {complaint.resolution_notes && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.625rem 0.875rem",
                      background: "white",
                      borderRadius: "0.375rem",
                      border: "1px solid #a7f3d0",
                      fontSize: "0.8125rem",
                      color: "#065f46",
                    }}
                  >
                    <strong>Technician Notes:</strong> {complaint.resolution_notes}
                  </div>
                )}
              </div>
            </div>

            {!showReopenInput ? (
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button
                  onClick={handleVerify}
                  className="btn btn-primary"
                  style={{ background: "#059669", borderColor: "#059669" }}
                >
                  <Check size={16} /> Confirm Fixed & Close Ticket
                </button>
                <button
                  onClick={() => setShowReopenInput(true)}
                  className="btn btn-secondary"
                  style={{ color: "#dc2626", borderColor: "#fca5a5" }}
                >
                  <RotateCcw size={16} /> Issue Still Persists / Reopen
                </button>
              </div>
            ) : (
              <form onSubmit={handleReopen} style={{ marginTop: "1rem" }}>
                <div style={{ marginBottom: "0.75rem" }}>
                  <label className="label" style={{ color: "#991b1b" }}>
                    What is still not working?
                  </label>
                  <textarea
                    className="input textarea"
                    placeholder="Describe what is still broken..."
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    required
                    rows={3}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="submit" className="btn btn-danger btn-sm">
                    Reopen Complaint
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReopenInput(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Audit Trail */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Clock size={16} color="#64748b" /> Live Activity History
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {complaint.updates && complaint.updates.length > 0 ? (
              complaint.updates.map((update, idx) => (
                <div key={update.id || idx} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "1.75rem",
                      height: "1.75rem",
                      borderRadius: "50%",
                      background: update.update_type === "submitted" ? "#dbeafe" : update.update_type === "verified" ? "#d1fae5" : "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0f172a" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#0f172a" }}>
                      {update.description}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      By {update.performer_name || "System"} • {formatTimeAgo(update.created_at)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>No updates recorded yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TrackComplaintPage(props: PageProps) {
  return (
    <Suspense fallback={<div style={{ padding: "4rem", textAlign: "center" }}><div className="spinner" /></div>}>
      <TrackComplaintContent {...props} />
    </Suspense>
  );
}
