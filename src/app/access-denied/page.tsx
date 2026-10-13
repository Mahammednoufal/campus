import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#f8fafc",
      }}
    >
      <div
        className="card animate-fade-in"
        style={{
          maxWidth: "28rem",
          textAlign: "center",
          padding: "3rem 2rem",
        }}
      >
        <div
          style={{
            width: "4rem",
            height: "4rem",
            background: "#fee2e2",
            borderRadius: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}
        >
          <ShieldAlert size={28} color="#dc2626" />
        </div>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#1e293b",
            marginBottom: "0.75rem",
          }}
        >
          Access Denied
        </h1>
        <p
          style={{
            color: "#627d98",
            fontSize: "0.9375rem",
            lineHeight: 1.6,
            marginBottom: "2rem",
          }}
        >
          Your Google account is not authorized to access the staff dashboards.
          Only designated principal and complaint management accounts have
          access.
        </p>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/" className="btn btn-secondary">
            <Home size={16} />
            Home
          </Link>
          <Link href="/login" className="btn btn-primary">
            <ArrowLeft size={16} />
            Try Another Account
          </Link>
        </div>
      </div>
    </div>
  );
}
