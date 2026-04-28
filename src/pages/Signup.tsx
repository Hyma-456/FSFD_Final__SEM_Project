import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthRole, saveUser } from "../utils/auth";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AuthRole>("researcher");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please complete every field before continuing.");
      return;
    }

    setLoading(true);

    try {
      const result = await saveUser({ name: name.trim(), email: email.trim(), password, role });
      if (!result.success) {
        setError(result.error ?? "Unable to create the account.");
        setLoading(false);
        return;
      }

      setSuccess("Account created successfully. Redirecting to login...");
      setTimeout(() => navigate("/"), 1200);
    } catch {
      setError("Signup failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="auth-note">Start collaborating on research projects with your teammates.</p>

        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="auth-input"
              placeholder="Jane Doe"
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="auth-input"
              placeholder="jane@example.com"
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="auth-input"
              placeholder="Create a secure password"
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value as AuthRole)}
              className="auth-input"
              disabled={loading}
            >
              <option value="researcher">Researcher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="auth-actions">
            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Sign up"}
            </button>
            <Link className="auth-link" to="/">
              Already have an account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
