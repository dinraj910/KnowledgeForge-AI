import { Link } from "react-router-dom";
import { Navigation } from "../components/Navigation";

export function Home() {
  return (
    <div className="vh-100 d-flex flex-column nexus-main">
      <Navigation />
      
      <main className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center px-4" style={{ backgroundColor: "var(--nexus-bg-main)" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          
          <div className="mb-4 d-inline-flex align-items-center rounded-pill border px-3 py-1" style={{ borderColor: "var(--nexus-border)", backgroundColor: "var(--nexus-bg-sidebar)" }}>
            <span className="badge bg-primary rounded-pill me-2">RAG Engine</span>
            <span className="small text-muted" style={{ fontWeight: 500, color: "var(--nexus-text-muted) !important" }}>End-to-End Retrieval-Augmented Generation</span>
          </div>

          <h1 className="fw-bold mb-4" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.03em" }}>
            KnowledgeForge AI
          </h1>
          
          <p className="lead mb-4 mx-auto" style={{ color: "var(--nexus-text-muted) !important", maxWidth: "700px" }}>
            Turn your unstructured personal documents into a searchable semantic memory layer. Upload private PDFs, TXTs, and DOCX files securely, and instantly ask natural-language questions over your own knowledge base.
          </p>

          <p className="mb-5 mx-auto" style={{ color: "var(--nexus-text-muted) !important", maxWidth: "600px", fontSize: "0.95rem" }}>
            Powered by a FastAPI backend, semantic retrieval pipeline, and secure extraction module resulting in grounded, source-aware answers.
          </p>
          
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/register">
              <button className="btn btn-primary btn-lg rounded-3 px-5 py-3 fw-medium">
                Start Forging Knowledge
              </button>
            </Link>
            <Link to="/dashboard">
              <button className="btn btn-outline-light btn-lg rounded-3 px-5 py-3 fw-medium border" style={{ borderColor: "var(--nexus-border)", backgroundColor: "var(--nexus-bg-sidebar)", color: "#fff" }}>
                View Dashboard View
              </button>
            </Link>
          </div>
          
        </div>
      </main>
    </div>
  );
}
