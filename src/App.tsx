import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/1Home/2Home_page";
import LoginPage from "./pages/1Home/4Login";
import AdminDashboard from "./pages/Admin/1sidenav/2Admin_Dashboard";
import StaffDashboard from "./pages/Staff/1sidenav_staff/2Staff_Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute requiredRole="staff">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        {/* Catch-all: redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;