import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { usersApi, type User } from "../utils/api";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  status: string;
  projects: number;
}

function userToMember(u: User): TeamMember {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role === "admin" ? "Admin" : "Researcher",
    status: "Active",
    projects: 0,
  };
}

export default function Team() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [banner, setBanner] = useState("");
  const [bannerType, setBannerType] = useState<"success" | "error">("success");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // ── Fetch users from backend ──────────────────────────────────
  useEffect(() => {
    usersApi
      .getAll()
      .then((users) => setTeam(users.map(userToMember)))
      .catch((err) => {
        console.error("Failed to load team:", err);
        setError("Unable to load team members. Is the backend running?");
      })
      .finally(() => setLoading(false));
  }, []);

  const showBanner = (msg: string, type: "success" | "error" = "success") => {
    setBanner(msg);
    setBannerType(type);
    setTimeout(() => setBanner(""), 3000);
  };

  // ── Invite → create user via POST /api/auth/signup ────────────
  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      showBanner("Please enter an email address.", "error");
      return;
    }
    if (!inviteRole || inviteRole === "Select Role") {
      showBanner("Please select a role.", "error");
      return;
    }
    if (team.some((m) => m.email?.toLowerCase() === inviteEmail.trim().toLowerCase())) {
      showBanner("This email is already in the team.", "error");
      return;
    }

    const newName = inviteEmail
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    // POST to /api/auth/signup to create the user in the DB
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: inviteEmail.trim(),
          password: "password123",
          role: inviteRole.toLowerCase() === "admin" ? "admin" : "researcher",
        }),
      });
      const data = await res.json();
      if (data.success) {
        const newMember: TeamMember = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: inviteRole,
          status: "Pending",
          projects: 0,
        };
        setTeam((prev) => [...prev, newMember]);
        setInviteEmail("");
        setInviteRole("");
        showBanner(`Invitation sent to ${inviteEmail.trim()} as ${inviteRole}!`);
      } else {
        showBanner(data.error || "Could not create user.", "error");
      }
    } catch (err) {
      console.error("Invite failed:", err);
      showBanner("Invite failed. Check backend connection.", "error");
    }
  };

  // ── Remove member via DELETE /api/users/{id} ──────────────────
  const handleRemove = async (id: number) => {
    try {
      await usersApi.delete(id);
      setTeam((prev) => prev.filter((m) => m.id !== id));
      setSelectedMember(null);
      showBanner("Team member removed.");
    } catch (err) {
      console.error("Remove failed:", err);
      showBanner("Could not remove member. Check backend.", "error");
    }
  };

  const handleStatusToggle = (id: number) => {
    setTeam((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === "Active" ? "Pending" : "Active" } : m
      )
    );
    setSelectedMember((prev) =>
      prev && prev.id === id
        ? { ...prev, status: prev.status === "Active" ? "Pending" : "Active" }
        : prev
    );
  };

  return (
    <div className="dashboard-shell">
      <Sidebar currentPage="team" />
      <main className="dashboard-main">
        <section>
          <h1 style={{ margin: 0 }}>Team Members</h1>
          <p style={{ margin: "6px 0 24px", color: "#64748b" }}>
            Manage your research team and collaborators
          </p>

          {banner && (
            <div
              style={{
                ...bannerStyle,
                background: bannerType === "success" ? "#d1fae5" : "#fee2e2",
                color: bannerType === "success" ? "#065f46" : "#991b1b",
                border: `1px solid ${bannerType === "success" ? "#a7f3d0" : "#fecaca"}`,
              }}
            >
              {bannerType === "success" ? "✅" : "⚠️"} {banner}
            </div>
          )}

          {loading && (
            <div style={loadingStyle}>
              <div style={spinnerStyle} />
              Loading team members…
            </div>
          )}

          {error && <div style={errorBannerStyle}>⚠️ {error}</div>}

          {!loading && !error && (
            <div style={teamContainerStyle}>
              {team.map((member) => (
                <div
                  key={member.id}
                  style={memberCardStyle}
                  onClick={() => setSelectedMember(member)}
                >
                  <div style={memberAvatarStyle}>{member.name.charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 4px", fontSize: 15, color: "#0f172a" }}>
                      {member.name}
                    </h3>
                    <p style={{ margin: "0 0 4px", fontSize: 12, color: "#64748b" }}>{member.role}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                      {member.email}
                    </p>
                  </div>
                  <div style={memberStatusStyle(member.status)}>{member.status}</div>
                </div>
              ))}
            </div>
          )}

          {/* Invite section */}
          <div style={inviteCardStyle}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>📧 Invite New Member</h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>
              Send an invitation to collaborate on research projects
            </p>
            <div style={formGroupStyle}>
              <input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                style={inputStyle}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                style={selectStyle}
              >
                <option value="">Select Role</option>
                <option>Researcher</option>
                <option>Analyst</option>
                <option>Advisor</option>
                <option>Project Lead</option>
                <option>Admin</option>
              </select>
              <button style={inviteButtonStyle} onClick={handleInvite}>
                🚀 Send Invite
              </button>
            </div>
          </div>

          {/* Member detail modal */}
          {selectedMember && (
            <div style={overlayStyle} onClick={() => setSelectedMember(null)}>
              <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ ...memberAvatarStyle, width: 56, height: 56, fontSize: 22 }}>
                      {selectedMember.name.charAt(0)}
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 20 }}>{selectedMember.name}</h2>
                      <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
                        {selectedMember.role}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedMember(null)} style={closeBtnStyle}>
                    ✕
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "24px 0" }}>
                  <div style={infoBoxStyle}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>Email</span>
                    <strong>{selectedMember.email}</strong>
                  </div>
                  <div style={infoBoxStyle}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>Status</span>
                    <strong>{selectedMember.status}</strong>
                  </div>
                  <div style={infoBoxStyle}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>Role</span>
                    <strong>{selectedMember.role}</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => handleStatusToggle(selectedMember.id)} style={toggleBtnStyle}>
                    {selectedMember.status === "Active" ? "⏸ Set Pending" : "✓ Set Active"}
                  </button>
                  <button onClick={() => handleRemove(selectedMember.id)} style={removeBtnStyle}>
                    🗑 Remove Member
                  </button>
                </div>
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
  display: "flex", alignItems: "center", gap: 12, padding: "40px 24px",
  color: "#64748b", fontSize: 15,
};
const spinnerStyle: React.CSSProperties = {
  width: 22, height: 22, border: "3px solid #e2e8f0",
  borderTop: "3px solid #4338ca", borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};
const errorBannerStyle: React.CSSProperties = {
  padding: "14px 20px", borderRadius: 14, background: "#fee2e2",
  color: "#991b1b", border: "1px solid #fecaca", fontWeight: 600, fontSize: 14, marginBottom: 20,
};
const bannerStyle: React.CSSProperties = {
  padding: "12px 20px", borderRadius: 14, fontWeight: 600, fontSize: 14, marginBottom: 20,
};
const teamContainerStyle: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, marginBottom: 28,
};
const memberCardStyle: React.CSSProperties = {
  backgroundColor: "white", padding: 18, borderRadius: 16,
  boxShadow: "0 4px 20px rgba(15,23,42,0.05)",
  display: "flex", alignItems: "center", gap: 14,
  cursor: "pointer", border: "1px solid #e2e8f0",
  transition: "box-shadow 0.2s, transform 0.15s",
};
const memberAvatarStyle: React.CSSProperties = {
  width: 46, height: 46, borderRadius: "50%",
  background: "linear-gradient(135deg, #818cf8, #38bdf8)",
  color: "white", display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 18, fontWeight: 700, flexShrink: 0,
};
const memberStatusStyle = (status: string): React.CSSProperties => ({
  padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
  backgroundColor: status === "Active" ? "#d1fae5" : "#fef3c7",
  color: status === "Active" ? "#065f46" : "#92400e",
});
const inviteCardStyle: React.CSSProperties = {
  backgroundColor: "white", padding: 24, borderRadius: 18,
  boxShadow: "0 8px 30px rgba(15,23,42,0.06)", border: "1px solid #e2e8f0",
};
const formGroupStyle: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap" };
const inputStyle: React.CSSProperties = {
  flex: 1, minWidth: 200, padding: "12px 16px",
  border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 14, background: "#f8fafc",
};
const selectStyle: React.CSSProperties = {
  padding: "12px 16px", border: "1px solid #e2e8f0",
  borderRadius: 12, fontSize: 14, background: "#f8fafc", minWidth: 140,
};
const inviteButtonStyle: React.CSSProperties = {
  padding: "12px 24px", background: "linear-gradient(135deg, #4338ca, #6366f1)",
  color: "white", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 14,
};
const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
  backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
  justifyContent: "center", zIndex: 1000, padding: 20,
};
const modalStyle: React.CSSProperties = {
  background: "#fff", borderRadius: 24, padding: 32,
  maxWidth: 480, width: "100%", boxShadow: "0 24px 60px rgba(15,23,42,0.2)",
};
const closeBtnStyle: React.CSSProperties = {
  background: "#f1f5f9", border: "none", borderRadius: "50%",
  width: 36, height: 36, fontSize: 16, cursor: "pointer", color: "#475569",
};
const infoBoxStyle: React.CSSProperties = {
  padding: 14, borderRadius: 12, background: "#f8fafc",
  border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 4,
};
const toggleBtnStyle: React.CSSProperties = {
  flex: 1, padding: "10px 20px", borderRadius: 12, background: "#eef2ff",
  color: "#4338ca", border: "1px solid #c7d2fe", fontWeight: 600, fontSize: 13, cursor: "pointer",
};
const removeBtnStyle: React.CSSProperties = {
  flex: 1, padding: "10px 20px", borderRadius: 12, background: "#fee2e2",
  color: "#991b1b", border: "1px solid #fecaca", fontWeight: 600, fontSize: 13, cursor: "pointer",
};
