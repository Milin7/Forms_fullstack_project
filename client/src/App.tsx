import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import { Register } from "./components/Register";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TemplateProvider } from "./context/TemplateContext";
import Navigation from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { TemplateList } from "./components/TemplateList";
import { TemplateCreate } from "./components/TemplateCreate";
import { TemplateEdit } from "./components/TemplateEdit";
import { TemplateView } from "./components/TemplateView";

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TemplateProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <>
                    <Navigation />
                    <Dashboard />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates"
              element={
                <ProtectedRoute>
                  <>
                    <Navigation />
                    <TemplateList />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates/new"
              element={
                <ProtectedRoute>
                  <>
                    <Navigation />
                    <TemplateCreate />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates/:id"
              element={
                <ProtectedRoute>
                  <>
                    <Navigation />
                    <TemplateView />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates/:id/edit"
              element={
                <ProtectedRoute>
                  <>
                    <Navigation />
                    <TemplateEdit />
                  </>
                </ProtectedRoute>
              }
            />
          </Routes>
        </TemplateProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
