
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContextProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Checkout from "./pages/Checkout";
import MasterDashboard from "./pages/MasterDashboard";
import MasterClinics from "./pages/MasterClinics";
import MasterReports from "./pages/MasterReports";
import MasterSettings from "./pages/MasterSettings";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Professionals from "./pages/Professionals";
import Calendar from "./pages/Calendar";
import Beds from "./pages/Beds";
import Medications from "./pages/Medications";
import Documents from "./pages/Documents";
import Contracts from "./pages/Contracts";
import Financeiro from "./pages/Financeiro";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import MasterLayout from "./components/layout/MasterLayout";
import AppLayout from "./components/layout/AppLayout";
import AuthGuard from "./components/auth/AuthGuard";
import { Toaster } from "sonner";
import Alimentacao from "./pages/Alimentacao";
import Dispensa from "./pages/Alimentacao/Dispensa";
import Supermercado from "./pages/Alimentacao/Supermercado";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthContextProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registration />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* Master Admin Routes with MasterLayout */}
            <Route element={<AuthGuard role="master" />}>
              <Route element={<MasterLayout />}>
                <Route path="/master" element={<MasterDashboard />} />
                <Route path="/master/clinics" element={<MasterClinics />} />
                <Route path="/master/reports" element={<MasterReports />} />
                <Route path="/master/settings" element={<MasterSettings />} />
              </Route>
            </Route>

            {/* Clinic Routes with AppLayout */}
            <Route element={<AuthGuard />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/pacientes" element={<Patients />} />
                <Route path="/profissionais" element={<Professionals />} />
                <Route path="/agenda" element={<Calendar />} />
                <Route path="/leitos" element={<Beds />} />
                <Route path="/medicamentos" element={<Medications />} />
                <Route path="/documentos" element={<Documents />} />
                <Route path="/alimentacao" element={<Alimentacao />} />
                <Route path="/alimentacao/dispensa" element={<Dispensa />} />
                <Route path="/alimentacao/supermercado" element={<Supermercado />} />
                <Route path="/contratos" element={<Contracts />} />
                <Route path="/financeiro" element={<Financeiro />} />
                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthContextProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
