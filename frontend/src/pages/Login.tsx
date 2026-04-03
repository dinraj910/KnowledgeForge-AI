import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function Login() {
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
        <h2 style={{ textAlign: "center", marginBottom: "0.5rem" }}>Welcome back</h2>
        <p style={{ textAlign: "center", marginBottom: "2rem", fontSize: "0.875rem" }}>
          Please enter your details to sign in.
        </p>
        
        <form onSubmit={handleSubmit}>
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
            Sign in
          </button>
        </form>
        
        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem" }}>
          Don't have an account? <Link to="/register" style={{ color: "var(--accent)" }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
