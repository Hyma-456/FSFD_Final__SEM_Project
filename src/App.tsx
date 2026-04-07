import { HashRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ResearcherDashboard from "./pages/ResearcherDashboard";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/researcher" element={<ResearcherDashboard />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </HashRouter>
  );
}