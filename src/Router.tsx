import { Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";
import { DefaultLayout } from "./pages/DefaultLayout";
import { SalesManagement } from "./pages/Clients";
import { ManagerDashboard } from "./pages/Dashboard/ManagerDashboard";
import { ListCustomer } from "./pages/ListCustomers";


// eslint-disable-next-line react-refresh/only-export-components
export const routes = [
  { path: "/listMyClients", element: <ListCustomer /> },
  { path: "/listAllClients", element: <SalesManagement /> },
  { path: "/dashboard", element: <ManagerDashboard /> },
  
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
