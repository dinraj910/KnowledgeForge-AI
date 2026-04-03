import { Link } from "react-router-dom";
import { NexusBrand } from "./NexusBrand";

export function Navigation() {
  return (
    <nav className="navbar navbar-expand-lg px-4 py-3" style={{ borderBottom: "1px solid var(--nexus-border)", backgroundColor: "var(--nexus-bg-sidebar)" }}>
      <div className="container-fluid">
        <Link to="/" className="navbar-brand text-decoration-none">
          <NexusBrand />
        </Link>
        <div className="d-flex align-items-center gap-3 ms-auto">
          <Link to="/login" className="text-decoration-none" style={{ color: "var(--nexus-text-primary)", fontWeight: 500 }}>
            Sign in
          </Link>
          <Link to="/register">
            <button className="btn btn-primary px-4 py-2 rounded-3 fw-medium">
              Start Free
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
