
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import Patients from "./pages/Patients";
import Beds from "./pages/Beds";
import Medications from "./pages/Medications";
import Professionals from "./pages/Professionals";
import Calendar from "./pages/Calendar";
import Documents from "./pages/Documents";
import Financeiro from "./pages/Financeiro";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Contracts from "./pages/Contracts";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import Registration from "./pages/Registration";
import AuthGuard from "./components/auth/AuthGuard";
import MasterDashboard from "./pages/MasterDashboard";
import MasterLayout from "./components/layout/MasterLayout";
import MasterClinics from "./pages/MasterClinics";
import MasterReports from "./pages/MasterReports";
import MasterSettings from "./pages/MasterSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/registro" element={<Registration />} />
          
          <Route path="/sistema" element={
            <AuthGuard>
              <Index />
            </AuthGuard>
          } />
          
          {/* Master Admin Routes */}
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
          
          {/* Clinic Routes */}
          <Route element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pacientes" element={<Patients />} />
            <Route path="/leitos" element={<Beds />} />
            <Route path="/medicamentos" element={<Medications />} />
            <Route path="/profissionais" element={<Professionals />} />
            <Route path="/agenda" element={<Calendar />} />
            <Route path="/documentos" element={<Documents />} />
            <Route path="/contratos" element={<Contracts />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
