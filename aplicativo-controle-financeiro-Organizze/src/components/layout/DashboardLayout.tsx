
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Home, User, Sun, Moon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useFinancas } from "@/contexts/FinancasContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: "/", label: "Início", icon: Home, end: true },
  { to: "/perfil", label: "Perfil", icon: User, end: false },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState({ name: "", avatar: "" });
  const [tema, alternarTema] = useTheme();
  const { metas } = useFinancas();
  const metasCriticas = metas.filter((m) => m.status === "critico").length;

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }

    const handleProfileUpdate = (event: CustomEvent) => {
      setUserProfile(event.detail);
    };

    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
    };
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center justify-between flex-shrink-0 px-4 mb-6">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Organizze</h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 dark:text-gray-400"
                onClick={alternarTema}
                title={tema === "dark" ? "Tema claro" : "Tema escuro"}
              >
                {tema === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>

            {/* User Profile Section */}
            <div className="px-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                  <AvatarFallback className="text-sm">
                    {getInitials(userProfile.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {userProfile.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="px-2 space-y-1 flex-1">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex z-10">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"
              }`
            }
          >
            <span className="relative mb-1">
              <Icon className="w-5 h-5" />
              {label === "Início" && metasCriticas > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                  {metasCriticas}
                </span>
              )}
            </span>
            {label}
          </NavLink>
        ))}
        <button
          className="flex-1 flex flex-col items-center py-2 text-xs font-medium text-gray-500 dark:text-gray-400"
          onClick={alternarTema}
        >
          {tema === "dark" ? <Sun className="w-5 h-5 mb-1" /> : <Moon className="w-5 h-5 mb-1" />}
          {tema === "dark" ? "Claro" : "Escuro"}
        </button>
      </nav>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6 pb-20 md:pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
