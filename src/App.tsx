import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/1Home/2Home_page";
import LoginPage from "./pages/1Home/4Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { LoadingScreen } from "./components/common/LoadingScreen";

// Lazy-loaded pages
const AdminDashboard = React.lazy(() => import("./pages/Admin/1sidenav/2Admin_Dashboard"));
const StaffDashboard = React.lazy(() => import("./pages/Staff/1sidenav_staff/2Staff_Dashboard"));
const ServicesPage = React.lazy(() => import("./pages/1Home/services"));
const AboutPage = React.lazy(() => import("./pages/1Home/About"));
const ContactPage = React.lazy(() => import("./pages/1Home/Contact"));
const ShopCategoryPage = React.lazy(() => import("./pages/Shop/ShopCategoryPage"));

function App() {
  const theme = localStorage.getItem('adminTheme') === 'dark' ? 'dark' : 'light';

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen theme={theme} message="Entering portal..." />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/shop/category" element={<ShopCategoryPage />} />
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;