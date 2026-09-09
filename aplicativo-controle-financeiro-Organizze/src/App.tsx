import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Relatorios from "./pages/Relatorios";
import Transacoes from "./pages/Transacoes";
import Perfil from "./pages/Perfil";
import NaoEncontrado from "./pages/NaoEncontrado";
import Login from "./pages/Login";
import RedefinirSenha from "./pages/RedefinirSenha";
import { FinanceProvider } from "./contexts/FinancasContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DashboardLayout } from "./components/layout/DashboardLayout";

const queryClient = new QueryClient();

const RotaProtegida: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FinanceProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/redefinir-senha" element={<RedefinirSenha />} />
              <Route
                path="/"
                element={
                  <RotaProtegida>
                    <Index />
                  </RotaProtegida>
                }
              />
              <Route
                path="/relatorios"
                element={
                  <RotaProtegida>
                    <DashboardLayout><Relatorios /></DashboardLayout>
                  </RotaProtegida>
                }
              />
              <Route
                path="/perfil"
                element={
                  <RotaProtegida>
                    <Perfil />
                  </RotaProtegida>
                }
              />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/transacoes" element={<RotaProtegida><Transacoes /></RotaProtegida>} />
              <Route path="*" element={<NaoEncontrado />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </FinanceProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
