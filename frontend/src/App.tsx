import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './features/auth';

// Lazy loading de módulos protegidos
const Dashboard = lazy(() => import('./features/dashboard').then(module => ({ default: module.Dashboard })));
const Patients = lazy(() => import('./features/patients').then(module => ({ default: module.Patients })));
const PatientDetails = lazy(() => import('./features/patients').then(module => ({ default: module.PatientDetails })));
const Layout = lazy(() => import('./components/Layout'));

const FallbackLoader = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
    <span className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin mb-4"></span>
    <p className="text-muted text-sm font-medium">Cargando plataforma...</p>
  </div>
);

// Rutas protegidas muy simples leyendo el token
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('auth_token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Suspense fallback={<FallbackLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:id" element={<PatientDetails />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
