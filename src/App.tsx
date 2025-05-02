
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
import Index from '@/pages/Index';

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
          {/* Root path - Index router */}
          <Route path="/" element={<Index />} />
          
          {/* Public routes */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registration />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* Protected routes for master admins */}
          <Route path="/master" element={
            <AuthGuard>
              <MasterLayout>
                <MasterDashboard />
              </MasterLayout>
            </AuthGuard>
          } />
          <Route path="/master/clinics" element={
            <AuthGuard>
              <MasterLayout>
                <MasterClinics />
              </MasterLayout>
            </AuthGuard>
          } />
          <Route path="/master/reports" element={
            <AuthGuard>
              <MasterLayout>
                <MasterReports />
              </MasterLayout>
            </AuthGuard>
          } />
          <Route path="/master/settings" element={
            <AuthGuard>
              <MasterLayout>
                <MasterSettings />
              </MasterLayout>
            </AuthGuard>
          } />

          {/* Protected routes for clinic admins and users */}
          <Route path="/dashboard" element={
            <AuthGuard>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </AuthGuard>
          } />
          <Route path="/pacientes" element={
            <AuthGuard>
              <AppLayout>
                <Patients />
              </AppLayout>
            </AuthGuard>
          } />
          <Route path="/profissionais" element={
            <AuthGuard>
              <AppLayout>
                <Professionals />
              </AppLayout>
            </AuthGuard>
          } />
          <Route path="/leitos" element={
            <AuthGuard>
              <AppLayout>
                <Beds />
              </AppLayout>
            </AuthGuard>
          } />
          <Route path="/agenda" element={
            <AuthGuard>
              <AppLayout>
                <Calendar />
              </AppLayout>
            </AuthGuard>
          } />
          <Route path="/documentos" element={
            <AuthGuard>
              <AppLayout>
                <Documents />
              </AppLayout>
            </AuthGuard>
          } />
          <Route path="/contratos" element={
            <AuthGuard>
              <AppLayout>
                <Contracts />
              </AppLayout>
            </AuthGuard>
          } />
          <Route path="/financeiro" element={
            <AuthGuard>
              <AppLayout>
                <Financeiro />
              </AppLayout>
            </AuthGuard>
          } />
          <Route path="/relatorios" element={
            <AuthGuard>
              <AppLayout>
                <Relatorios />
              </AppLayout>
            </AuthGuard>
          } />
          <Route path="/medicamentos" element={
            <AuthGuard>
              <AppLayout>
                <Medications />
              </AppLayout>
            </AuthGuard>
          } />
          <Route path="/medicacoes" element={
            <AuthGuard>
              <AppLayout>
                <Medications />
              </AppLayout>
            </AuthGuard>
          } />
          <Route path="/configuracoes" element={
            <AuthGuard>
              <AppLayout>
                <Configuracoes />
              </AppLayout>
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
