import { useState, useEffect, useRef, type ChangeEvent } from "react";
import Sidebar from "../components/Sidebar";

interface Attachment {
  name: string;
  size: string;
  type: string;
  url: string;
}

interface Message {
  id: number;
  from: string;      // maps to backend field "sender"
  project: string;
  message: string;
  time: string;
  type: "message" | "request";
  status?: "pending" | "approved" | "declined";
  attachments?: Attachment[];
}

const API_BASE = "/api";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function getTimeLabel(): string {
  return "Just now";
}

/** Convert backend message object (uses "sender") to frontend shape (uses "from") */
function fromBackend(raw: Record<string, unknown>): Message {
  return {
    id: raw.id as number,
    from: (raw.sender as string) || "Unknown",
    project: (raw.project as string) || "",
    message: (raw.message as string) || "",
    time: (raw.time as string) || "",
    type: ((raw.type as string) || "message") as "message" | "request",
    status: raw.status as "pending" | "approved" | "declined" | undefined,
  };
}

export default function Communications() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectNames, setProjectNames] = useState<string[]>(["All Projects"]);
  const [selectedProject, setSelectedProject] = useState("All Projects");
  const [messageText, setMessageText] = useState("");
  const [sendType, setSendType] = useState<"message" | "request">("message");
  const [sendProject, setSendProject] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [successBanner, setSuccessBanner] = useState("");

  // ── Load messages + project list from backend ─────────────────
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/messages`).then((r) => r.json()),
      fetch(`${API_BASE}/projects`).then((r) => r.json()),
    ])
      .then(([msgs, projects]: [Record<string, unknown>[], Record<string, unknown>[]]) => {
        setMessages(msgs.map(fromBackend).reverse());
        const names = projects.map((p) => p.name as string);
        setProjectNames(["All Projects", ...names]);
        if (names.length > 0) setProjectNames((prev) => { setSendProject(names[0]); return prev; });
        if (names.length > 0) setSendProject(names[0]);
      })
      .catch((err) => console.error("Failed to fetch communications data:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    selectedProject === "All Projects"
      ? messages
      : messages.filter((m) => m.project === selectedProject);

  const sendableProjects = projectNames.filter((p) => p !== "All Projects");

  const handleAttachFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) setPendingFiles((prev) => [...prev, ...Array.from(files)]);
    e.target.value = "";
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Send message → POST /api/messages ────────────────────────
  const handleSend = async () => {
    if (!messageText.trim() && pendingFiles.length === 0) return;

    const currentUser = (() => {
      try {
        const u = sessionStorage.getItem("currentUser");
        return u ? JSON.parse(u).name : "You";
      } catch {
        return "You";
      }
    })();

    const attachments: Attachment[] = pendingFiles.map((f) => ({
      name: f.name,
      size: formatFileSize(f.size),
      type: f.type || "application/octet-stream",
      url: URL.createObjectURL(f),
    }));

    const payload = {
      sender: currentUser,
      project: sendProject,
      message: messageText.trim(),
      time: getTimeLabel(),
      type: sendType,
      status: sendType === "request" ? "pending" : null,
    };

    // Optimistic add
    const optimistic: Message = {
      id: Date.now(),
      from: currentUser,
      project: sendProject,
      message: messageText.trim(),
      time: getTimeLabel(),
      type: sendType,
      status: sendType === "request" ? "pending" : undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    };
    setMessages((prev) => [optimistic, ...prev]);
    setMessageText("");
    setPendingFiles([]);
    setSuccessBanner(
      sendType === "request"
        ? `Request sent to ${sendProject}`
        : `Message sent to ${sendProject}`
    );
    setTimeout(() => setSuccessBanner(""), 3000);

    // Persist to backend
    try {
      await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Failed to save message:", err);
    }
  };

  // ── Approve / Decline → PUT /api/messages/{id} ───────────────
  const handleRequestAction = async (id: number, action: "approved" | "declined") => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: action } : m))
    );
    try {
      await fetch(`${API_BASE}/messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
    } catch (err) {
      console.error("Failed to update message status:", err);
    }
  };

  const handleDownload = (att: Attachment) => {
    const link = document.createElement("a");
    link.href = att.url;
    link.download = att.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fileIcon = (type: string) => {
    if (type.includes("pdf")) return "📕";
    if (type.includes("doc") || type.includes("word")) return "📘";
    if (type.includes("xls") || type.includes("sheet")) return "📗";
    if (type.includes("ppt") || type.includes("presentation")) return "📙";
    if (type.includes("csv") || type.includes("text")) return "📄";
    if (type.includes("image")) return "🖼️";
    return "📎";
  };

  const statusBadge = (status?: string) => {
    if (!status) return null;
    const colors: Record<string, { bg: string; text: string }> = {
      pending: { bg: "#fef3c7", text: "#92400e" },
      approved: { bg: "#d1fae5", text: "#065f46" },
      declined: { bg: "#fee2e2", text: "#991b1b" },
    };
    const c = colors[status] || colors.pending;
    return (
      <span
        style={{
          padding: "4px 14px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: 600,
          backgroundColor: c.bg,
          color: c.text,
          textTransform: "capitalize",
        }}
      >
        {status}
      </span>
    );
  };

  const projectBadge = (project: string) => {
    const colors: Record<string, string> = {
      "NeuroAI Collaboration": "#818cf8",
      "Quantum Materials": "#38bdf8",
      "Bioinformatics Study": "#34d399",
    };
    return (
      <span
        style={{
          padding: "3px 12px",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: 600,
          backgroundColor: (colors[project] || "#94a3b8") + "22",
          color: colors[project] || "#94a3b8",
          border: `1px solid ${(colors[project] || "#94a3b8")}44`,
        }}
      >
        {project}
      </span>
    );
  };

  return (
    <div className="dashboard-shell">
      <Sidebar currentPage="communications" />
      <main className="dashboard-main">
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
            <div>
              <h1 style={{ margin: 0 }}>Communications</h1>
              <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                Team messages, file sharing &amp; project requests
              </p>
            </div>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={filterSelectStyle}
            >
              {projectNames.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {successBanner && (
            <div style={successBannerStyle}>✅ {successBanner}</div>
          )}

          {/* ── Compose ─────────────────────────────────────── */}
          <div style={composeCardStyle}>
            <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>New Message / Request</h3>

            <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
              <div style={toggleGroupStyle}>
                <button
                  style={sendType === "message" ? toggleActiveStyle : toggleStyle}
                  onClick={() => setSendType("message")}
                >
                  💬 Message
                </button>
                <button
                  style={
                    sendType === "request"
                      ? { ...toggleActiveStyle, background: "#fef3c7", color: "#92400e" }
                      : toggleStyle
                  }
                  onClick={() => setSendType("request")}
                >
                  📋 Request
                </button>
              </div>

              <select
                value={sendProject}
                onChange={(e) => setSendProject(e.target.value)}
                style={projectSelectStyle}
              >
                {sendableProjects.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={
                sendType === "request"
                  ? "Describe your request (e.g., access to dataset, add collaborator)…"
                  : "Type your message…"
              }
              rows={3}
              style={textareaStyle}
            />

            {pendingFiles.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                {pendingFiles.map((f, i) => (
                  <div key={i} style={pendingFileChipStyle}>
                    <span>{fileIcon(f.type)} {f.name}</span>
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>{formatFileSize(f.size)}</span>
                    <button onClick={() => removePendingFile(i)} style={removeChipBtn}>✕</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "flex-end" }}>
              <input ref={fileInputRef} type="file" multiple onChange={handleAttachFiles} style={{ display: "none" }} />
              <button onClick={() => fileInputRef.current?.click()} style={attachButtonStyle}>
                📎 Attach Files
              </button>
              <button onClick={handleSend} style={sendButtonStyle}>
                {sendType === "request" ? "📋 Send Request" : "🚀 Send Message"}
              </button>
            </div>
          </div>

          {/* ── Feed ────────────────────────────────────────── */}
          {loading && (
            <div style={loadingStyle}>
              <div style={spinnerStyle} /> Loading messages…
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {!loading && filtered.length === 0 && (
              <div style={emptyStyle}>No messages for this project yet.</div>
            )}

            {filtered.map((msg) => (
              <div
                key={msg.id}
                style={{
                  ...messageCardStyle,
                  borderLeft: msg.type === "request" ? "4px solid #f59e0b" : "4px solid #818cf8",
                }}
              >
                <div style={msgHeaderStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={avatarStyle}>{msg.from.charAt(0)}</div>
                    <div>
                      <strong style={{ color: "#0f172a", fontSize: 14 }}>{msg.from}</strong>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                        {projectBadge(msg.project)}
                        {msg.type === "request" && statusBadge(msg.status)}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>{msg.time}</span>
                </div>

                <p style={{ margin: "14px 0 0", color: "#334155", fontSize: 14, lineHeight: 1.6 }}>
                  {msg.type === "request" && (
                    <span style={{ fontWeight: 600, color: "#d97706" }}>📋 Request: </span>
                  )}
                  {msg.message}
                </p>

                {msg.attachments && msg.attachments.length > 0 && (
                  <div style={attachmentsSectionStyle}>
                    <p style={{ margin: "0 0 10px", fontSize: 13, color: "#64748b", fontWeight: 600 }}>
                      📂 Attachments ({msg.attachments.length})
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {msg.attachments.map((att, i) => (
                        <div key={i} style={attachmentCardStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 22 }}>{fileIcon(att.type)}</span>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{att.name}</div>
                              <div style={{ fontSize: 11, color: "#94a3b8" }}>{att.size}</div>
                            </div>
                          </div>
                          <button onClick={() => handleDownload(att)} style={downloadBtnStyle}>
                            ⬇ Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {msg.type === "request" && msg.status === "pending" && (
                  <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    <button onClick={() => handleRequestAction(msg.id, "approved")} style={approveBtnStyle}>
                      ✓ Approve
                    </button>
                    <button onClick={() => handleRequestAction(msg.id, "declined")} style={declineBtnStyle}>
                      ✕ Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */
const loadingStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: "40px 24px", color: "#64748b", fontSize: 15 };
const spinnerStyle: React.CSSProperties = { width: 22, height: 22, border: "3px solid #e2e8f0", borderTop: "3px solid #4338ca", borderRadius: "50%", animation: "spin 0.8s linear infinite" };
const filterSelectStyle: React.CSSProperties = { padding: "10px 16px", borderRadius: 14, border: "1px solid #e2e8f0", background: "#fff", fontSize: 14, fontWeight: 600, color: "#334155", cursor: "pointer", minWidth: 180 };
const successBannerStyle: React.CSSProperties = { padding: "12px 20px", borderRadius: 14, background: "#d1fae5", color: "#065f46", fontWeight: 600, fontSize: 14, marginBottom: 20, border: "1px solid #a7f3d0" };
const composeCardStyle: React.CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 24, marginBottom: 28, boxShadow: "0 8px 30px rgba(15,23,42,0.05)" };
const toggleGroupStyle: React.CSSProperties = { display: "flex", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" };
const toggleStyle: React.CSSProperties = { padding: "8px 18px", fontSize: 13, fontWeight: 600, background: "#f8fafc", color: "#64748b", border: "none", cursor: "pointer", transition: "all 0.2s" };
const toggleActiveStyle: React.CSSProperties = { ...toggleStyle, background: "#eef2ff", color: "#4338ca" };
const projectSelectStyle: React.CSSProperties = { padding: "8px 14px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 13, fontWeight: 600, color: "#334155", cursor: "pointer" };
const textareaStyle: React.CSSProperties = { width: "100%", padding: "14px 16px", borderRadius: 14, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 14, fontFamily: "inherit", resize: "vertical", color: "#0f172a", lineHeight: 1.6 };
const pendingFileChipStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 10, background: "#f1f5f9", border: "1px solid #e2e8f0", fontSize: 13 };
const removeChipBtn: React.CSSProperties = { background: "none", border: "none", color: "#ef4444", fontWeight: 700, cursor: "pointer", fontSize: 14, padding: "0 2px" };
const attachButtonStyle: React.CSSProperties = { padding: "10px 20px", borderRadius: 12, background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s" };
const sendButtonStyle: React.CSSProperties = { padding: "10px 24px", borderRadius: 12, background: "linear-gradient(135deg, #4338ca, #6366f1)", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s" };
const messageCardStyle: React.CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: 22, boxShadow: "0 4px 20px rgba(15,23,42,0.04)", transition: "box-shadow 0.2s" };
const msgHeaderStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 };
const avatarStyle: React.CSSProperties = { width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #818cf8, #38bdf8)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 };
const attachmentsSectionStyle: React.CSSProperties = { marginTop: 16, padding: 16, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" };
const attachmentCardStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 14px", borderRadius: 12, background: "#fff", border: "1px solid #e2e8f0", minWidth: 240, flex: "1 1 240px", maxWidth: 360 };
const downloadBtnStyle: React.CSSProperties = { padding: "6px 14px", borderRadius: 8, background: "linear-gradient(135deg, #4338ca, #6366f1)", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "opacity 0.2s" };
const approveBtnStyle: React.CSSProperties = { padding: "8px 20px", borderRadius: 10, background: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0", fontWeight: 600, fontSize: 13, cursor: "pointer" };
const declineBtnStyle: React.CSSProperties = { padding: "8px 20px", borderRadius: 10, background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", fontWeight: 600, fontSize: 13, cursor: "pointer" };
const emptyStyle: React.CSSProperties = { padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 15, background: "#fff", borderRadius: 18, border: "1px solid #e2e8f0" };
