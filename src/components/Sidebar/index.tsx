import {
  LayoutDashboard,
  LogOut,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"


function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < breakpoint : false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [breakpoint])

  return isMobile
}

interface SidebarProps {
  isOpenSidebar: boolean
  handleOpenAndCloseSidebar: () => void
  isCollapsed: boolean
  handleCollapseSidebar: () => void
}

const menuItems = [
  {
    name: "Meus clientes",
    link: "/listaClientes",
    icon: Users,
    description: "Visualização meus clientes",
  },
  {
    name: "Lista de clientes",
    link: "/meusClientes",
    icon: Users,
    description: "Visualização lead clientes",
  },
  {
    name: "Dashboard",
    link: "/dashboard",
    icon: LayoutDashboard,
    description: "Visão geral dos dados",
  },
]

export function Sidebar({
  isOpenSidebar,
  handleOpenAndCloseSidebar,
  isCollapsed,
  handleCollapseSidebar,
}: SidebarProps) {
  const location = useLocation()
  const isMobile = useIsMobile(1024)
  const navigate = useNavigate()

  const isActiveItem = (itemPath: string) => location.pathname === itemPath

  const handleLinkClick = () => {
    if (isMobile) handleOpenAndCloseSidebar()
  }



  const { user, logout } = useAuth()

  function getInitials(nome: string) {
    const partes = nome.trim().split(" ") // separa por espaço
    const primeiraInicial = partes[0]?.[0] || ""
    const segundaInicial = partes[1]?.[0] || ""
    return (primeiraInicial + segundaInicial).toUpperCase()
  }
  return (
    <>
      {/* Overlay */}
      {isOpenSidebar && isMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={handleOpenAndCloseSidebar} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 shadow-2xl border-r border-blue-200 transition-all duration-300
          bg-gradient-to-br from-blue-50 via-white to-blue-100
          ${isMobile ? "w-full max-w-[300px]" : isCollapsed ? "w-20" : "w-72"}
          ${isOpenSidebar ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-white/20 to-blue-50/40 backdrop-blur-sm" />

        {/* Toggle Button - Posicionado para não sobrepor o logo */}
        {isOpenSidebar && (
          <button
            onClick={isMobile ? handleOpenAndCloseSidebar : handleCollapseSidebar}
            className={`absolute p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-all duration-200 z-10 ${isMobile ? "top-4 right-4" : isCollapsed ? "top-20 left-1/2 transform -translate-x-1/2" : "top-4 right-4"
              }`}
          >
            {isMobile ? (
              <X className="w-5 h-5" />
            ) : isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        )}

        <nav
          className={`relative h-full flex flex-col transition-all duration-300 ${isCollapsed && !isMobile ? "p-4" : "p-6"
            }`}
        >
          {/* Logo */}
          <div className={`flex items-center justify-center mb-12 mt-4 ${isCollapsed && !isMobile ? "mb-8" : ""}`}>
            <Link to="/dashboard" onClick={handleLinkClick}>
              <div
                className={`bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 cursor-pointer ${isCollapsed && !isMobile ? "w-12 h-12" : "w-16 h-16"
                  }`}
              >
                <span
                  className={`text-white font-bold transition-all duration-300 ${isCollapsed && !isMobile ? "text-xl" : "text-2xl"
                    }`}
                >
                  N
                </span>
              </div>
            </Link>
          </div>

          {/* Menu items */}
          <ul className="flex flex-col gap-3 flex-1">
            {menuItems.filter((item) => {
              if (item.link === "/dashboard" && user?.tipo !== "admin") return false;
              return true;
            }).map((item) => {
              const isActive = isActiveItem(item.link)
              return (
                <li key={item.name}>
                  <Link
                    to={item.link}
                    onClick={handleLinkClick}
                    className={`group flex items-center gap-4 rounded-2xl transition-all duration-300 relative overflow-hidden w-full text-left no-underline
                      ${isCollapsed && !isMobile ? "px-3 py-3 justify-center" : "px-4 py-4"}
                      ${isActive
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "text-blue-700 hover:text-blue-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100"
                      }`}
                    title={isCollapsed && !isMobile ? item.name : undefined}
                  >
                    <div
                      className={`relative z-10 flex items-center w-full ${isCollapsed && !isMobile ? "justify-center" : "gap-4"
                        }`}
                    >
                      <div
                        className={`p-2 rounded-xl transition-all duration-300 shrink-0 ${isActive ? "bg-white/20" : "bg-blue-100 group-hover:bg-blue-200"
                          }`}
                      >
                        <item.icon className="w-5 h-5" />
                      </div>
                      {(!isCollapsed || isMobile) && (
                        <div className="flex-1 overflow-hidden">
                          <div className="font-semibold text-sm truncate">{item.name}</div>
                          <div
                            className={`text-xs truncate ${isActive ? "text-white/80" : "text-blue-600 group-hover:text-blue-700"
                              }`}
                          >
                            {item.description}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-blue-200/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* User / Logout */}
          <div className="mt-auto">
            {(!isCollapsed || isMobile) && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 backdrop-blur-sm mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{getInitials(user?.nome || "")}</span>
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-blue-800 font-medium text-sm truncate">{user?.nome}</div>
                    <div className="text-blue-600 text-xs truncate">{user?.tipo === "admin" ? "Admnistrador" : "Vendedor"}</div>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              className={`w-full flex items-center gap-3 text-blue-600 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 rounded-2xl transition-all duration-300 group border border-blue-200 hover:border-red-200
              ${isCollapsed && !isMobile ? "px-3 py-3 justify-center" : "px-4 py-3 justify-center"}`}
              title={isCollapsed && !isMobile ? "Sair" : undefined}
            >
              <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300 shrink-0" />
              {(!isCollapsed || isMobile) && <span className="font-medium">Sair</span>}
            </button>
          </div>
        </nav>

        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-300/20 to-blue-400/20 rounded-full blur-3xl -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-blue-500/20 rounded-full blur-2xl translate-y-12 -translate-x-12" />
      </aside>
    </>
  )
}
