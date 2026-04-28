import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import ResearcherDashboard from "./pages/ResearcherDashboard";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Documents from "./pages/Documents";
import Communications from "./pages/Communications";
import Insights from "./pages/Insights";
import Team from "./pages/Team";

// Simple auth guard — redirects to login if no session exists
function RequireAuth({ children }: { children: React.ReactElement }) {
  const user = sessionStorage.getItem("currentUser");
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard routes */}
        <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
        <Route path="/researcher" element={<RequireAuth><ResearcherDashboard /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />

        {/* Feature routes — these are what the sidebar links to */}
        <Route path="/projects" element={<RequireAuth><Projects /></RequireAuth>} />
        <Route path="/documents" element={<RequireAuth><Documents /></RequireAuth>} />
        <Route path="/communications" element={<RequireAuth><Communications /></RequireAuth>} />
        <Route path="/insights" element={<RequireAuth><Insights /></RequireAuth>} />
        <Route path="/team" element={<RequireAuth><Team /></RequireAuth>} />

        {/* Catch-all */}
        <Route path="*" element={<Login />} />
      </Routes>
    </HashRouter>
  );
}