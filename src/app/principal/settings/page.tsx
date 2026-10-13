"use client";

import { useEffect, useState } from "react";
import { Settings, Shield, Clock, Save, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { SlaPolicy, PRIORITY_LABELS } from "@/lib/types";

export default function PrincipalSettingsPage() {
  const [policies, setPolicies] = useState<SlaPolicy[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setPolicies(json.slaPolicies || []);
      }
    } catch (err) {
      console.error("Failed to load SLA policies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdatePolicy = (
    id: string,
    field: "response_time_minutes" | "resolution_time_minutes",
    val: number
  ) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policies: policies.map((p) => ({
            id: p.id,
            response_time_minutes: Number(p.response_time_minutes),
            resolution_time_minutes: Number(p.resolution_time_minutes),
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update policies");
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save policy changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "52rem" }}>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">SLA Policies & System Configuration</h1>
        <p className="page-subtitle">
          Authorized administrative policy control for campus resolution targets and role verification.
        </p>
      </div>

      {savedSuccess && (
        <div
          className="animate-fade-in"
          style={{
            background: "#d1fae5",
            border: "1px solid #6ee7b7",
            color: "#065f46",
            borderRadius: "0.5rem",
            padding: "0.875rem 1rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <CheckCircle2 size={18} color="#059669" />
          <span>SLA policies updated successfully in the live campus database.</span>
        </div>
      )}

      {errorMsg && (
        <div
          className="animate-fade-in"
          style={{
            background: "#fee2e2",
            border: "1px solid #f87171",
            color: "#991b1b",
            borderRadius: "0.5rem",
            padding: "0.875rem 1rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <AlertCircle size={18} color="#dc2626" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SLA Policy Editor */}
      <div className="card" style={{ padding: "1.75rem", marginBottom: "1.5rem", border: "1px solid #e2e8f0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Clock size={20} color="#102a43" />
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#102a43", margin: 0 }}>
              Complaint Priority & SLA Deadlines
            </h2>
          </div>
          <button
            onClick={() => loadData()}
            className="btn btn-secondary btn-sm"
            title="Reload from Server"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Reload
          </button>
        </div>

        <form onSubmit={handleSaveAll}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {policies.map((policy) => {
              const resolutionHours = Math.round(policy.resolution_time_minutes / 60);

              return (
                <div
                  key={policy.id}
                  style={{
                    padding: "1.125rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem",
                    background: "#f8fafc",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <span
                      className={
                        policy.priority === "critical"
                          ? "badge badge-error"
                          : policy.priority === "high"
                          ? "badge badge-warning"
                          : policy.priority === "normal"
                          ? "badge badge-info"
                          : "badge badge-neutral"
                      }
                      style={{ fontSize: "0.8125rem", textTransform: "capitalize" }}
                    >
                      {PRIORITY_LABELS[policy.priority]} Priority
                    </span>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.375rem" }}>
                      Target resolution: ~{resolutionHours} {resolutionHours === 1 ? "Hour" : "Hours"}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", color: "#475569", display: "block", marginBottom: "0.25rem" }}>
                        Response Target (Mins)
                      </label>
                      <input
                        type="number"
                        className="input"
                        style={{ width: "120px", padding: "0.375rem 0.5rem" }}
                        value={policy.response_time_minutes}
                        onChange={(e) =>
                          handleUpdatePolicy(policy.id, "response_time_minutes", Number(e.target.value))
                        }
                        min={5}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.75rem", color: "#475569", display: "block", marginBottom: "0.25rem" }}>
                        Resolution Target (Mins)
                      </label>
                      <input
                        type="number"
                        className="input"
                        style={{ width: "120px", padding: "0.375rem 0.5rem" }}
                        value={policy.resolution_time_minutes}
                        onChange={(e) =>
                          handleUpdatePolicy(policy.id, "resolution_time_minutes", Number(e.target.value))
                        }
                        min={30}
                        required
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? "Saving Changes..." : "Save Policy Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Role Authorization Verification Box */}
      <div className="card" style={{ padding: "1.75rem", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <Shield size={20} color="#102a43" />
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#102a43", margin: 0 }}>
            Authorized Role Access Control
          </h2>
        </div>
        <p style={{ fontSize: "0.8125rem", color: "#627d98", marginBottom: "1.25rem" }}>
          Access to staff dashboards is authenticated against these registered administrative Google accounts:
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div
            style={{
              padding: "0.875rem 1rem",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "0.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#166534" }}>
                Principal Oversight Role
              </div>
              <div style={{ fontSize: "0.8125rem", color: "#15803d", fontFamily: "monospace" }}>
                rikashrikash04@gmail.com
              </div>
            </div>
            <span className="badge badge-success">Authorized</span>
          </div>

          <div
            style={{
              padding: "0.875rem 1rem",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "0.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1e40af" }}>
                Complaint Operations & Dispatch Role
              </div>
              <div style={{ fontSize: "0.8125rem", color: "#1d4ed8", fontFamily: "monospace" }}>
                mohdnoupa2005@gmail.com
              </div>
            </div>
            <span className="badge badge-info">Authorized</span>
          </div>
        </div>
      </div>
    </div>
  );
}
