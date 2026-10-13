"use client";

import { useEffect, useState } from "react";
import { Users, Wrench, Phone, CheckCircle2, Clock, ShieldCheck, RefreshCw } from "lucide-react";
import { MaintenanceTeam, MaintenanceStaff, SPECIALTY_LABELS } from "@/lib/types";

export default function PrincipalTeamsPage() {
  const [teams, setTeams] = useState<MaintenanceTeam[]>([]);
  const [staff, setStaff] = useState<MaintenanceStaff[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setTeams(json.teams || []);
        setStaff(json.staff || []);
        setComplaints(json.complaints || []);
      }
    } catch (err) {
      console.error("Failed to fetch teams data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

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
            <h1 className="page-title" style={{ margin: 0 }}>Campus Maintenance Squads & Workload</h1>
            <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              Live Squad Tracker
            </span>
          </div>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Supervise departmental squads, active technician counts, and real-time workload allocation across campus.
          </p>
        </div>
        <button
          onClick={() => loadData()}
          className="btn btn-secondary btn-sm"
          title="Refresh Squads"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Sync
        </button>
      </div>

      {/* Teams Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        {teams.map((team) => {
          const teamStaff = staff.filter((s) => s.team_id === team.id);
          const activeTasks = complaints.filter(
            (c) =>
              c.assigned_team_id === team.id &&
              !["resolved", "verified", "closed"].includes(c.status)
          ).length;
          const completedTasks = complaints.filter(
            (c) =>
              c.assigned_team_id === team.id &&
              ["resolved", "verified", "closed"].includes(c.status)
          ).length;

          return (
            <div
              key={team.id}
              className="card"
              style={{
                padding: "1.5rem",
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
                      fontSize: "1.0625rem",
                      fontWeight: 700,
                      color: "#102a43",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {team.name}
                  </h3>
                  <span className="badge badge-neutral">
                    {SPECIALTY_LABELS[team.specialty] || team.specialty}
                  </span>
                </div>
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    background: "#f0f4f8",
                    borderRadius: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#102a43",
                  }}
                >
                  <Wrench size={18} />
                </div>
              </div>

              {/* Metrics */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                  margin: "1rem 0",
                  padding: "0.875rem",
                  background: "#f8fafc",
                  borderRadius: "0.5rem",
                  border: "1px solid #f1f5f9",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Active Workload</div>
                  <div style={{ fontSize: "1.375rem", fontWeight: 700, color: activeTasks > 0 ? "#d97706" : "#64748b" }}>
                    {activeTasks}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Resolved All-Time</div>
                  <div style={{ fontSize: "1.375rem", fontWeight: 700, color: "#059669" }}>
                    {completedTasks}
                  </div>
                </div>
              </div>

              {/* Staff List */}
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#64748b",
                    marginBottom: "0.5rem",
                  }}
                >
                  Roster ({teamStaff.length} Technicians)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  {teamStaff.length > 0 ? (
                    teamStaff.map((person) => (
                      <div
                        key={person.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.8125rem",
                          color: "#334e68",
                          padding: "0.25rem 0",
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>{person.name}</span>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {person.phone || "On Campus"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      No individual technicians assigned to squad
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
