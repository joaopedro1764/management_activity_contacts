import { Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";
import SalesManagement from "./pages/sales-management";
import { DefaultLayout } from "./pages/DefaultLayout";

// eslint-disable-next-line react-refresh/only-export-components
export const routes = [
  { path: "/clientes", element: <SalesManagement /> },
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
