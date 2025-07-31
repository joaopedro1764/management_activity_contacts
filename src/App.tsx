import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Router } from "./Router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";


export function App() {

  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />
        <Router />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
