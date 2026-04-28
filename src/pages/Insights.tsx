import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

interface StatItem {
  label: string;
  value: string;
  change: string;
}

interface Project {
  status: string;
  progress?: number;
}

export default function Insights() {
  const [stats, setStats] = useState<StatItem[]>([
    { label: "Total Projects", value: "—", change: "Loading…" },
    { label: "Active Collaborators", value: "—", change: "Loading…" },
    { label: "Documents Shared", value: "—", change: "Loading…" },
    { label: "Completion Rate", value: "—", change: "Loading…" },
  ]);
  const [projectsByStatus, setProjectsByStatus] = useState<Record<string, number>>({});
  const [avgProgress, setAvgProgress] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/documents").then((r) => r.json()),
    ])
      .then(([projects, users, docs]: [Project[], unknown[], unknown[]]) => {
        const total = projects.length;
        const activeCount = projects.filter((p) => p.status === "Active").length;
        const completedCount = projects.filter((p) => p.status === "Completed").length;
        const planningCount = projects.filter((p) => p.status === "Planning").length;
        const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        const avgProg = total > 0
          ? Math.round(projects.reduce((sum, p) => sum + (p.progress ?? 0), 0) / total)
          : 0;

        setStats([
          { label: "Total Projects", value: String(total), change: `${activeCount} active` },
          { label: "Active Collaborators", value: String(users.length), change: "in the system" },
          { label: "Documents Shared", value: String(docs.length), change: "in the library" },
          { label: "Completion Rate", value: `${completionRate}%`, change: `${completedCount} completed` },
        ]);

        setProjectsByStatus({ Active: activeCount, Completed: completedCount, Planning: planningCount });
        setAvgProgress(avgProg);
      })
      .catch((err) => {
        console.error("Failed to load insights:", err);
        setStats([
          { label: "Total Projects", value: "N/A", change: "Backend unavailable" },
          { label: "Active Collaborators", value: "N/A", change: "" },
          { label: "Documents Shared", value: "N/A", change: "" },
          { label: "Completion Rate", value: "N/A", change: "" },
        ]);
      });
  }, []);

  const statusColors: Record<string, string> = {
    Active: "#4338ca",
    Completed: "#16a34a",
    Planning: "#f59e0b",
  };

  const totalProjects = Object.values(projectsByStatus).reduce((a, b) => a + b, 0);

  return (
    <div className="dashboard-shell">
      <Sidebar currentPage="insights" />
      <main className="dashboard-main">
        <section>
          <h1>Insights &amp; Analytics</h1>
          <p style={{ marginBottom: "30px", color: "#64748b" }}>
            Track collaboration metrics and research progress
          </p>

          {/* ── Stat cards ─────────────────────────────── */}
          <div style={statsGridStyle}>
            {stats.map((stat, index) => (
              <div key={index} style={statCardStyle}>
                <h3 style={statLabelStyle}>{stat.label}</h3>
                <p style={statValueStyle}>{stat.value}</p>
                <p style={statChangeStyle}>{stat.change}</p>
              </div>
            ))}
          </div>

          {/* ── Charts ─────────────────────────────────── */}
          <div style={chartContainerStyle}>
            {/* Project status distribution */}
            <div style={chartStyle}>
              <h3 style={{ margin: "0 0 20px", fontSize: 15, color: "#0f172a" }}>
                Project Distribution by Status
              </h3>
              {totalProjects === 0 ? (
                <div style={placeholderStyle}><p>No projects yet</p></div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {Object.entries(projectsByStatus).map(([status, count]) => {
                    const pct = totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0;
                    return (
                      <div key={status}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                          <span style={{ fontWeight: 600, color: "#334155" }}>{status}</span>
                          <span style={{ color: "#64748b" }}>{count} project{count !== 1 ? "s" : ""} ({pct}%)</span>
                        </div>
                        <div style={{ height: 10, background: "#e2e8f0", borderRadius: 5, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: statusColors[status] || "#94a3b8", borderRadius: 5, transition: "width 0.6s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Average progress */}
            <div style={chartStyle}>
              <h3 style={{ margin: "0 0 20px", fontSize: 15, color: "#0f172a" }}>
                Average Project Progress
              </h3>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 160 }}>
                <div style={{ fontSize: 56, fontWeight: 800, color: "#4338ca", lineHeight: 1 }}>
                  {avgProgress}%
                </div>
                <p style={{ color: "#64748b", marginTop: 10, fontSize: 13 }}>across all projects</p>
                <div style={{ width: "100%", height: 10, background: "#e2e8f0", borderRadius: 5, overflow: "hidden", marginTop: 20 }}>
                  <div style={{ height: "100%", width: `${avgProgress}%`, background: "linear-gradient(90deg, #4338ca, #818cf8)", borderRadius: 5, transition: "width 0.6s ease" }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
  marginBottom: "30px",
};

const statCardStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "14px",
  boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
  textAlign: "center" as const,
  border: "1px solid #e2e8f0",
};

const statLabelStyle = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0 0 10px 0",
  fontWeight: "600" as const,
};

const statValueStyle = {
  fontSize: "36px",
  color: "#4338ca",
  margin: "0 0 6px 0",
  fontWeight: "800" as const,
};

const statChangeStyle = {
  fontSize: "12px",
  color: "#16a34a",
  margin: "0",
  fontWeight: "600" as const,
};

const chartContainerStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px",
};

const chartStyle = {
  backgroundColor: "white",
  padding: "24px",
  borderRadius: "14px",
  boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
  border: "1px solid #e2e8f0",
};

const placeholderStyle = {
  backgroundColor: "#f8f9fa",
  padding: "60px 20px",
  textAlign: "center" as const,
  color: "#999",
  borderRadius: "8px",
  marginTop: "20px",
};
