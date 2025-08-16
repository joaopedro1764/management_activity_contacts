import type { ClienteRecuperadoAtivo, LoginProps } from "@/types/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useCliente() {
  return useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      
      const response = await axios.get<ClienteRecuperadoAtivo[]>(
        "http://10.0.30.251:3011/clientes"
      );
      return response.data;
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["usuarios"],
    queryFn: async () => {
      
      const response = await axios.get<string[]>(
        "http://10.0.30.251:3011/usuarios"
      );
      return response.data;
    },
  });
}


export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, senha }: LoginProps) => {
      const response = await axios.post("http://10.0.30.251:3011/login", {
        email,
        senha,
      });
      return response.data;
    },
  });
}



export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (client: ClienteRecuperadoAtivo) => {
      const response = await axios.put<ClienteRecuperadoAtivo>(
        `http://10.0.30.251:3011/cliente/${client.id_cliente}`,
        client
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
    },
  });
}
