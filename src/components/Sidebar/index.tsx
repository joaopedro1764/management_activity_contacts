import {
  LayoutDashboard,
  LogOut,
  Users,
  Menu,
  X,
  Contact,
  ChevronLeft,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

interface SidebarProps {
  isOpenSidebar: boolean;
  handleOpenAndCloseSidebar: () => void;
  isCollapsed: boolean;
  handleCollapseSidebar: () => void;
}

const menuItems = [
  {
    name: "Lista de Clientes",
    link: "/listaClientes",
    icon: Users,
    description: "Gerencie leads e prospects",
  },
  {
    name: "Meus Clientes",
    link: "/meusClientes",
    icon: Contact,
    description: "Clientes ativos",
  },
  {
    name: "Dashboard",
    link: "/dashboard",
    icon: LayoutDashboard,
    description: "Visão geral",
  },
];

export function Sidebar({
  isOpenSidebar,
  handleOpenAndCloseSidebar,
  isCollapsed,
  handleCollapseSidebar,
}: SidebarProps) {
  const isMobile = useIsMobile(768);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActiveItem = (itemPath: string) =>
    location.pathname.startsWith(`${itemPath}/`) || location.pathname === itemPath;

  const handleLinkClick = () => {
    if (isMobile) handleOpenAndCloseSidebar();
  };

  function getInitials(nome: string) {
    const partes = nome.trim().split(" ");
    const primeiraInicial = partes[0]?.[0] || "";
    const segundaInicial = partes[1]?.[0] || "";
    return (primeiraInicial + segundaInicial).toUpperCase();
  }

  // Mobile Header Component
  const MobileHeader = () => (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-30 px-4 py-3">
      <div className="flex items-center justify-between">
        <button
          onClick={handleOpenAndCloseSidebar}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        
      
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="font-semibold text-gray-800">Recupera +</span>

        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {getInitials(user?.nome || "")}
          </span>
        </div>
      </div>
    </div>
  );

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <aside
      className={`hidden lg:flex fixed top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex flex-col w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="font-bold text-blue-600">Recupera +</h1>
                  <p className="text-xs text-gray-500">Gestão de Clientes</p>
                </div>
              )}
            </div>
            
            <button
              onClick={handleCollapseSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className={`w-4 h-4 text-gray-500 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems
            .filter((item) => {
              if (item.link === "/dashboard" && user?.tipo !== "admin") return false;
              return true;
            })
            .map((item) => {
              const isActive = isActiveItem(item.link);
              return (
                <Link
                  key={item.name}
                  to={item.link}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className={`p-1.5 rounded-lg ${
                    isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                  }`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{item.name}</div>
                      <div className="text-xs text-gray-500 truncate">{item.description}</div>
                    </div>
                  )}
                </Link>
              );
            })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-100">
          {!isCollapsed && (
            <div className="mb-4 p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {getInitials(user?.nome || "")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{user?.nome}</div>
                  <div className="text-xs text-gray-500">
                    {user?.tipo === "admin" ? "Administrador" : "Vendedor"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? "Sair" : undefined}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span className="font-medium text-sm">Sair</span>}
          </button>
        </div>
      </div>
    </aside>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      {/* Overlay */}
      {isOpenSidebar && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={handleOpenAndCloseSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full bg-white z-50 w-80 max-w-[85vw] transform transition-transform duration-300 ${
          isOpenSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <Link to="/dashboard" className="flex items-center gap-3" onClick={handleLinkClick}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">N</span>
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">Sistema</h1>
                  <p className="text-xs text-gray-500">Gestão de Clientes</p>
                </div>
              </Link>
              
              <button
                onClick={handleOpenAndCloseSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {getInitials(user?.nome || "")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{user?.nome}</div>
                  <div className="text-sm text-gray-600">
                    {user?.tipo === "admin" ? "Administrador" : "Vendedor"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-3">
            {menuItems
              .filter((item) => {
                if (item.link === "/dashboard" && user?.tipo !== "admin") return false;
                return true;
              })
              .map((item) => {
                const isActive = isActiveItem(item.link);
                return (
                  <Link
                    key={item.name}
                    to={item.link}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{item.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
          </nav>

          {/* Logout */}
          <div className="p-6 border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 p-4 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );

  return (
    <>
      <MobileHeader />
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}