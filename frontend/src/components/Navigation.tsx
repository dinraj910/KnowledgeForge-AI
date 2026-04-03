import { Link } from "react-router-dom";

export function Navigation() {
  return (
    <nav style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between",
      padding: "1rem 2rem",
      backgroundColor: "var(--bg-app)",
      borderBottom: "1px solid var(--border-subtle)"
    }}>
      <div>
        <Link to="/" style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
          Nexus AI
        </Link>
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link to="/login" style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)" }}>
          Sign in
        </Link>
        <Link to="/register">
          <button className="primary" style={{ padding: "0.4rem 1rem", fontSize: "0.875rem" }}>
            Get Started
          </button>
        </Link>
      </div>
    </nav>
  );
}
