// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/context/AuthContext";
import LandingPage from "./components/common/LandingPage";
import AuthPage from "./pages/AuthPage";
import LoadingSpinner from "./components/common/LoadingSpinner";
import Navigation from "./components/common/Navigation";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import HustlePage from './pages/HustlesPage';
import HustleDetailPage from './pages/HustleDetailPage';
import TransactionForm from './components/hustles/TransactionForm';
import HustleForm from './components/hustles/HustleForm';
import Debt from './pages/Debt';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (adminOnly && !user?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to={user?.is_admin ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return children;
};

const AppLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={user?.is_admin}
      />
      
      <div className="lg:pl-64">
        <div className="flex flex-col min-h-screen">
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-2">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-teal-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  const [loading, setLoading] = useState(true);
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      } />

      <Route path="/auth/:mode" element={
        <PublicRoute>
          <AuthPage />
        </PublicRoute>
      } />

      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin/dashboard" element={
        <ProtectedRoute adminOnly>
          <AppLayout>
            <AdminDashboard />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/hustles" element={
        <ProtectedRoute>
          <AppLayout>
            <HustlePage />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/hustles/new" element={
        <ProtectedRoute>
          <AppLayout>
            <HustleForm />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/hustles/:id/*" element={
        <ProtectedRoute>
          <AppLayout>
            <HustleDetailPage />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/hustles/:id/transactions/new" element={
        <ProtectedRoute>
          <AppLayout>
            <TransactionForm />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/debts" element={
        <ProtectedRoute>
          <AppLayout>
            <Debt />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;