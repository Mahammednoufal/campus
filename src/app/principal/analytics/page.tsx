"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Sparkles,
} from "lucide-react";
import { Complaint, Asset, CATEGORY_LABELS } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#102a43", "#243b53", "#334e68", "#486581", "#627d98", "#829ab1", "#9fb3c8"];

export default function PrincipalAnalyticsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number }>>([]);
  const [locationData, setLocationData] = useState<Array<{ name: string; count: number }>>([]);
  const [resolutionTrend, setResolutionTrend] = useState<Array<{ week: string; avgHours: number }>>([]);
  const [recurringIssues, setRecurringIssues] = useState<Array<{
    assetName: string;
    locationName: string;
    complaintCount: number;
    details: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  // Compute real quality metrics from data
  const [reopenRate, setReopenRate] = useState(0);
  const [firstFixRate, setFirstFixRate] = useState(100);
  const [slaAdherence, setSlaAdherence] = useState(100);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();

      const list: Complaint[] = data.complaints || [];
      const assetList: Asset[] = data.assets || [];
      setComplaints(list);
      setAssets(assetList);

      // 1. By category
      const catMap: Record<string, number> = {};
      list.forEach((c) => {
        const label = CATEGORY_LABELS[c.category] || c.category;
        catMap[label] = (catMap[label] || 0) + 1;
      });
      setCategoryData(
        Object.entries(catMap).map(([name, value]) => ({ name, value }))
      );

      // 2. By location
      const locMap: Record<string, number> = {};
      list.forEach((c) => {
        const name = c.location?.name || "Other";
        locMap[name] = (locMap[name] || 0) + 1;
      });
      setLocationData(
        Object.entries(locMap)
          .map(([name, count]) => ({ name: name.length > 20 ? name.substring(0, 18) + "…" : name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6)
      );

      // 3. Recurring asset issues detection
      const recurring: Array<{
        assetName: string;
        locationName: string;
        complaintCount: number;
        details: string;
      }> = [];

      assetList.forEach((asset) => {
        const assetComplaints = list.filter((c) => c.asset_id === asset.id);
        if (assetComplaints.length >= 2) {
          recurring.push({
            assetName: asset.name,
            locationName: asset.location?.name || "Campus",
            complaintCount: assetComplaints.length,
            details: `Multiple tickets filed. Recommended for scheduled preventive maintenance overhaul.`,
          });
        }
      });
      setRecurringIssues(recurring);

      // 4. Resolution time trend — compute from real data weekly
      const resolved = list.filter((c) => c.resolved_at && c.submitted_at);
      if (resolved.length > 0) {
        // Group into 4 weekly buckets from the earliest submission
        const now = Date.now();
        const weeks: Array<{ totalHours: number; count: number }> = [
          { totalHours: 0, count: 0 },
          { totalHours: 0, count: 0 },
          { totalHours: 0, count: 0 },
          { totalHours: 0, count: 0 },
        ];
        resolved.forEach((c) => {
          const submitted = new Date(c.submitted_at).getTime();
          const resolvedAt = new Date(c.resolved_at!).getTime();
          const hoursToResolve = (resolvedAt - submitted) / (1000 * 60 * 60);
          const daysAgo = (now - submitted) / (1000 * 60 * 60 * 24);
          const weekIdx = Math.min(3, Math.floor(daysAgo / 7));
          weeks[3 - weekIdx].totalHours += hoursToResolve;
          weeks[3 - weekIdx].count += 1;
        });
        setResolutionTrend(
          weeks.map((w, i) => ({
            week: `Wk ${i + 1}`,
            avgHours: w.count > 0 ? Math.round((w.totalHours / w.count) * 10) / 10 : 0,
          }))
        );
      }

      // 5. Quality metrics from real data
      const total = list.length;
      if (total > 0) {
        const reopened = list.filter((c) => c.reopen_count > 0).length;
        setReopenRate(Math.round((reopened / total) * 1000) / 10);

        const resolvedList = list.filter((c) =>
          ["resolved", "verified", "closed"].includes(c.status)
        );
        const firstFix = resolvedList.filter((c) => c.reopen_count === 0).length;
        setFirstFixRate(
          resolvedList.length > 0
            ? Math.round((firstFix / resolvedList.length) * 1000) / 10
            : 100
        );

        const withDeadline = resolvedList.filter(
          (c) => c.resolved_at && c.resolution_deadline
        );
        const met = withDeadline.filter(
          (c) =>
            new Date(c.resolved_at!).getTime() <=
            new Date(c.resolution_deadline!).getTime()
        ).length;
        setSlaAdherence(
          withDeadline.length > 0
            ? Math.round((met / withDeadline.length) * 100)
            : 100
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading && complaints.length === 0) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <div className="spinner" />
        <p style={{ marginTop: "1rem", color: "#64748b", fontSize: "0.875rem" }}>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="page-title">Campus Maintenance Analytics</h1>
          <p className="page-subtitle">
            Data-driven insights on facility breakdowns, resolution velocities, and preventive maintenance triggers.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#059669", animation: "pulseGlow 2s ease-in-out infinite" }} />
          <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>Live Data</span>
        </div>
      </div>

      {/* Top Recurring Equipment Failure Callout */}
      {recurringIssues.length > 0 && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "0.75rem",
            padding: "1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "#92400e",
              marginBottom: "0.5rem",
            }}
          >
            <Sparkles size={18} color="#d97706" />
            Recurring Asset Failure Prevention Alert
          </div>
          <p style={{ fontSize: "0.8125rem", color: "#78350f", marginBottom: "0.75rem" }}>
            The system tracks registered asset history to flag chronic component fatigue.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {recurringIssues.map((rec, i) => (
              <div
                key={i}
                style={{
                  background: "white",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #fef08a",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <strong style={{ color: "#1e293b", fontSize: "0.875rem" }}>
                    {rec.assetName}
                  </strong>{" "}
                  <span style={{ color: "#64748b", fontSize: "0.8125rem" }}>
                    in {rec.locationName}
                  </span>
                  <div style={{ fontSize: "0.75rem", color: "#854d0e" }}>
                    {rec.details}
                  </div>
                </div>
                <span className="badge badge-warning" style={{ fontSize: "0.75rem" }}>
                  {rec.complaintCount} Recent Complaints
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Category Share */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#102a43",
              marginBottom: "1rem",
            }}
          >
            Complaints by Category Distribution
          </h2>
          <div style={{ width: "100%", height: "240px" }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }: any) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    fontSize={11}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: "0.875rem" }}>
                Submit complaints to see category distribution
              </div>
            )}
          </div>
        </div>

        {/* Complaints by Location */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#102a43",
              marginBottom: "1rem",
            }}
          >
            Top Locations by Ticket Volume
          </h2>
          <div style={{ width: "100%", height: "240px" }}>
            {locationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Tickets" fill="#243b53" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: "0.875rem" }}>
                Submit complaints to see location breakdown
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Resolution Trend & Quality Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "1.5rem",
        }}
      >
        {/* Resolution Time Trend */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#102a43",
              marginBottom: "0.25rem",
            }}
          >
            Average Resolution Velocity (Hours)
          </h2>
          <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "1rem" }}>
            Computed from actual complaint submission-to-resolution timestamps
          </p>
          <div style={{ width: "100%", height: "200px" }}>
            {resolutionTrend.some((d) => d.avgHours > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={resolutionTrend}>
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="avgHours"
                    name="Avg Hours"
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: "0.875rem" }}>
                Resolve complaints to see velocity trends
              </div>
            )}
          </div>
        </div>

        {/* Quality Metrics — now computed from real data */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#102a43",
              marginBottom: "1rem",
            }}
          >
            Work Quality & Verification
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem",
                background: "#f8fafc",
                borderRadius: "0.5rem",
                transition: "background 0.2s ease",
              }}
            >
              <div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1e293b" }}>
                  Student Reopen Rate
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Complaints reopened by reporter
                </div>
              </div>
              <div style={{ fontSize: "1.125rem", fontWeight: 700, color: reopenRate <= 5 ? "#059669" : "#d97706" }}>
                {reopenRate}%
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem",
                background: "#f8fafc",
                borderRadius: "0.5rem",
                transition: "background 0.2s ease",
              }}
            >
              <div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1e293b" }}>
                  First-Time Fix Rate
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Resolved on first dispatch
                </div>
              </div>
              <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#2563eb" }}>
                {firstFixRate}%
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem",
                background: "#f8fafc",
                borderRadius: "0.5rem",
                transition: "background 0.2s ease",
              }}
            >
              <div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1e293b" }}>
                  SLA Target Adherence
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Resolved within deadline
                </div>
              </div>
              <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#102a43" }}>
                {slaAdherence}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
