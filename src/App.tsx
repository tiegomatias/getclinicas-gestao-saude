
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

// Pages
import HomePage from '@/pages/HomePage';
import Login from '@/pages/Login';
import Registration from '@/pages/Registration';
import Checkout from '@/pages/Checkout';
import Dashboard from '@/pages/Dashboard';
import MasterDashboard from '@/pages/MasterDashboard';
import MasterClinics from '@/pages/MasterClinics';
import MasterReports from '@/pages/MasterReports';
import MasterSettings from '@/pages/MasterSettings';
import Patients from '@/pages/Patients';
import Professionals from '@/pages/Professionals';
import Beds from '@/pages/Beds';
import Calendar from '@/pages/Calendar';
import Documents from '@/pages/Documents';
import Contracts from '@/pages/Contracts';
import Financeiro from '@/pages/Financeiro';
import Relatorios from '@/pages/Relatorios';
import Medications from '@/pages/Medications';
import Configuracoes from '@/pages/Configuracoes';
import NotFound from '@/pages/NotFound';

// Layouts
import AppLayout from '@/components/layout/AppLayout';
import MasterLayout from '@/components/layout/MasterLayout';

// Auth
import AuthGuard from '@/components/auth/AuthGuard';
import { AuthProvider } from '@/contexts/AuthContext';

// CSS
import './App.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registration />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* Protected routes for master admins */}
          <Route path="/master" element={
            <AuthGuard>
              <MasterLayout children={<MasterDashboard />} />
            </AuthGuard>
          } />
          <Route path="/master/clinics" element={
            <AuthGuard>
              <MasterLayout children={<MasterClinics />} />
            </AuthGuard>
          } />
          <Route path="/master/reports" element={
            <AuthGuard>
              <MasterLayout children={<MasterReports />} />
            </AuthGuard>
          } />
          <Route path="/master/settings" element={
            <AuthGuard>
              <MasterLayout children={<MasterSettings />} />
            </AuthGuard>
          } />

          {/* Protected routes for clinic admins and users */}
          <Route path="/dashboard" element={
            <AuthGuard>
              <AppLayout children={<Dashboard />} />
            </AuthGuard>
          } />
          <Route path="/pacientes" element={
            <AuthGuard>
              <AppLayout children={<Patients />} />
            </AuthGuard>
          } />
          <Route path="/profissionais" element={
            <AuthGuard>
              <AppLayout children={<Professionals />} />
            </AuthGuard>
          } />
          <Route path="/leitos" element={
            <AuthGuard>
              <AppLayout children={<Beds />} />
            </AuthGuard>
          } />
          <Route path="/agenda" element={
            <AuthGuard>
              <AppLayout children={<Calendar />} />
            </AuthGuard>
          } />
          <Route path="/documentos" element={
            <AuthGuard>
              <AppLayout children={<Documents />} />
            </AuthGuard>
          } />
          <Route path="/contratos" element={
            <AuthGuard>
              <AppLayout children={<Contracts />} />
            </AuthGuard>
          } />
          <Route path="/financeiro" element={
            <AuthGuard>
              <AppLayout children={<Financeiro />} />
            </AuthGuard>
          } />
          <Route path="/relatorios" element={
            <AuthGuard>
              <AppLayout children={<Relatorios />} />
            </AuthGuard>
          } />
          <Route path="/medicacoes" element={
            <AuthGuard>
              <AppLayout children={<Medications />} />
            </AuthGuard>
          } />
          <Route path="/configuracoes" element={
            <AuthGuard>
              <AppLayout children={<Configuracoes />} />
            </AuthGuard>
          } />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
};

export default App;
