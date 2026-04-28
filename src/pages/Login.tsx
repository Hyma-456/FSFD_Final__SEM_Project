import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticate } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate inputs
    if (!email || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      // Authenticate user via Spring Boot API
      const user = await authenticate(email, password);
      
      if (user) {
        // Store current user in session
        sessionStorage.setItem("currentUser", JSON.stringify(user));
        
        // Navigate to appropriate dashboard
        if (user.role?.toLowerCase() === "admin") {
          navigate("/admin");
        } else {
          navigate("/researcher");
        }
      } else {
        setError("Invalid email or password");
        setLoading(false);
      }
    } catch {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h1 style={titleStyle}>ResearchCollab</h1>
        <p style={subtitleStyle}>Login to your account</p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleLogin} style={formStyle}>
          <div style={inputGroupStyle}>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            style={{...buttonStyle, opacity: loading ? 0.6 : 1}}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={signupLinkStyle}>
          Don't have an account? <a 
            href="#/signup" 
            style={linkStyle}
            onClick={() => navigate("/signup")}
          >
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
}

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  backgroundColor: "#f5f5f5",
} as const;

const formContainerStyle = {
  backgroundColor: "white",
  padding: "40px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  width: "100%",
  maxWidth: "400px",
} as const;

const titleStyle = {
  textAlign: "center" as const,
  color: "#333",
  marginBottom: "10px",
  fontSize: "28px",
};

const subtitleStyle = {
  textAlign: "center" as const,
  color: "#666",
  marginBottom: "30px",
  fontSize: "14px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "20px",
};

const inputGroupStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "8px",
};

const labelStyle = {
  color: "#333",
  fontSize: "14px",
  fontWeight: "600" as const,
};

const inputStyle = {
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "14px",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
} as const;

const buttonStyle = {
  padding: "12px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "4px",
  fontSize: "16px",
  fontWeight: "600" as const,
  cursor: "pointer",
  marginTop: "10px",
  transition: "background-color 0.2s",
} as const;

const errorStyle = {
  backgroundColor: "#f8d7da",
  color: "#721c24",
  padding: "12px",
  borderRadius: "4px",
  marginBottom: "20px",
  fontSize: "14px",
  border: "1px solid #f5c6cb",
} as const;

const signupLinkStyle = {
  textAlign: "center" as const,
  fontSize: "14px",
  color: "#666",
  marginTop: "20px",
};

const linkStyle = {
  color: "#007bff",
  textDecoration: "none",
  cursor: "pointer",
  fontWeight: "600" as const,
} as const;