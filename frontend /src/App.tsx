import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useAuthStore, useNotificationStore } from './store';
import { mockNotifications } from './services/mockData';
import { Navbar } from './components/layout/Navbar';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { SplashScreen } from './pages/SplashScreen';

// Lazy-loaded pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AIChat = lazy(() => import('./pages/AIChat'));
const AIAnalysis = lazy(() => import('./pages/AIAnalysis'));
const AIMemoryPage = lazy(() => import('./pages/AIMemory').then(m => ({ default: m.AIMemoryPage })));
const Repositories = lazy(() => import('./pages/Repositories'));
const RepoDetail = lazy(() => import('./pages/RepoDetail'));
const PullRequests = lazy(() => import('./pages/PullRequests'));
const Deployments = lazy(() => import('./pages/Deployments'));
const Logs = lazy(() => import('./pages/Logs'));
const Security = lazy(() => import('./pages/Security'));
const FileExplorer = lazy(() => import('./pages/FileExplorer'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));

// Page loading skeleton
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-full min-h-64">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 animate-pulse" />
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-violet-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  </div>
);

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// App layout with sidebar
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-[72px] lg:ml-[72px]" id="main-content">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 pb-20 md:pb-6">
            <Suspense fallback={<PageLoader />}>
              {children}
            </Suspense>
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

// Page transition wrapper
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Main app router
const AppRouter: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  return (
    <Routes location={location}>
      {/* Public routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> :
          <Suspense fallback={<PageLoader />}><Login /></Suspense>
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> :
          <Suspense fallback={<PageLoader />}><Register /></Suspense>
      } />
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Suspense fallback={<PageLoader />}><Onboarding /></Suspense>
        </ProtectedRoute>
      } />

      {/* Protected app routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout>
            <PageTransition><Dashboard /></PageTransition>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/repositories" element={
        <ProtectedRoute>
          <AppLayout>
            <PageTransition><Repositories /></PageTransition>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/repositories/:owner/:repo" element={
        <ProtectedRoute>
          <AppLayout>
            <PageTransition><RepoDetail /></PageTransition>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/pull-requests" element={
        <ProtectedRoute>
          <AppLayout>
            <PageTransition><PullRequests /></PageTransition>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/ai-chat" element={
        <ProtectedRoute>
          <AppLayout>
            <PageTransition><AIChat /></PageTransition>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/ai-analysis" element={
        <ProtectedRoute>
          <AppLayout>
            <PageTransition><AIAnalysis /></PageTransition>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/ai-memory" element={
        <ProtectedRoute>
          <AppLayout>
            <PageTransition><AIMemoryPage /></PageTransition>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/deployments" element={
        <ProtectedRoute>
          <AppLayout>
            <PageTransition><Deployments /></PageTransition>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/logs" element={
        <ProtectedRoute>
          <AppLayout>
            <PageTransition><Logs /></PageTransition>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/security" element={
        <ProtectedRoute>
          <AppLayout>
            <PageTransition><Security /></PageTransition>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/file-explorer" element={
        <ProtectedRoute>
          <AppLayout>
            <PageTransition><FileExplorer /></PageTransition>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <AppLayout>
            <PageTransition><Notifications /></PageTransition>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout>
            <PageTransition><Settings /></PageTransition>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout>
            <PageTransition><Profile /></PageTransition>
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Redirects */}
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      } />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
};

// Root App Component
const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { setNotifications } = useNotificationStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Initialize with mock notifications
    if (isAuthenticated) {
      setNotifications(mockNotifications);
    }
  }, [isAuthenticated]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <BrowserRouter>
      <div className="font-sans antialiased">
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#e2e8f0',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '12px',
              fontSize: '14px',
              backdropFilter: 'blur(12px)',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#0f172a' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0f172a' },
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;
