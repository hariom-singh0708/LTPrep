import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Subjects from "./pages/Subjects.jsx";
import SubjectPage from "./pages/SubjectPage.jsx";
import Checkout from "./pages/Checkout.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";


export default function App() {
  return (
    <>
      <Navbar />
      <div className="container py-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
                <Home />
            }
          />
          <Route
            path="/subjects"
            element={
              <ProtectedRoute>
                <Subjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subject/:id"
            element={
              <ProtectedRoute>
                <SubjectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/:id"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}
