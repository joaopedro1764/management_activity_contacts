import { Navigate, Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";
import { DefaultLayout } from "./pages/DefaultLayout";
import { ManagerDashboard } from "./pages/Dashboard/ManagerDashboard";
import { ListCustomer } from "./pages/ListCustomers";
import { AuthProvider, useAuth } from "./context/AuthContext";
import type { JSX } from "react";
import { SalesManagement } from "./pages/clients";

// eslint-disable-next-line react-refresh/only-export-components
export const routes = [
  { path: "/meusClientes", element: <ListCustomer /> },
  {
    path: "/listaClientes",
    element: <SalesManagement />,
  },
  {
    path: "/listaClientes/:id_cliente",
    element: <SalesManagement />,
  },
  { path: "/dashboard", element: <ManagerDashboard />, requireAdmin: true },
];

interface PrivateRouteProps {
  children: JSX.Element;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export function AdminRoute({ children }: { children: JSX.Element }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.tipo !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function Router() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<DefaultLayout />}>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<PrivateRoute>{route.element}</PrivateRoute>}
            />
          ))}
        </Route>
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </AuthProvider>
  );
}
