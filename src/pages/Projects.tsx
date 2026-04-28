import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { projectsApi, milestonesApi, type Project, type Milestone } from "../utils/api";

interface ProjectWithMilestones extends Project {
  milestones: Milestone[];
}

export default function Projects() {
  const [projects, setProjects] = useState<ProjectWithMilestones[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWithMilestones | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Fetch projects + their milestones on mount ────────────────
  useEffect(() => {
    async function load() {
      try {
        const ps = await projectsApi.getAll();
        // Fetch milestones for every project in parallel
        const withMilestones = await Promise.all(
          ps.map(async (p) => {
            try {
              const milestones = await milestonesApi.getByProject(p.id);
              return { ...p, milestones };
            } catch {
              return { ...p, milestones: [] };
            }
          })
        );
        setProjects(withMilestones);
      } catch (err) {
        console.error("Failed to load projects:", err);
        setError("Unable to load projects. Is the backend running?");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Toggle milestone and persist to backend ───────────────────
  const toggleMilestone = async (projectId: number, milestone: Milestone) => {
    const newDone = !milestone.done;

    // Optimistic UI update
    const updateProject = (p: ProjectWithMilestones): ProjectWithMilestones => {
      if (p.id !== projectId) return p;
      const updatedMilestones = p.milestones.map((m) =>
        m.id === milestone.id ? { ...m, done: newDone } : m
      );
      const progress = Math.round(
        (updatedMilestones.filter((m) => m.done).length / updatedMilestones.length) * 100
      );
      return { ...p, milestones: updatedMilestones, progress };
    };

    setProjects((prev) => prev.map(updateProject));
    setSelectedProject((prev) => (prev && prev.id === projectId ? updateProject(prev) : prev));

    // Persist to backend
    try {
      await milestonesApi.toggle(milestone.id, newDone);
    } catch (err) {
      console.error("Failed to update milestone:", err);
    }
  };

  return (
    <div className="dashboard-shell">
      <Sidebar currentPage="projects" />
      <main className="dashboard-main">
        <section>
          <h1 style={{ margin: 0 }}>Projects</h1>
          <p style={{ margin: "6px 0 28px", color: "#64748b" }}>
            Manage and track your research projects
          </p>

          {/* ── States ─────────────────────────────────── */}
          {loading && (
            <div style={loadingStyle}>
              <div style={spinnerStyle} />
              Loading projects from database…
            </div>
          )}

          {error && <div style={errorBannerStyle}>⚠️ {error}</div>}

          {!loading && !error && projects.length === 0 && (
            <div style={emptyStyle}>No projects found. Create one to get started.</div>
          )}

          {/* ── Project grid ────────────────────────────── */}
          {!loading && projects.length > 0 && (
            <div style={gridStyle}>
              {projects.map((project) => (
                <div key={project.id} style={projectCardStyle}>
                  <div style={projectHeaderStyle}>
                    <h3 style={{ margin: 0, fontSize: 16 }}>{project.name}</h3>
                    <span style={statusBadgeStyle(project.status)}>{project.status}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#64748b", margin: "10px 0 14px", lineHeight: 1.5 }}>
                    {project.description?.slice(0, 80)}…
                  </p>
                  <div style={projectMetaStyle}>
                    <p>
                      <strong>{project.members}</strong> members
                    </p>
                    <p>
                      Progress: <strong>{project.progress}%</strong>
                    </p>
                  </div>
                  <div style={progressBarStyle}>
                    <div style={{ ...progressFillStyle, width: `${project.progress}%` }} />
                  </div>
                  <button style={actionButtonStyle} onClick={() => setSelectedProject(project)}>
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── Project detail modal ─────────────────────── */}
          {selectedProject && (
            <div style={overlayStyle} onClick={() => setSelectedProject(null)}>
              <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ margin: 0 }}>{selectedProject.name}</h2>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
                      <span style={statusBadgeStyle(selectedProject.status)}>
                        {selectedProject.status}
                      </span>
                      <span style={{ fontSize: 13, color: "#64748b" }}>Lead: {selectedProject.lead}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedProject(null)} style={closeBtnStyle}>
                    ✕
                  </button>
                </div>

                <p style={{ color: "#334155", lineHeight: 1.7, margin: "18px 0" }}>
                  {selectedProject.description}
                </p>

                <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
                  <div style={statBoxStyle}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#4338ca" }}>
                      {selectedProject.members}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Members</div>
                  </div>
                  <div style={statBoxStyle}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#4338ca" }}>
                      {selectedProject.progress}%
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Progress</div>
                  </div>
                  <div style={statBoxStyle}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#4338ca" }}>
                      {selectedProject.milestones.filter((m) => m.done).length}/
                      {selectedProject.milestones.length}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Milestones</div>
                  </div>
                </div>

                <div style={progressBarStyle}>
                  <div
                    style={{ ...progressFillStyle, width: `${selectedProject.progress}%` }}
                  />
                </div>

                <h3 style={{ margin: "22px 0 12px", fontSize: 15 }}>📋 Milestones</h3>

                {selectedProject.milestones.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: 13 }}>No milestones for this project.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {selectedProject.milestones.map((m) => (
                      <label key={m.id} style={milestoneStyle(m.done)}>
                        <input
                          type="checkbox"
                          checked={m.done}
                          onChange={() => toggleMilestone(selectedProject.id, m)}
                          style={{ marginRight: 10, accentColor: "#4338ca", width: 18, height: 18 }}
                        />
                        <span
                          style={{
                            textDecoration: m.done ? "line-through" : "none",
                            color: m.done ? "#94a3b8" : "#0f172a",
                          }}
                        >
                          {m.name}
                        </span>
                        {m.done && (
                          <span style={{ marginLeft: "auto", fontSize: 12, color: "#16a34a" }}>
                            ✓ Complete
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */

const loadingStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "40px 24px",
  color: "#64748b",
  fontSize: 15,
};

const spinnerStyle: React.CSSProperties = {
  width: 22,
  height: 22,
  border: "3px solid #e2e8f0",
  borderTop: "3px solid #4338ca",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};

const errorBannerStyle: React.CSSProperties = {
  padding: "14px 20px",
  borderRadius: 14,
  background: "#fee2e2",
  color: "#991b1b",
  border: "1px solid #fecaca",
  fontWeight: 600,
  fontSize: 14,
  marginBottom: 20,
};

const emptyStyle: React.CSSProperties = {
  padding: 40,
  textAlign: "center",
  color: "#94a3b8",
  fontSize: 15,
  background: "#fff",
  borderRadius: 18,
  border: "1px solid #e2e8f0",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: 20,
};

const projectCardStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: 22,
  borderRadius: 18,
  boxShadow: "0 8px 30px rgba(15,23,42,0.06)",
  border: "1px solid #e2e8f0",
};

const projectHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 4,
};

const statusBadgeStyle = (status: string): React.CSSProperties => ({
  padding: "4px 12px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  backgroundColor:
    status === "Active" ? "#d1fae5" : status === "Completed" ? "#dbeafe" : "#fef3c7",
  color:
    status === "Active" ? "#065f46" : status === "Completed" ? "#1e40af" : "#92400e",
});

const projectMetaStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 14,
  fontSize: 14,
  color: "#64748b",
};

const progressBarStyle: React.CSSProperties = {
  height: 8,
  backgroundColor: "#e2e8f0",
  borderRadius: 4,
  marginBottom: 16,
  overflow: "hidden",
};

const progressFillStyle: React.CSSProperties = {
  height: "100%",
  background: "linear-gradient(90deg, #4338ca, #818cf8)",
  borderRadius: 4,
  transition: "width 0.4s ease",
};

const actionButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  background: "linear-gradient(135deg, #4338ca, #6366f1)",
  color: "white",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
  transition: "opacity 0.2s",
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.5)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 20,
};

const modalStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 24,
  padding: 32,
  maxWidth: 560,
  width: "100%",
  maxHeight: "85vh",
  overflowY: "auto",
  boxShadow: "0 24px 60px rgba(15,23,42,0.2)",
};

const closeBtnStyle: React.CSSProperties = {
  background: "#f1f5f9",
  border: "none",
  borderRadius: "50%",
  width: 36,
  height: 36,
  fontSize: 16,
  cursor: "pointer",
  color: "#475569",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const statBoxStyle: React.CSSProperties = {
  flex: 1,
  textAlign: "center",
  padding: 14,
  borderRadius: 14,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const milestoneStyle = (done: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  padding: "12px 14px",
  borderRadius: 12,
  background: done ? "#f0fdf4" : "#f8fafc",
  border: `1px solid ${done ? "#bbf7d0" : "#e2e8f0"}`,
  cursor: "pointer",
  fontSize: 14,
});
