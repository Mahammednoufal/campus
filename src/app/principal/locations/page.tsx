"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  QrCode,
  Plus,
  Printer,
  Download,
  Eye,
  X,
  Check,
  Building,
  Layers,
  DoorOpen,
  Wrench,
  FileDown,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Location, Asset } from "@/lib/types";
import QRCode from "qrcode";

export default function PrincipalLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingLoc, setSubmittingLoc] = useState(false);
  const [submittingAsset, setSubmittingAsset] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Modal states
  const [qrModalItem, setQrModalItem] = useState<{
    name: string;
    publicId: string;
    type: string;
    url: string;
    qrDataUrl: string;
  } | null>(null);

  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [newLocName, setNewLocName] = useState("");
  const [newLocType, setNewLocType] = useState<"building" | "floor" | "room" | "area">("room");
  const [newLocParentId, setNewLocParentId] = useState("");
  const [newLocDesc, setNewLocDesc] = useState("");

  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetType, setNewAssetType] = useState<any>("fan");
  const [newAssetLocationId, setNewAssetLocationId] = useState("");
  const [newAssetIdentifier, setNewAssetIdentifier] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setLocations(json.locations || []);
        setAssets(json.assets || []);
      }
    } catch (err) {
      console.error("Failed to fetch locations & assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openQrModal = async (name: string, publicId: string, type: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const reportUrl = `${origin}/report?location=${publicId}`;
    const qrData = await QRCode.toDataURL(reportUrl, {
      width: 320,
      margin: 2,
      color: { dark: "#102a43", light: "#ffffff" },
    });

    setQrModalItem({
      name,
      publicId,
      type,
      url: reportUrl,
      qrDataUrl: qrData,
    });
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;

    setSubmittingLoc(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newLocName.trim(),
          type: newLocType,
          parent_id: newLocParentId || null,
          description: newLocDesc.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create location");
      }

      setShowAddLocationModal(false);
      setNewLocName("");
      setNewLocDesc("");
      setNewLocParentId("");
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create location.");
    } finally {
      setSubmittingLoc(false);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim() || !newAssetLocationId) return;

    setSubmittingAsset(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAssetName.trim(),
          type: newAssetType,
          location_id: newAssetLocationId,
          identifier: newAssetIdentifier.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create asset");
      }

      setShowAddAssetModal(false);
      setNewAssetName("");
      setNewAssetIdentifier("");
      setNewAssetLocationId("");
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create asset.");
    } finally {
      setSubmittingAsset(false);
    }
  };

  const printQrCode = () => {
    if (!qrModalItem) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Campus QR — ${qrModalItem.name}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 40px; background: #fff; }
            .card { border: 2px solid #0f766e; border-radius: 16px; padding: 24px; max-width: 320px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
            h2 { color: #102a43; margin-bottom: 4px; font-size: 20px; font-weight: 700; }
            p { color: #627d98; font-size: 13px; margin-top: 0; }
            .badge { background: #ccfbf1; color: #0f766e; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 9999px; display: inline-block; letter-spacing: 0.05em; }
            img { margin: 16px 0; width: 220px; height: 220px; border-radius: 8px; }
            .instruction { font-size: 12px; color: #334e68; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">SMART CAMPUS CARE</span>
            <h2>${qrModalItem.name}</h2>
            <p>Scan to report maintenance complaint</p>
            <img src="${qrModalItem.qrDataUrl}" alt="QR Code" />
            <div class="instruction">Scan with any phone camera • No app needed</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const downloadQrCode = () => {
    if (!qrModalItem) return;
    const link = document.createElement("a");
    link.download = `QR-${qrModalItem.publicId}.png`;
    link.href = qrModalItem.qrDataUrl;
    link.click();
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
            <h1 className="page-title" style={{ margin: 0 }}>Campus Locations & QR Management</h1>
            <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              Live Infrastructure
            </span>
          </div>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Configure buildings, classrooms, and assets. Generate, preview, and print physical QR codes.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            onClick={() => loadData()}
            className="btn btn-secondary btn-sm"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Sync
          </button>
          <button
            onClick={() => {
              setErrorMsg("");
              setShowAddLocationModal(true);
            }}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} /> Add Location
          </button>
          <button
            onClick={() => {
              setErrorMsg("");
              setShowAddAssetModal(true);
            }}
            className="btn btn-secondary btn-sm"
          >
            <Plus size={16} /> Register Asset
          </button>
        </div>
      </div>

      {errorMsg && (
        <div
          className="animate-fade-in"
          style={{
            background: "#fee2e2",
            border: "1px solid #f87171",
            color: "#991b1b",
            borderRadius: "0.5rem",
            padding: "0.75rem 1rem",
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

      {/* Locations Table */}
      <div className="table-container" style={{ marginBottom: "2rem" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Hierarchy & Name</th>
              <th>Type</th>
              <th>Public ID</th>
              <th>Registered Assets</th>
              <th>Status</th>
              <th>QR Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => {
              const locAssets = assets.filter((a) => a.location_id === loc.id);

              return (
                <tr key={loc.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {loc.type === "building" ? (
                        <Building size={16} color="#102a43" />
                      ) : loc.type === "floor" ? (
                        <Layers size={16} color="#486581" />
                      ) : (
                        <DoorOpen size={16} color="#059669" />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: "#1e293b" }}>{loc.name}</div>
                        {loc.description && (
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            {loc.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral" style={{ textTransform: "capitalize" }}>
                      {loc.type}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.75rem",
                        color: "#475569",
                      }}
                    >
                      {loc.public_id}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.8125rem", color: "#334e68" }}>
                      {locAssets.length} assets
                    </span>
                  </td>
                  <td>
                    <span className={loc.is_active ? "badge badge-success" : "badge badge-neutral"}>
                      {loc.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => openQrModal(loc.name, loc.public_id, loc.type)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "0.25rem 0.6rem", gap: "0.25rem" }}
                    >
                      <QrCode size={14} />
                      QR Code
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Assets Section */}
      <div>
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: 700,
            color: "#102a43",
            marginBottom: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Wrench size={18} color="#64748b" />
          Registered Campus Assets & Equipment
        </h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Type</th>
                <th>Identifier Tag</th>
                <th>Location</th>
                <th>Status</th>
                <th>QR</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => {
                const loc = locations.find((l) => l.id === asset.location_id);
                return (
                  <tr key={asset.id}>
                    <td>
                      <strong>{asset.name}</strong>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ textTransform: "uppercase" }}>
                        {asset.type}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>
                        {asset.identifier || "—"}
                      </span>
                    </td>
                    <td>{loc?.name || "Campus"}</td>
                    <td>
                      <span className="badge badge-success">Active</span>
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          openQrModal(
                            `${asset.name} (${loc?.name || ""})`,
                            loc?.public_id || "main",
                            "asset"
                          )
                        }
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "0.25rem 0.5rem" }}
                      >
                        <QrCode size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR PREVIEW & PRINT MODAL */}
      {qrModalItem && (
        <div className="dialog-overlay" onClick={() => setQrModalItem(null)}>
          <div
            className="dialog"
            style={{ maxWidth: "26rem", textAlign: "center" }}
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
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#102a43", margin: 0 }}>
                Campus QR Code Label
              </h3>
              <button
                onClick={() => setQrModalItem(null)}
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

            <div className="dialog-body" style={{ padding: "1.75rem 1.5rem" }}>
              <div
                style={{
                  background: "#f8fafc",
                  border: "2px dashed #cbd5e1",
                  borderRadius: "0.75rem",
                  padding: "1.5rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#0f766e",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.25rem",
                  }}
                >
                  SMART CAMPUS CARE
                </div>
                <h4
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "#102a43",
                    marginBottom: "1rem",
                  }}
                >
                  {qrModalItem.name}
                </h4>

                <img
                  src={qrModalItem.qrDataUrl}
                  alt="QR Code"
                  style={{
                    width: "200px",
                    height: "200px",
                    margin: "0 auto 0.75rem",
                    display: "block",
                    borderRadius: "0.5rem",
                  }}
                />

                <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                  Scan with mobile camera to report any maintenance issue immediately.
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                <button onClick={printQrCode} className="btn btn-primary btn-sm">
                  <Printer size={16} /> Print Physical Label
                </button>
                <button onClick={downloadQrCode} className="btn btn-secondary btn-sm">
                  <Download size={16} /> Download PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD LOCATION MODAL */}
      {showAddLocationModal && (
        <div className="dialog-overlay" onClick={() => setShowAddLocationModal(false)}>
          <div
            className="dialog"
            style={{ maxWidth: "28rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#102a43", margin: 0 }}>
                Add Campus Location
              </h3>
              <button
                onClick={() => setShowAddLocationModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateLocation}>
              <div className="dialog-body">
                <div style={{ marginBottom: "1rem" }}>
                  <label className="label">Location Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Room 302 — Chemistry Lab"
                    value={newLocName}
                    onChange={(e) => setNewLocName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label className="label">Location Hierarchy Type</label>
                  <select
                    className="input select"
                    value={newLocType}
                    onChange={(e: any) => setNewLocType(e.target.value)}
                  >
                    <option value="building">Building</option>
                    <option value="floor">Floor</option>
                    <option value="room">Room / Classroom / Lab</option>
                    <option value="area">Open Area / Ground</option>
                  </select>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label className="label">Parent Location (Optional)</label>
                  <select
                    className="input select"
                    value={newLocParentId}
                    onChange={(e) => setNewLocParentId(e.target.value)}
                  >
                    <option value="">-- No Parent (Top Level) --</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Description (Optional)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. West wing, second floor"
                    value={newLocDesc}
                    onChange={(e) => setNewLocDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="dialog-footer">
                <button
                  type="button"
                  onClick={() => setShowAddLocationModal(false)}
                  className="btn btn-secondary btn-sm"
                  disabled={submittingLoc}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingLoc}>
                  {submittingLoc ? "Saving..." : "Save Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ASSET MODAL */}
      {showAddAssetModal && (
        <div className="dialog-overlay" onClick={() => setShowAddAssetModal(false)}>
          <div
            className="dialog"
            style={{ maxWidth: "28rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#102a43", margin: 0 }}>
                Register Campus Asset
              </h3>
              <button
                onClick={() => setShowAddAssetModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateAsset}>
              <div className="dialog-body">
                <div style={{ marginBottom: "1rem" }}>
                  <label className="label">Asset Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Ceiling Fan #4, Epson Projector"
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label className="label">Equipment Type</label>
                  <select
                    className="input select"
                    value={newAssetType}
                    onChange={(e: any) => setNewAssetType(e.target.value)}
                  >
                    <option value="fan">Fan</option>
                    <option value="light">Light</option>
                    <option value="ac">Air Conditioner</option>
                    <option value="projector">Projector</option>
                    <option value="computer">Computer Workstation</option>
                    <option value="desk">Desk / Table</option>
                    <option value="tap">Water Tap / Pipe</option>
                    <option value="door">Door / Window</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label className="label">Installed Room / Location</label>
                  <select
                    className="input select"
                    value={newAssetLocationId}
                    onChange={(e) => setNewAssetLocationId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Room / Location --</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Identifier Tag / Code</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. FAN-302-04"
                    value={newAssetIdentifier}
                    onChange={(e) => setNewAssetIdentifier(e.target.value)}
                  />
                </div>
              </div>

              <div className="dialog-footer">
                <button
                  type="button"
                  onClick={() => setShowAddAssetModal(false)}
                  className="btn btn-secondary btn-sm"
                  disabled={submittingAsset}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingAsset}>
                  {submittingAsset ? "Saving..." : "Register Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
