import { useState, useEffect, useRef, type ChangeEvent } from "react";
import Sidebar from "../components/Sidebar";

const API_BASE = "/api";

interface DocItem {
  id: number;
  name: string;
  type: string;
  size: string;
  date: string;
  project: string;
  content: string;
}

function downloadFile(doc: DocItem) {
  const isDataUrl = doc.content && doc.content.startsWith("data:");
  
  let url: string;
  if (isDataUrl) {
    url = doc.content;
  } else {
    // Fallback for legacy text-only content
    const blob = new Blob([doc.content || ""], { type: "text/plain" });
    url = URL.createObjectURL(blob);
  }

  const a = document.createElement("a");
  a.href = url;
  a.download = doc.name; // Use the original filename
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  if (!isDataUrl) {
    URL.revokeObjectURL(url);
  }
}

export default function Documents() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [downloadedId, setDownloadedId] = useState<number | null>(null);
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch documents from backend on mount
  useEffect(() => {
    fetch(`${API_BASE}/documents`)
      .then(res => res.json())
      .then((data: DocItem[]) => {
        setDocuments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch documents:", err);
        setLoading(false);
      });
  }, []);

  const handleDownload = (doc: DocItem) => {
    downloadFile(doc);
    setDownloadedId(doc.id);
    setTimeout(() => setDownloadedId(null), 2000);
  };

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const typeMap: Record<string, string> = {
      pdf: "PDF", doc: "Word", docx: "DOCX", xls: "Excel", xlsx: "XLSX", csv: "CSV", txt: "Text",
    };

    const reader = new FileReader();
    reader.onload = () => {
      const newDoc = {
        name: file.name,
        type: typeMap[ext] || "Other",
        size: file.size < 1048576 ? (file.size / 1024).toFixed(0) + " KB" : (file.size / 1048576).toFixed(1) + " MB",
        date: new Date().toISOString().split("T")[0],
        project: "General",
        content: reader.result as string,
      };

      // Save to backend (MySQL)
      fetch(`${API_BASE}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoc),
      })
        .then(res => res.json())
        .then((saved: DocItem) => {
          setDocuments(prev => [saved, ...prev]);
        })
        .catch(err => {
          console.error("Failed to upload document:", err);
          // Still add locally as fallback
          setDocuments(prev => [{ ...newDoc, id: Date.now() }, ...prev]);
        });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    fetch(`${API_BASE}/documents/${id}`, {
      method: "DELETE",
    })
      .then(res => {
        if (res.ok) {
          setDocuments(prev => prev.filter(doc => doc.id !== id));
        } else {
          console.error("Failed to delete document");
        }
      })
      .catch(err => console.error("Error deleting document:", err));
  };

  const fileIcon = (type: string) => {
    const icons: Record<string, string> = { PDF: "📕", Word: "📘", Excel: "📗", CSV: "📄", Text: "📄" };
    return icons[type] || "📎";
  };

  return (
    <div className="dashboard-shell">
      <Sidebar currentPage="documents" />
      <main className="dashboard-main">
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
            <div>
              <h1 style={{ margin: 0 }}>Documents Library</h1>
              <p style={{ margin: "6px 0 0", color: "#64748b" }}>Central hub for all research documents and files</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input ref={fileInputRef} type="file" onChange={handleUpload} style={{ display: "none" }} />
              <button onClick={() => fileInputRef.current?.click()} style={uploadBtnStyle}>
                📤 Upload Document
              </button>
            </div>
          </div>

          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={headerStyle}>
                  <th style={thStyle}>Document Name</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Size</th>
                  <th style={thStyle}>Project</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} style={rowStyle}>
                    <td style={cellStyle}>
                      <span style={{ marginRight: 8 }}>{fileIcon(doc.type)}</span>
                      {doc.name}
                    </td>
                    <td style={cellStyle}>
                      <span style={typeBadgeStyle(doc.type)}>{doc.type}</span>
                    </td>
                    <td style={cellStyle}>{doc.size}</td>
                    <td style={cellStyle}>{doc.project}</td>
                    <td style={cellStyle}>{doc.date}</td>
                    <td style={cellStyle}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleDownload(doc)}
                          style={downloadedId === doc.id ? downloadedBtnStyle : dlBtnStyle}
                        >
                          {downloadedId === doc.id ? "✅" : "⬇"} Download
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          style={deleteBtnStyle}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

const uploadBtnStyle: React.CSSProperties = {
  padding: "10px 22px",
  borderRadius: 12,
  background: "linear-gradient(135deg, #4338ca, #6366f1)",
  color: "#fff",
  border: "none",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

const tableContainerStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: 18,
  boxShadow: "0 8px 30px rgba(15,23,42,0.06)",
  overflow: "hidden",
  border: "1px solid #e2e8f0",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const headerStyle: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderBottom: "2px solid #e2e8f0",
};

const thStyle: React.CSSProperties = {
  padding: "16px 18px",
  textAlign: "left",
  fontSize: 13,
  fontWeight: 700,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const rowStyle: React.CSSProperties = {
  borderBottom: "1px solid #f1f5f9",
  transition: "background 0.15s",
};

const cellStyle: React.CSSProperties = {
  padding: "16px 18px",
  fontSize: 14,
  color: "#334155",
};

const typeBadgeStyle = (type: string): React.CSSProperties => {
  const colors: Record<string, { bg: string; text: string }> = {
    PDF: { bg: "#fef2f2", text: "#dc2626" },
    Word: { bg: "#eff6ff", text: "#2563eb" },
    Excel: { bg: "#f0fdf4", text: "#16a34a" },
    CSV: { bg: "#fefce8", text: "#ca8a04" },
  };
  const c = colors[type] || { bg: "#f1f5f9", text: "#475569" };
  return {
    padding: "4px 12px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    backgroundColor: c.bg,
    color: c.text,
  };
};

const dlBtnStyle: React.CSSProperties = {
  padding: "7px 16px",
  borderRadius: 8,
  background: "linear-gradient(135deg, #4338ca, #6366f1)",
  color: "#fff",
  border: "none",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  transition: "opacity 0.2s",
};

const downloadedBtnStyle: React.CSSProperties = {
  ...dlBtnStyle,
  background: "#16a34a",
  cursor: "default",
};

const deleteBtnStyle: React.CSSProperties = {
  padding: "7px 16px",
  borderRadius: 8,
  background: "#fee2e2",
  color: "#991b1b",
  border: "1px solid #fecaca",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  transition: "background 0.2s",
};
