"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Phone, Wrench, CheckCircle2, X, RefreshCw, Shield, AlertCircle } from "lucide-react";
import { MaintenanceStaff, MaintenanceTeam, MaintenanceSpecialty, SPECIALTY_LABELS } from "@/lib/types";

export default function ComplaintTeamStaffPage() {
  const [staff, setStaff] = useState<MaintenanceStaff[]>([]);
  const [teams, setTeams] = useState<MaintenanceTeam[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newSpecialty, setNewSpecialty] = useState<MaintenanceSpecialty>("electrical");
  const [newTeamId, setNewTeamId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setStaff(json.staff || []);
        setTeams(json.teams || []);
        setComplaints(json.complaints || []);
      }
    } catch (err) {
      console.error("Failed to load staff roster data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAddTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          phone: newPhone.trim() || null,
          specialty: newSpecialty,
          team_id: newTeamId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add technician");
      }

      setShowAddModal(false);
      setNewName("");
      setNewPhone("");
      setNewTeamId("");
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create staff member.");
    } finally {
      setSubmitting(false);
    }
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
            <h1 className="page-title" style={{ margin: 0 }}>Maintenance Personnel & Technicians</h1>
            <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              Live Roster
            </span>
          </div>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Manage the registered on-campus technician roster, specialty trades, and live task allocations.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            onClick={() => loadData()}
            className="btn btn-secondary btn-sm"
            title="Refresh Roster"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Sync
          </button>
          <button
            onClick={() => {
              setErrorMsg("");
              setShowAddModal(true);
            }}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} /> Register Technician
          </button>
        </div>
      </div>

      {/* Staff Roster Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {staff.map((person) => {
          const activeCount = complaints.filter(
            (c) =>
              c.assigned_staff_id === person.id &&
              !["resolved", "verified", "closed"].includes(c.status)
          ).length;

          const completedCount = complaints.filter(
            (c) =>
              c.assigned_staff_id === person.id &&
              ["resolved", "verified", "closed"].includes(c.status)
          ).length;

          const team = teams.find((t) => t.id === person.team_id);

          return (
            <div
              key={person.id}
              className="card"
              style={{
                padding: "1.25rem",
                transition: "all 0.2s ease",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "0.75rem",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#102a43",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {person.name}
                  </h3>
                  <span className="badge badge-neutral">
                    {SPECIALTY_LABELS[person.specialty] || person.specialty}
                  </span>
                </div>
                <span className="badge badge-success">On Duty</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.8125rem",
                  color: "#475569",
                  marginBottom: "0.875rem",
                }}
              >
                <Phone size={14} color="#64748b" />
                <span>{person.phone || "No phone registered"}</span>
              </div>

              <div
                style={{
                  paddingTop: "0.75rem",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.8125rem",
                }}
              >
                <span style={{ color: "#64748b" }}>Squad: {team?.name || person.team?.name || "Unassigned"}</span>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, color: activeCount > 0 ? "#d97706" : "#64748b" }}>
                    {activeCount} Active
                  </span>
                  <span style={{ color: "#cbd5e1" }}>•</span>
                  <span style={{ fontWeight: 600, color: "#059669" }}>
                    {completedCount} Done
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD TECHNICIAN MODAL */}
      {showAddModal && (
        <div className="dialog-overlay" onClick={() => setShowAddModal(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "28rem" }}>
            <div className="dialog-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#102a43", margin: 0 }}>
                Register New Technician
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div
                style={{
                  margin: "1rem 1.5rem 0",
                  padding: "0.75rem 1rem",
                  background: "#fee2e2",
                  border: "1px solid #f87171",
                  borderRadius: "0.5rem",
                  color: "#991b1b",
                  fontSize: "0.8125rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddTechnician}>
              <div className="dialog-body">
                <div style={{ marginBottom: "1rem" }}>
                  <label className="label">Technician Full Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Ramesh Chandra"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label className="label">Phone Contact</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. +91 98450 11223"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label className="label">Specialty Trade</label>
                  <select
                    className="input select"
                    value={newSpecialty}
                    onChange={(e: any) => setNewSpecialty(e.target.value)}
                  >
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="furniture_carpentry">Furniture & Carpentry</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="it_support">IT Support</option>
                    <option value="general_maintenance">General Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="label">Assigned Squad</label>
                  <select
                    className="input select"
                    value={newTeamId}
                    onChange={(e) => setNewTeamId(e.target.value)}
                  >
                    <option value="">-- Choose Squad --</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="dialog-footer">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary btn-sm"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? "Saving..." : "Add to Roster"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
