"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Wrench,
  Clock,
  User,
  Users,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Pause,
  AlertCircle,
  FileText,
  ShieldAlert,
  Send,
  X,
} from "lucide-react";
import {
  Complaint,
  MaintenanceTeam,
  MaintenanceStaff,
  ComplaintStatus,
  ComplaintPriority,
  STATUS_LABELS,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
} from "@/lib/types";
import { formatDateTime, formatTimeAgo, getTimeRemaining } from "@/lib/utils";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

function ComplaintWorkflowDetailContent({ params }: PageProps) {
  const resolvedParams = use(params);
  const complaintId = resolvedParams.id;
  const router = useRouter();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [teams, setTeams] = useState<MaintenanceTeam[]>([]);
  const [staff, setStaff] = useState<MaintenanceStaff[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [repairNotes, setRepairNotes] = useState("");
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [delayReason, setDelayReason] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const [activeActionModal, setActiveActionModal] = useState<
    "assign" | "resolve" | "delay" | "hold" | "priority" | null
  >(null);
  const [newPriority, setNewPriority] = useState<ComplaintPriority>("normal");

  const loadData = async () => {
    try {
      const [compRes, dataRes] = await Promise.all([
        fetch(`/api/complaints/${complaintId}`, { cache: "no-store" }),
        fetch("/api/data", { cache: "no-store" }),
      ]);

      if (compRes.ok) {
        const comp = await compRes.json();
        setComplaint(comp);
        setSelectedTeamId(comp.assigned_team_id || "");
        setSelectedStaffId(comp.assigned_staff_id || "");
        setNewPriority(comp.priority);
      }

      if (dataRes.ok) {
        const full = await dataRes.json();
        setTeams(full.teams || []);
        setStaff(full.staff || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [complaintId]);

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const executePatch = async (payload: any, successMsg: string) => {
    try {
      const res = await fetch(`/api/complaints/${complaintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setComplaint(updated);
      setActiveActionModal(null);
      showNotification(successMsg);
    } catch {
      alert("Failed to update complaint workflow.");
    }
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    const team = teams.find((t) => t.id === selectedTeamId);
    const technician = staff.find((s) => s.id === selectedStaffId);

    const desc = technician
      ? `Task assigned to ${team?.name} (Technician: ${technician.name})`
      : `Task dispatched to ${team?.name}`;

    executePatch(
      {
        type: "assigned",
        performerName: "Complaint Dispatch Desk",
        description: desc,
        status: "assigned",
        assignedTeamId: selectedTeamId || null,
        assignedStaffId: selectedStaffId || null,
      },
      "Assignment updated and maintenance personnel dispatched."
    );
  };

  const handleStartWork = () => {
    if (!complaint) return;
    executePatch(
      {
        type: "status_change",
        performerName: complaint.assigned_staff?.name || "Maintenance Squad",
        description: "Technician arrived on-site and initiated repair diagnostics.",
        status: "in_progress",
      },
      "Work started! Status moved to In Progress."
    );
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    if (!repairNotes.trim()) {
      alert("Please provide completion notes describing the fix.");
      return;
    }

    executePatch(
      {
        type: "verification_requested",
        performerName: complaint.assigned_staff?.name || "Technician",
        description: `Repair completed: "${repairNotes.trim()}". Awaiting student/coordinator verification.`,
        status: "resolved",
        resolutionNotes: repairNotes.trim(),
        evidenceUrl: evidencePreview || undefined,
      },
      "Repair marked resolved! Student verification request sent."
    );
    setRepairNotes("");
    setEvidencePreview(null);
  };

  const handleDelaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !delayReason.trim()) return;

    executePatch(
      {
        type: "delay_reason",
        performerName: "Complaint Coordinator",
        description: `Operational Delay Logged: "${delayReason.trim()}"`,
      },
      "Delay reason recorded in ticket audit trail."
    );
    setDelayReason("");
  };

  const handleHoldToggle = () => {
    if (!complaint) return;
    const newStatus: ComplaintStatus = complaint.status === "on_hold" ? "in_progress" : "on_hold";
    const desc =
      newStatus === "on_hold"
        ? "Task placed On Hold pending spare parts/access approval."
        : "Hold released. Repair work resumed.";

    executePatch(
      {
        type: "on_hold",
        performerName: "Complaint Coordinator",
        description: desc,
        status: newStatus,
      },
      `Ticket status updated to ${newStatus}.`
    );
  };

  const handlePriorityChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    executePatch(
      {
        type: "priority_change",
        performerName: "Complaint Coordinator",
        description: `Priority adjusted to ${newPriority.toUpperCase()}`,
        priority: newPriority,
      },
      `Priority updated to ${newPriority}.`
    );
  };

  const handleEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEvidencePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <AlertCircle size={36} color="#dc2626" style={{ margin: "0 auto 1rem" }} />
        <h2>Ticket Not Found</h2>
        <Link href="/complaint-team/complaints" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          Return to Queue
        </Link>
      </div>
    );
  }

  const remaining = complaint.resolution_deadline
    ? getTimeRemaining(complaint.resolution_deadline)
    : null;
  const eligibleStaff = staff.filter((s) => !selectedTeamId || s.team_id === selectedTeamId);

  return (
    <div className="animate-fade-in" style={{ maxWidth: "60rem" }}>
      {/* Back button */}
      <div style={{ marginBottom: "1.25rem" }}>
        <Link
          href="/complaint-team/complaints"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            fontSize: "0.8125rem",
            color: "#64748b",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={14} /> Back to Complaint Queue
        </Link>
      </div>

      {feedbackMessage && (
        <div
          className="animate-fade-in"
          style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            padding: "0.875rem 1rem",
            borderRadius: "0.5rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <CheckCircle2 size={16} color="#059669" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Main Ticket Card */}
      <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1.5rem",
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
              <span
                className={
                  complaint.is_critical_safety || complaint.priority === "critical"
                    ? "badge badge-error"
                    : complaint.priority === "high"
                    ? "badge badge-warning"
                    : "badge badge-neutral"
                }
              >
                {PRIORITY_LABELS[complaint.priority]} Priority
              </span>
            </div>
            <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
              {complaint.title}
            </h1>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button onClick={() => setActiveActionModal("assign")} className="btn btn-primary btn-sm">
              <Users size={14} /> Assign / Dispatch
            </button>

            {complaint.status === "assigned" && (
              <button onClick={handleStartWork} className="btn btn-secondary btn-sm">
                <Wrench size={14} /> Start Work
              </button>
            )}

            {complaint.status !== "resolved" && complaint.status !== "verified" && (
              <button
                onClick={() => setActiveActionModal("resolve")}
                className="btn btn-secondary btn-sm"
                style={{ color: "#059669", borderColor: "#a7f3d0" }}
              >
                <CheckCircle2 size={14} /> Mark as Resolved
              </button>
            )}

            <button onClick={() => setActiveActionModal("delay")} className="btn btn-secondary btn-sm">
              Record Delay
            </button>

            <button onClick={handleHoldToggle} className="btn btn-secondary btn-sm">
              <Pause size={14} /> {complaint.status === "on_hold" ? "Resume" : "Put On Hold"}
            </button>

            <button onClick={() => setActiveActionModal("priority")} className="btn btn-secondary btn-sm">
              Change Priority
            </button>
          </div>
        </div>

        {/* Details Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            padding: "1.25rem",
            background: "#f8fafc",
            borderRadius: "0.75rem",
            border: "1px solid #e2e8f0",
            fontSize: "0.8125rem",
          }}
        >
          <div>
            <span style={{ color: "#64748b" }}>Campus Location:</span>
            <div style={{ fontWeight: 700, color: "#0f172a", marginTop: "0.15rem" }}>
              {complaint.location?.name || "Campus"}
            </div>
          </div>
          <div>
            <span style={{ color: "#64748b" }}>Registered Asset:</span>
            <div style={{ fontWeight: 700, color: "#0f172a", marginTop: "0.15rem" }}>
              {complaint.asset ? `${complaint.asset.name} [${complaint.asset.identifier || ""}]` : "General Area"}
            </div>
          </div>
          <div>
            <span style={{ color: "#64748b" }}>Assigned Squad / Tech:</span>
            <div style={{ fontWeight: 700, color: "#0f172a", marginTop: "0.15rem" }}>
              {complaint.assigned_team?.name || "Unassigned"}
              {complaint.assigned_staff && ` (${complaint.assigned_staff.name})`}
            </div>
          </div>
          <div>
            <span style={{ color: "#64748b" }}>Target SLA:</span>
            <div
              style={{
                fontWeight: 700,
                marginTop: "0.15rem",
                color: remaining?.isOverdue ? "#dc2626" : "#2563eb",
              }}
            >
              {remaining ? remaining.text : "Completed"}
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.375rem" }}>
            Reported Description
          </div>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#334155",
              lineHeight: 1.6,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              padding: "1rem",
              borderRadius: "0.5rem",
              whiteSpace: "pre-line",
            }}
          >
            {complaint.description}
          </p>
        </div>

        {/* Photos */}
        {complaint.attachments && complaint.attachments.length > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.5rem" }}>
              Photographs & Evidence
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {complaint.attachments.map((att) => (
                <div key={att.id} style={{ borderRadius: "0.5rem", overflow: "hidden", border: "1px solid #e2e8f0", width: "140px", height: "140px" }}>
                  <img src={att.file_url} alt={att.file_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completion notes */}
        {complaint.resolution_notes && (
          <div style={{ marginTop: "1.5rem", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "0.5rem", padding: "1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#065f46", marginBottom: "0.25rem" }}>
              Completion & Resolution Notes
            </div>
            <div style={{ fontSize: "0.875rem", color: "#065f46", lineHeight: 1.5 }}>
              {complaint.resolution_notes}
            </div>
          </div>
        )}
      </div>

      {/* Activity Trail */}
      <div className="card" style={{ padding: "1.75rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Clock size={16} color="#64748b" /> Complete Repair Audit Trail
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {complaint.updates?.map((upd, idx) => (
            <div key={upd.id || idx} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.75rem", background: "#f8fafc", borderRadius: "0.5rem", border: "1px solid #f1f5f9" }}>
              <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>
                {idx + 1}
              </div>
              <div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#0f172a" }}>
                  {upd.description}
                </div>
                <div style={{ fontSize: "0.725rem", color: "#64748b" }}>
                  By {upd.performer_name || "System"} • {formatTimeAgo(upd.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODALS */}
      {activeActionModal === "assign" && (
        <div className="dialog-overlay" onClick={() => setActiveActionModal(null)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
                Assign Maintenance Squad & Technician
              </h3>
            </div>
            <form onSubmit={handleAssignSubmit}>
              <div className="dialog-body">
                <div style={{ marginBottom: "1rem" }}>
                  <label className="label">Maintenance Team</label>
                  <select
                    className="input select"
                    value={selectedTeamId}
                    onChange={(e) => {
                      setSelectedTeamId(e.target.value);
                      setSelectedStaffId("");
                    }}
                    required
                  >
                    <option value="">-- Choose Squad --</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label className="label">Lead Technician (Optional)</label>
                  <select
                    className="input select"
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                  >
                    <option value="">-- General Squad Dispatch --</option>
                    {eligibleStaff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.phone || "On Duty"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="dialog-footer">
                <button type="button" onClick={() => setActiveActionModal(null)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeActionModal === "resolve" && (
        <div className="dialog-overlay" onClick={() => setActiveActionModal(null)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
                Mark Repair as Resolved
              </h3>
            </div>
            <form onSubmit={handleResolveSubmit}>
              <div className="dialog-body">
                <div style={{ marginBottom: "1rem" }}>
                  <label className="label">Technician Repair Completion Notes</label>
                  <textarea
                    className="input textarea"
                    placeholder="Describe repair actions, parts replaced, and test checks..."
                    value={repairNotes}
                    onChange={(e) => setRepairNotes(e.target.value)}
                    required
                    rows={4}
                  />
                </div>

                <div>
                  <label className="label">Repair Completion Evidence (Optional)</label>
                  {evidencePreview ? (
                    <div style={{ position: "relative", width: "100%", maxHeight: "160px", overflow: "hidden", borderRadius: "0.5rem" }}>
                      <img src={evidencePreview} alt="Evidence preview" style={{ width: "100%", height: "160px", objectFit: "cover" }} />
                      <button type="button" onClick={() => setEvidencePreview(null)} style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: "50%", padding: "0.25rem" }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1.25rem", border: "2px dashed #cbd5e1", borderRadius: "0.5rem", cursor: "pointer" }}>
                      <Upload size={18} color="#64748b" />
                      <span style={{ fontSize: "0.8125rem", color: "#475569", marginTop: "0.25rem" }}>
                        Upload repair completion evidence photo
                      </span>
                      <input type="file" accept="image/*" onChange={handleEvidenceUpload} style={{ display: "none" }} />
                    </label>
                  )}
                </div>
              </div>

              <div className="dialog-footer">
                <button type="button" onClick={() => setActiveActionModal(null)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ background: "#059669", borderColor: "#059669" }}>
                  Submit & Await Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeActionModal === "delay" && (
        <div className="dialog-overlay" onClick={() => setActiveActionModal(null)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
                Record Delay Reason
              </h3>
            </div>
            <form onSubmit={handleDelaySubmit}>
              <div className="dialog-body">
                <label className="label">Authorized Reason for Delay</label>
                <textarea
                  className="input textarea"
                  placeholder="e.g. Waiting for vendor delivery of spare capacitors..."
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  required
                  rows={3}
                />
              </div>
              <div className="dialog-footer">
                <button type="button" onClick={() => setActiveActionModal(null)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Delay Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeActionModal === "priority" && (
        <div className="dialog-overlay" onClick={() => setActiveActionModal(null)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
                Adjust Complaint Priority
              </h3>
            </div>
            <form onSubmit={handlePriorityChange}>
              <div className="dialog-body">
                <label className="label">New Priority Level</label>
                <select className="input select" value={newPriority} onChange={(e: any) => setNewPriority(e.target.value)}>
                  <option value="critical">Critical (Immediate safety intervention)</option>
                  <option value="high">High (Classroom / lab disruptive)</option>
                  <option value="normal">Normal (Standard 24-hour target)</option>
                  <option value="low">Low (Aesthetic / minor maintenance)</option>
                </select>
              </div>
              <div className="dialog-footer">
                <button type="button" onClick={() => setActiveActionModal(null)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Update Priority
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComplaintWorkflowDetailPage(props: PageProps) {
  return (
    <Suspense fallback={<div style={{ padding: "4rem", textAlign: "center" }}><div className="spinner" /></div>}>
      <ComplaintWorkflowDetailContent {...props} />
    </Suspense>
  );
}
