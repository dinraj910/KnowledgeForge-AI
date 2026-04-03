import { Link } from "react-router-dom";
import { Navigation } from "../components/Navigation";

export function Home() {
  return (
    <div className="page-container">
      <Navigation />
      
      <main style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "4rem 2rem",
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem", maxWidth: "800px", lineHeight: 1.2 }}>
          Your Enterprise Intelligence, <br/> Organized.
        </h1>
        <p style={{ fontSize: "1.125rem", maxWidth: "600px", marginBottom: "2.5rem" }}>
          Nexus AI transforms your scattered documents into an intelligent, instantly queryable knowledge base. 
          Experience a deeply polished workspace designed for maximum clarity and focus.
        </p>
        
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link to="/register">
            <button className="primary" style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}>
              Start for free
            </button>
          </Link>
          <Link to="/login">
            <button style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}>
              Log in
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
