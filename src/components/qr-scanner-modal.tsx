"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (locationPublicId: string) => void;
  sampleLocations: Array<{ name: string; public_id: string; type: string }>;
}

export function QrScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  sampleLocations,
}: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (readerRef.current) {
        // Stop scanning
        readerRef.current = null;
      }
      return;
    }

    let isMounted = true;
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;
    setScanning(true);
    setError(null);

    async function startCamera() {
      try {
        if (!videoRef.current) return;
        const videoElement = videoRef.current;

        await reader.decodeFromVideoDevice(
          undefined, // Default camera
          videoElement,
          (result, err) => {
            if (!isMounted) return;
            if (result) {
              const text = result.getText();
              // Parse URL or raw ID
              // e.g. https://domain.com/report?location=seb-room-101
              let locationId = text;
              try {
                if (text.includes("location=")) {
                  const url = new URL(text);
                  const loc = url.searchParams.get("location");
                  if (loc) locationId = loc;
                }
              } catch {
                // Raw text is used
              }

              onScanSuccess(locationId);
              onClose();
            }
          }
        );
      } catch (err: any) {
        console.warn("Camera access failed:", err);
        if (isMounted) {
          setError(
            "Camera stream unavailable or permission denied. You can select one of the registered campus QR codes below for instant testing."
          );
          setScanning(false);
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (readerRef.current) {
        // Scanner cleanup
      }
    };
  }, [isOpen, onClose, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog" style={{ maxWidth: "26rem" }}>
        <div
          className="dialog-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Camera size={18} color="#102a43" />
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#102a43" }}>
              Scan Campus QR Code
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.25rem",
              color: "#64748b",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="dialog-body" style={{ padding: "1.25rem" }}>
          {/* Camera Viewport */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1/1",
              background: "#0f172a",
              borderRadius: "0.75rem",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <video
              ref={videoRef}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              playsInline
              muted
            />

            {/* Scanning Target Overlay */}
            <div
              style={{
                position: "absolute",
                width: "70%",
                height: "70%",
                border: "2px dashed rgba(255, 255, 255, 0.7)",
                borderRadius: "1rem",
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.45)",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  color: "white",
                  fontSize: "0.75rem",
                  background: "rgba(0,0,0,0.6)",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.25rem",
                }}
              >
                Align QR Code Here
              </div>
            </div>
          </div>

          {error && (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                padding: "0.75rem",
                background: "#fef3c7",
                border: "1px solid #fde68a",
                borderRadius: "0.5rem",
                color: "#92400e",
                fontSize: "0.8125rem",
                marginBottom: "1rem",
                lineHeight: 1.4,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "0.1rem" }} />
              <div>{error}</div>
            </div>
          )}

          {/* Quick Test QR selector */}
          <div style={{ marginTop: "1rem" }}>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <Sparkles size={12} color="#2563eb" />
              Quick-Simulate Physical QR Scan
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.375rem",
                maxHeight: "130px",
                overflowY: "auto",
              }}
            >
              {sampleLocations.map((loc) => (
                <button
                  key={loc.public_id}
                  onClick={() => {
                    onScanSuccess(loc.public_id);
                    onClose();
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{
                    justifyContent: "space-between",
                    textAlign: "left",
                    fontSize: "0.8125rem",
                    padding: "0.5rem 0.75rem",
                  }}
                >
                  <span style={{ fontWeight: 500, color: "#1e293b" }}>
                    {loc.name}
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "#64748b",
                      fontFamily: "monospace",
                    }}
                  >
                    {loc.public_id}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="dialog-footer" style={{ justifyContent: "center" }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
