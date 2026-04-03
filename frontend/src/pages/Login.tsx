import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NexusBrand } from "../components/NexusBrand";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (email) {
      navigate("/dashboard");
    }
  }

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center nexus-main px-3">
      
      <div className="card shadow-lg border-0 p-4 p-md-5" style={{ backgroundColor: "var(--nexus-bg-sidebar)", maxWidth: "450px", width: "100%", border: "1px solid var(--nexus-border)" }}>
        
        <div className="text-center mb-4 d-flex justify-content-center">
          <Link to="/" className="text-decoration-none"><NexusBrand /></Link>
        </div>

        <h3 className="fw-bold mb-2 text-center text-light">Welcome back</h3>
        <p className="text-center mb-4" style={{ color: "var(--nexus-text-muted)" }}>
          Sign in to your KnowledgeForge AI account.
        </p>
        
        <form onSubmit={handleSubmit}>
          
          <div className="mb-3">
            <label className="form-label" style={{ color: "var(--nexus-text-muted)", fontSize: "0.85rem", fontWeight: 500 }}>Email Address</label>
            <input 
              type="email" 
              className="form-control py-2" 
              style={{ backgroundColor: "var(--nexus-input-bg)", borderColor: "var(--nexus-border)", color: "var(--nexus-text-primary)" }}
              placeholder="you@company.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <label className="form-label mb-0" style={{ color: "var(--nexus-text-muted)", fontSize: "0.85rem", fontWeight: 500 }}>Password</label>
              <a href="#" className="text-decoration-none small" style={{ color: "var(--nexus-blue)" }}>Forgot?</a>
            </div>
            <input 
              type="password" 
              className="form-control py-2 mt-2" 
              style={{ backgroundColor: "var(--nexus-input-bg)", borderColor: "var(--nexus-border)", color: "var(--nexus-text-primary)" }}
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary w-100 py-2 rounded-3 fw-medium mb-3">
            Sign in
          </button>
          
        </form>
        
        <div className="text-center mt-2">
          <span style={{ color: "var(--nexus-text-muted)", fontSize: "0.9rem" }}>
            Don't have an account? <Link to="/register" className="text-decoration-none fw-medium" style={{ color: "var(--nexus-blue)" }}>Sign up</Link>
          </span>
        </div>
        
      </div>
    </div>
  );
}
