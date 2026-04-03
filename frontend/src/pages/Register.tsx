import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Simulate auth, then redirect
    if (email) {
      navigate("/dashboard");
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 style={{ textAlign: "center", marginBottom: "0.5rem" }}>Create an account</h2>
        <p style={{ textAlign: "center", marginBottom: "2rem", fontSize: "0.875rem" }}>
          Start building your personalized knowledge base.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input 
              id="name" 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Doe" 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email" 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password" 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" 
              required 
            />
          </div>
          
          <button type="submit" className="primary" style={{ width: "100%", marginTop: "1rem" }}>
            Sign up
          </button>
        </form>
        
        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--accent)" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
