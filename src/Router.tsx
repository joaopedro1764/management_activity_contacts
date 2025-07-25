import { Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";
import { DefaultLayout } from "./pages/DefaultLayout";
import { SalesManagement } from "./pages/clients";
import { ManagerDashboard } from "./pages/Dashboard/ManagerDashboard";
import { Relatorios } from "./pages/Relatorios";

// eslint-disable-next-line react-refresh/only-export-components
export const routes = [
  { path: "/clientes", element: <SalesManagement /> },
  { path: "/dashboard", element: <ManagerDashboard /> },
  { path: "/relatorios", element: <Relatorios /> },
];

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<DefaultLayout />}>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>
      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
}
