import {
  LayoutDashboard,
  LogOut,
  UserCheck,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { motion, type Variants } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Hook para detectar mobile
function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  )

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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
    name: 'Clientes',
    link: '/clientes',
    icon: Users,
    description: 'Visualização de clientes',
  },
    {
    name: 'Dashboard',
    link: '/dashboard',
    icon: LayoutDashboard,
    description: 'Visão geral dos dados',
  },
  {
    name: 'Relatórios',
    link: '/relatorios',
    icon: UserCheck,
    description: 'Controle de relatórios',
  },
]

const sidebarVariants: Variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
  closed: {
    x: '-100%',
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

const itemVariants: Variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  closed: {
    x: -50,
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
}

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

  const exitApp = () => {
    navigate('/')
  }

  return (
    <>
      {/* Overlay */}
      {isOpenSidebar && isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleOpenAndCloseSidebar}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isOpenSidebar ? 'open' : 'closed'}
        className={`
          fixed top-0 left-0 h-full z-50 shadow-2xl border-r border-gray-200 transition-all duration-300
          bg-gradient-to-br from-gray-50 via-white to-gray-100
          ${isMobile ? 'w-full max-w-[300px]' : isCollapsed ? 'w-20' : 'w-72'}
        `}
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100/40 via-white/20 to-gray-50/40 backdrop-blur-sm" />

        {/* Toggle */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isOpenSidebar ? 1 : 0, scale: isOpenSidebar ? 1 : 0.8 }}
          transition={{ delay: isOpenSidebar ? 0.2 : 0 }}
          onClick={isMobile ? handleOpenAndCloseSidebar : handleCollapseSidebar}
          className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all duration-200 z-10"
        >
          {isMobile ? (
            <X className="w-5 h-5" />
          ) : isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </motion.button>

        <nav
          className={`relative h-full flex flex-col transition-all duration-300 ${
            isCollapsed && !isMobile ? 'p-4' : 'p-6'
          }`}
        >
          {/* Logo */}
          <motion.div
            variants={itemVariants}
            className={`flex items-center justify-center mb-12 mt-4 ${
              isCollapsed && !isMobile ? 'mb-8' : ''
            }`}
          >
            <Link to="/dashboard" onClick={handleLinkClick}>
              <div
                className={`bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-500/25 transition-all duration-300 hover:scale-105 cursor-pointer ${
                  isCollapsed && !isMobile ? 'w-12 h-12' : 'w-16 h-16'
                }`}
              >
                <span
                  className={`text-white font-bold transition-all duration-300 ${
                    isCollapsed && !isMobile ? 'text-xl' : 'text-2xl'
                  }`}
                >
                  N
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Menu items */}
          <motion.ul className="flex flex-col gap-3 flex-1">
            {menuItems.map((item) => {
              const isActive = isActiveItem(item.link)
              return (
                <motion.li key={item.name} variants={itemVariants} whileHover={{ scale: 1.02 }}>
                  <Link
                    to={item.link}
                    onClick={handleLinkClick}
                    className={`group flex items-center gap-4 rounded-2xl transition-all duration-300 relative overflow-hidden w-full text-left no-underline
                      ${isCollapsed && !isMobile ? 'px-3 py-3 justify-center' : 'px-4 py-4'}
                      ${
                        isActive
                          ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/20'
                          : 'text-gray-700 hover:gray-gray-800 hover:bg-gray-50'
                      }`}
                    title={isCollapsed && !isMobile ? item.name : undefined}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    <div
                      className={`relative z-10 flex items-center w-full ${
                        isCollapsed && !isMobile ? 'justify-center' : 'gap-4'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl transition-all duration-300 shrink-0 ${
                          isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                      </div>

                      {(!isCollapsed || isMobile) && (
                        <div className="flex-1 overflow-hidden">
                          <div className="font-semibold text-sm truncate">{item.name}</div>
                          <div
                            className={`text-xs truncate ${
                              isActive
                                ? 'text-white/80'
                                : 'text-gray-600 group-hover:text-gray-700'
                            }`}
                          >
                            {item.description}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-gray-200/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                  </Link>
                </motion.li>
              )
            })}
          </motion.ul>

          {/* User / Logout */}
          <motion.div variants={itemVariants} className="mt-auto">
            {(!isCollapsed || isMobile) && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 backdrop-blur-sm mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">JP</span>
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-gray-800 font-medium text-sm truncate">João Pedro</div>
                    <div className="text-gray-600 text-xs truncate">Desenvolvedor</div>
                  </div>
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={exitApp}
              className={`w-full flex items-center gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 group border border-gray-200 hover:border-red-200
              ${isCollapsed && !isMobile ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-center'}`}
              title={isCollapsed && !isMobile ? 'Sair' : undefined}
            >
              <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300 shrink-0" />
              {(!isCollapsed || isMobile) && <span className="font-medium">Sair</span>}
            </motion.button>
          </motion.div>
        </nav>

        {/* Decorativo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-300/20 to-gray-400/20 rounded-full blur-3xl -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-400/20 to-gray-500/20 rounded-full blur-2xl translate-y-12 -translate-x-12" />
      </motion.aside>
    </>
  )
}
