import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

interface Metrics {
  projectsJoined: number;
  sharedDocs: number;
  collaborators: number;
}

export default function ResearcherDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics>({ projectsJoined: 0, sharedDocs: 0, collaborators: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/documents").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ])
      .then(([projects, docs, users]) => {
        setMetrics({
          projectsJoined: Array.isArray(projects) ? projects.length : 0,
          sharedDocs: Array.isArray(docs) ? docs.length : 0,
          collaborators: Array.isArray(users) ? users.length : 0,
        });
      })
      .catch((err) => console.error("Failed to load metrics:", err));
  }, []);

  const handleMarkDone = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const li = btn.closest("li");
    if (li) {
      li.style.opacity = "0.5";
      li.style.textDecoration = "line-through";
      btn.textContent = "✓ Done";
      btn.style.background = "#16a34a";
      btn.disabled = true;
    }
  };

  return (
    <div className="dashboard-shell">
      <Sidebar currentPage="researcher" />
      <main className="dashboard-main">
        <section className="hero-banner">
          <div className="hero-copy">
            <h1>Researcher workspace for faster discovery.</h1>
            <p>Organize experiments, join active collaborations, and keep your research pipeline moving.</p>
            <div className="hero-actions">
              <button className="hero-button" onClick={() => navigate("/projects")}>Browse Projects</button>
              <button className="secondary-button" onClick={() => navigate("/documents")}>Open Library</button>
            </div>
          </div>
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80" alt="Research team collaboration" />
          </div>
        </section>

        <section className="metric-grid">
          <article className="card metric-card">
            <h3>Projects joined</h3>
            <p className="metric-value">{metrics.projectsJoined}</p>
          </article>
          <article className="card metric-card">
            <h3>Shared docs</h3>
            <p className="metric-value">{metrics.sharedDocs}</p>
          </article>
          <article className="card metric-card">
            <h3>Team members</h3>
            <p className="metric-value">{metrics.collaborators}</p>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="card">
            <h2>Today's tasks</h2>
            <ul className="recent-list">
              <li className="recent-item">
                <div>
                  <strong>Review proposal draft</strong>
                  <small>Project: NeuroAI Collaboration</small>
                </div>
                <button onClick={handleMarkDone} style={taskBtnStyle}>Mark Done</button>
              </li>
              <li className="recent-item">
                <div>
                  <strong>Upload experiment data</strong>
                  <small>Project: Quantum Materials</small>
                </div>
                <button onClick={() => navigate("/documents")} style={taskBtnStyle}>Upload</button>
              </li>
              <li className="recent-item">
                <div>
                  <strong>Schedule team review</strong>
                  <small>Project: Bioinformatics Study</small>
                </div>
                <button onClick={() => navigate("/communications")} style={taskBtnStyle}>Message</button>
              </li>
            </ul>
          </article>

          <article className="card">
            <h2>Quick Actions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
              <button onClick={() => navigate("/projects")} style={quickActionStyle}>📁 View All Projects</button>
              <button onClick={() => navigate("/documents")} style={quickActionStyle}>📄 Browse Documents</button>
              <button onClick={() => navigate("/communications")} style={quickActionStyle}>💬 Send a Message</button>
              <button onClick={() => navigate("/team")} style={quickActionStyle}>👤 View Team Members</button>
              <button onClick={() => navigate("/insights")} style={quickActionStyle}>📊 View Insights</button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

const taskBtnStyle: React.CSSProperties = {
  padding: "6px 16px", borderRadius: 8,
  background: "linear-gradient(135deg, #4338ca, #6366f1)",
  color: "#fff", border: "none", fontSize: 12,
  fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.2s",
};

const quickActionStyle: React.CSSProperties = {
  padding: "12px 18px", borderRadius: 12, background: "#f8fafc",
  border: "1px solid #e2e8f0", color: "#334155", fontSize: 14,
  fontWeight: 600, cursor: "pointer", textAlign: "left", transition: "background 0.2s, border-color 0.2s",
};
