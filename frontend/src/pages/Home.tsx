import { Link } from "react-router-dom";
import { Navigation } from "../components/Navigation";

export function Home() {
  return (
    <div className="vh-100 d-flex flex-column nexus-main">
      <Navigation />
      
      <main className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center px-4" style={{ backgroundColor: "var(--nexus-bg-main)" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          
          <div className="mb-4 d-inline-flex align-items-center rounded-pill border px-3 py-1" style={{ borderColor: "var(--nexus-border)", backgroundColor: "var(--nexus-bg-sidebar)" }}>
            <span className="badge bg-primary rounded-pill me-2">New</span>
            <span className="small text-muted" style={{ fontWeight: 500 }}>Enterprise RAG Engine v2.0 is live</span>
          </div>

          <h1 className="fw-bold mb-4" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.03em" }}>
            The Intel Layer for Your Entire Enterprise.
          </h1>
          
          <p className="lead mb-5 mx-auto" style={{ color: "var(--nexus-text-muted)", maxWidth: "600px" }}>
            Nexus AI transforms scattered PDFs, documents, and messy knowledge bases into an instantly queryable, highly secure artificial analyst.
          </p>
          
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/register">
              <button className="btn btn-primary btn-lg rounded-3 px-5 py-3 fw-medium">
                Get Started
              </button>
            </Link>
            <Link to="/login">
              <button className="btn btn-outline-light btn-lg rounded-3 px-5 py-3 fw-medium border" style={{ borderColor: "var(--nexus-border)", backgroundColor: "var(--nexus-bg-sidebar)" }}>
                Sign In
              </button>
            </Link>
          </div>
          
        </div>
      </main>
    </div>
  );
}
