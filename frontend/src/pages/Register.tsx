import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NexusBrand } from "../components/NexusBrand";

export function Register() {
  const [name, setName] = useState("");
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

        <h3 className="fw-bold mb-2 text-center text-light">Create an account</h3>
        <p className="text-center mb-4" style={{ color: "var(--nexus-text-muted)" }}>
          Deploy KnowledgeForge AI for your personal base.
        </p>
        
        <form onSubmit={handleSubmit}>
          
          <div className="mb-3">
            <label className="form-label" style={{ color: "var(--nexus-text-muted)", fontSize: "0.85rem", fontWeight: 500 }}>Full Name</label>
            <input 
              type="text" 
              className="form-control py-2" 
              style={{ backgroundColor: "var(--nexus-input-bg)", borderColor: "var(--nexus-border)", color: "var(--nexus-text-primary)" }}
              placeholder="Jane Doe" 
              value={name}
              onChange={e => setName(e.target.value)}
              required 
            />
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ color: "var(--nexus-text-muted)", fontSize: "0.85rem", fontWeight: 500 }}>Work Email</label>
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
            <label className="form-label" style={{ color: "var(--nexus-text-muted)", fontSize: "0.85rem", fontWeight: 500 }}>Password</label>
            <input 
              type="password" 
              className="form-control py-2" 
              style={{ backgroundColor: "var(--nexus-input-bg)", borderColor: "var(--nexus-border)", color: "var(--nexus-text-primary)" }}
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary w-100 py-2 rounded-3 fw-medium mb-3">
            Create account
          </button>
          
        </form>
        
        <div className="text-center mt-2">
          <span style={{ color: "var(--nexus-text-muted)", fontSize: "0.9rem" }}>
            Already have an account? <Link to="/login" className="text-decoration-none fw-medium" style={{ color: "var(--nexus-blue)" }}>Sign in</Link>
          </span>
        </div>
        
      </div>
    </div>
  );
}
