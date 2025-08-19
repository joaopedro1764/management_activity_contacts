import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";

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

export function DefaultLayout() {
  const [isOpenSidebar, setIsOpenSidebar] = useState(false); // Começa fechado no mobile
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile(768);

  // Fecha sidebar automaticamente quando muda para mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpenSidebar(false);
    }
  }, [isMobile]);

  function handleOpenAndCloseSidebar() {
    setIsOpenSidebar((prev) => !prev);
  }

  function handleCollapseSidebar() {
    setIsCollapsed((prev) => !prev);
  }

  // Calcula a margem do main baseada no estado da sidebar
  const getMainStyles = () => {
    // Mobile: sempre ocupa toda a largura + padding top para o header
    if (isMobile) {
      return {
        marginLeft: "0",
        paddingTop: "4rem", // Espaço para o header fixo mobile
        width: "100%"
      };
    }

    // Desktop: ajusta margem baseada no estado da sidebar
    const marginLeft = isCollapsed ? "5rem" : "16rem"; // 20 = 5rem, 64 = 16rem
    
    return {
      marginLeft,
      paddingTop: "0",
      width: `calc(100% - ${marginLeft})`
    };
  };

  const mainStyles = getMainStyles();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpenSidebar={isOpenSidebar}
        handleOpenAndCloseSidebar={handleOpenAndCloseSidebar}
        isCollapsed={isCollapsed}
        handleCollapseSidebar={handleCollapseSidebar}
      />

      {/* Main Content */}
      <main 
        className="min-h-screen transition-all duration-300 ease-in-out"
        style={mainStyles}
      >
        <div className="h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}