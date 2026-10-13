"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  QrCode,
  Shield,
  ShieldAlert,
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  ArrowRight,
  Copy,
  Check,
  AlertTriangle,
  Upload,
  Info,
  X,
  Sparkles,
} from "lucide-react";
import { Location, Asset, ComplaintCategory, CATEGORY_LABELS } from "@/lib/types";
import { evaluateCriticalSafety } from "@/lib/utils";
import { QrScannerModal } from "@/components/qr-scanner-modal";
import QRCode from "qrcode";

function ReportComplaintForm() {
  const searchParams = useSearchParams();
  const initialLocationParam = searchParams.get("location");

  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");

  const [category, setCategory] = useState<ComplaintCategory>("electrical");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    ticketId: string;
    trackingToken: string;
    trackingSecret: string;
    isCritical: boolean;
    resolutionTarget: string;
    trackingUrl: string;
    qrCodeDataUrl: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load live locations from server
  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await fetch("/api/data");
        if (res.ok) {
          const data = await res.json();
          setLocations(data.locations || []);

          if (initialLocationParam) {
            const found = (data.locations || []).find(
              (l: Location) =>
                l.public_id === initialLocationParam || l.id === initialLocationParam
            );
            if (found) setSelectedLocation(found);
          } else if (data.locations && data.locations.length > 0) {
            const firstRoom =
              data.locations.find((l: Location) => l.type === "room") ||
              data.locations[0];
            setSelectedLocation(firstRoom);
          }
        }
      } catch (err) {
        console.error("Error loading locations:", err);
      }
    }
    loadInitial();
  }, [initialLocationParam]);

  // Update assets when location changes
  useEffect(() => {
    if (selectedLocation) {
      fetch("/api/data")
        .then((r) => r.json())
        .then((data) => {
          const matched = (data.assets || []).filter(
            (a: Asset) => a.location_id === selectedLocation.id
          );
          setAvailableAssets(matched);
          setSelectedAssetId("");
        })
        .catch(() => {});
    } else {
      setAvailableAssets([]);
      setSelectedAssetId("");
    }
  }, [selectedLocation]);

  const isCriticalSafetyDetected = evaluateCriticalSafety(
    category,
    title,
    description
  );

  const handleScanSuccess = (locationPublicId: string) => {
    const found = locations.find(
      (l) => l.public_id === locationPublicId || l.id === locationPublicId
    );
    if (found) {
      setSelectedLocation(found);
    } else {
      alert(`Location code "${locationPublicId}" not found in registered campus database.`);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) {
      alert("Please select or scan a campus location.");
      return;
    }
    if (!title.trim() || !description.trim()) {
      alert("Please provide both an issue headline and description.");
      return;
    }

    setSubmitting(true);

    try {
      // Send real submission to server API (persists in db.json)
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title: title.trim(),
          description: description.trim(),
          location_id: selectedLocation.id,
          asset_id: selectedAssetId || null,
          reporter_name: reporterName.trim() || null,
          reporter_contact: reporterContact.trim() || null,
          photo_url: photoPreview,
        }),
      });

      if (!res.ok) {
        throw new Error("Server failed to save complaint");
      }

      const result = await res.json();
      const trackingUrl = `${window.location.origin}/track/${result.complaint.tracking_token}`;
      const qrData = await QRCode.toDataURL(trackingUrl, {
        width: 256,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      });

      setSubmittedData({
        ticketId: result.complaint.ticket_id,
        trackingToken: result.complaint.tracking_token,
        trackingSecret: result.tracking_secret,
        isCritical: result.complaint.is_critical_safety,
        resolutionTarget: result.complaint.is_critical_safety
          ? "4 Hours (Critical Safety Priority)"
          : "24 Hours (Standard Campus Target)",
        trackingUrl,
        qrCodeDataUrl: qrData,
      });
    } catch (err: any) {
      console.error(err);
      alert("Failed to submit complaint. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyTrackingLink = () => {
    if (!submittedData) return;
    navigator.clipboard.writeText(submittedData.trackingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // SUCCESS CONFIRMATION SCREEN
  if (submittedData) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%), url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2000&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "2.5rem 1rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className="glass-card animate-fade-in"
          style={{
            maxWidth: "34rem",
            width: "100%",
            padding: "2.5rem 2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "4.5rem",
              height: "4.5rem",
              borderRadius: "50%",
              background: submittedData.isCritical ? "#fee2e2" : "#ecfdf5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              border: `2px solid ${submittedData.isCritical ? "#f87171" : "#a7f3d0"}`,
            }}
          >
            {submittedData.isCritical ? (
              <ShieldAlert size={36} color="#dc2626" />
            ) : (
              <CheckCircle2 size={36} color="#059669" />
            )}
          </div>

          <span
            className={
              submittedData.isCritical
                ? "badge badge-error"
                : "badge badge-success"
            }
            style={{ marginBottom: "0.5rem" }}
          >
            {submittedData.isCritical
              ? "Emergency Hazard Logged"
              : "Ticket Submitted Successfully"}
          </span>

          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.02em",
              marginBottom: "0.25rem",
            }}
          >
            {submittedData.ticketId}
          </h1>

          <p
            style={{
              fontSize: "0.875rem",
              color: "#475569",
              marginBottom: "1.5rem",
            }}
          >
            Resolution target:{" "}
            <strong style={{ color: "#0f172a" }}>
              {submittedData.resolutionTarget}
            </strong>
          </p>

          {/* QR Code */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "1rem",
              padding: "1.25rem",
              marginBottom: "1.5rem",
              display: "inline-block",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            {submittedData.qrCodeDataUrl && (
              <img
                src={submittedData.qrCodeDataUrl}
                alt="Tracking QR Code"
                style={{
                  width: "180px",
                  height: "180px",
                  margin: "0 auto 0.5rem",
                  display: "block",
                  borderRadius: "0.5rem",
                }}
              />
            )}
            <p style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
              Save or scan to monitor technician repair progress live
            </p>
          </div>

          {/* Tracking link copy */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#f1f5f9",
              padding: "0.625rem 0.875rem",
              borderRadius: "0.5rem",
              marginBottom: "1.5rem",
              border: "1px solid #e2e8f0",
            }}
          >
            <input
              type="text"
              readOnly
              value={submittedData.trackingUrl}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "0.8125rem",
                color: "#1e293b",
                width: "100%",
                outline: "none",
                fontFamily: "monospace",
              }}
            />
            <button
              onClick={copyTrackingLink}
              className="btn btn-secondary btn-sm"
              style={{ flexShrink: 0 }}
            >
              {copiedLink ? <Check size={14} color="#059669" /> : <Copy size={14} />}
              {copiedLink ? "Copied" : "Copy"}
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href={`/track/${submittedData.trackingToken}`}
              className="btn btn-primary"
              style={{ flex: "1 1 auto", padding: "0.75rem 1.5rem" }}
            >
              Track Complaint Now <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => {
                setSubmittedData(null);
                setTitle("");
                setDescription("");
                setPhotoPreview(null);
              }}
              className="btn btn-secondary"
            >
              Report Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.92) 0%, rgba(248, 250, 252, 0.98) 100%), url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2000&q=80')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        paddingBottom: "4rem",
      }}
    >
      {/* Top Header */}
      <header
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e2e8f0",
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "2.25rem",
              height: "2.25rem",
              background: "#0f172a",
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={18} color="white" />
          </div>
          <div>
            <span
              style={{
                fontSize: "1rem",
                fontWeight: 800,
                color: "#0f172a",
                display: "block",
                lineHeight: 1.1,
              }}
            >
              Smart Campus Care
            </span>
            <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500 }}>
              Student Reporting Portal • Anonymous & Instant
            </span>
          </div>
        </Link>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="btn btn-secondary btn-sm"
          style={{ gap: "0.375rem" }}
        >
          <Camera size={14} />
          Scan QR Code
        </button>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "44rem", margin: "2rem auto", padding: "0 1.25rem" }}>
        {/* Real-time Banner */}
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "0.75rem",
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            gap: "0.75rem",
            alignItems: "flex-start",
          }}
        >
          <Info size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: "0.1rem" }} />
          <div style={{ fontSize: "0.8125rem", color: "#1e40af", lineHeight: 1.5 }}>
            <strong>Real Campus Dispatch:</strong> Submitting here registers a live ticket
            instantly visible in the <strong>Principal Oversight</strong> and{" "}
            <strong>Complaint Operations</strong> panels with a <strong>24-hour target</strong>.
          </div>
        </div>

        {/* Glass Card Form */}
        <div className="card" style={{ padding: "2rem" }}>
          <form onSubmit={handleSubmit}>
            {/* 1. Location Selection */}
            <div style={{ marginBottom: "1.75rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <label className="label" style={{ marginBottom: 0 }}>
                  1. Campus Location
                </label>
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <QrCode size={13} />
                  Scan QR Code on Wall
                </button>
              </div>

              {selectedLocation ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.875rem 1rem",
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    borderRadius: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <MapPin size={20} color="#059669" />
                    <div>
                      <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#065f46" }}>
                        {selectedLocation.name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#047857" }}>
                        Code: {selectedLocation.public_id}
                        {selectedLocation.description && ` • ${selectedLocation.description}`}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedLocation(null)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#065f46",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textDecoration: "underline",
                    }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <select
                  className="input select"
                  value=""
                  onChange={(e) => {
                    const found = locations.find((l) => l.id === e.target.value);
                    setSelectedLocation(found || null);
                  }}
                  required
                >
                  <option value="">-- Choose or Scan Campus Location --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.type})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 2. Registered Asset */}
            {availableAssets.length > 0 && (
              <div style={{ marginBottom: "1.75rem" }}>
                <label className="label">
                  2. Affected Item / Asset (Optional)
                </label>
                <select
                  className="input select"
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                >
                  <option value="">-- General area (No specific item) --</option>
                  {availableAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} {asset.identifier ? `[${asset.identifier}]` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 3. Category Selector */}
            <div style={{ marginBottom: "1.75rem" }}>
              <label className="label">3. Issue Category</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                  gap: "0.5rem",
                }}
              >
                {(
                  [
                    "electrical",
                    "plumbing",
                    "furniture",
                    "cleaning",
                    "it_equipment",
                    "infrastructure",
                    "other",
                  ] as ComplaintCategory[]
                ).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    style={{
                      padding: "0.625rem 0.75rem",
                      border:
                        category === cat
                          ? "2px solid #0f172a"
                          : "1px solid #cbd5e1",
                      borderRadius: "0.5rem",
                      background: category === cat ? "#0f172a" : "#ffffff",
                      color: category === cat ? "#ffffff" : "#334155",
                      fontWeight: category === cat ? 700 : 500,
                      fontSize: "0.8125rem",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow:
                        category === cat
                          ? "0 4px 12px rgba(15, 23, 42, 0.12)"
                          : "none",
                    }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* Critical Safety Hazard Alert */}
            {isCriticalSafetyDetected && (
              <div
                className="animate-fade-in"
                style={{
                  background: "#fef2f2",
                  border: "1.5px solid #f87171",
                  borderRadius: "0.5rem",
                  padding: "1rem",
                  marginBottom: "1.5rem",
                  display: "flex",
                  gap: "0.625rem",
                  alignItems: "flex-start",
                }}
              >
                <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: "0.1rem" }} />
                <div style={{ fontSize: "0.8125rem", color: "#991b1b" }}>
                  <strong>Safety Hazard Detected:</strong> This report involves potential electrical
                  or flooding hazards. It will be flagged <strong>Critical</strong> with immediate
                  30-minute campus alert response. Stay away from the affected area!
                </div>
              </div>
            )}

            {/* 4. Headline */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label className="label">4. Short Headline / Problem Summary</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Ceiling fan vibrating violently, tap overflowing..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* 5. Description */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label className="label">5. Detailed Description</label>
              <textarea
                className="input textarea"
                placeholder="Describe what is broken, what noise it makes, exact location in room..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
              />
            </div>

            {/* 6. Photo Evidence */}
            <div style={{ marginBottom: "1.75rem" }}>
              <label className="label">6. Photo Evidence (Optional)</label>
              {photoPreview ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    maxHeight: "220px",
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  <img
                    src={photoPreview}
                    alt="Upload preview"
                    style={{ width: "100%", maxHeight: "220px", objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "0.5rem",
                      background: "rgba(0,0,0,0.6)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "1.75rem",
                      height: "1.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "1.5rem",
                    border: "2px dashed #cbd5e1",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    background: "#ffffff",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Upload size={20} color="#64748b" />
                  <span style={{ fontSize: "0.8125rem", color: "#334155", fontWeight: 600 }}>
                    Click or tap to snap a photo / upload file
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    PNG, JPG, WebP up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>

            {/* 7. Optional Reporter Info */}
            <div
              style={{
                marginBottom: "2rem",
                padding: "1rem 1.25rem",
                background: "#f8fafc",
                borderRadius: "0.5rem",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem" }}>
                Reporter Information (Optional)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Your Name (Optional)"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                />
                <input
                  type="text"
                  className="input"
                  placeholder="Phone or Student Email (Optional)"
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value)}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center" }}
            >
              {submitting ? (
                <>
                  <span className="spinner" /> Saving & Disagreeing...
                </>
              ) : (
                <>
                  Submit Complaint <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        sampleLocations={locations.map((l) => ({
          name: l.name,
          public_id: l.public_id,
          type: l.type,
        }))}
      />
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div style={{ padding: "4rem", textAlign: "center" }}><div className="spinner" /></div>}>
      <ReportComplaintForm />
    </Suspense>
  );
}
