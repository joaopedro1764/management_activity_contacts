import type { ContratoCancelado } from "@/types/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as XLSX from "xlsx";


interface PlanilhaResponse {
    aba: string;
}

export function usePlanilha({ aba }: PlanilhaResponse) {

    return useQuery({
        queryKey: ["planilha", aba],
        queryFn: async () => {
            const response = await axios.get("/planilha.xlsx", {
                responseType: "arraybuffer",
            });

            const buffer = response.data;
            const workbook = XLSX.read(buffer, { type: "array" });

            if (!workbook.SheetNames.includes(aba)) {
                throw new Error(`Aba "${aba}" não encontrada na planilha`);
            }

            const sheet = workbook.Sheets[aba];
            const dados = XLSX.utils.sheet_to_json<ContratoCancelado>(sheet, {
                defval: "", raw: false,
            }).filter((row) => {
                return row.motivo_cancelamento?.trim() !== "";
            });
            return dados;
        },
        enabled: !!aba,
    });
}



// Atualiza a célula de um cliente específico e salva
export async function atualizarClienteNaPlanilha(id_cliente: string, novoAssignedTo: string, aba: string) {
  try {
    const response = await axios.get("/planilha.xlsx", {
      responseType: "arraybuffer",
    });

    const buffer = response.data;
    const workbook = XLSX.read(buffer, { type: "array" });

    if (!workbook.SheetNames.includes(aba)) {
      throw new Error(`Aba "${aba}" não encontrada na planilha`);
    }

    const sheet = workbook.Sheets[aba];
    const data = XLSX.utils.sheet_to_json<any>(sheet);

    // Localiza e edita o cliente
    const cliente = data.find(row => row.id_cliente === id_cliente);
    if (cliente) {
      cliente.assignedTo = novoAssignedTo;
    } else {
      throw new Error(`Cliente com ID ${id_cliente} não encontrado`);
    }

    // Reescreve a folha com dados atualizados
    const novaFolha = XLSX.utils.json_to_sheet(data);
    workbook.Sheets[aba] = novaFolha;

    // Cria um arquivo Excel atualizado (em memória ou via download)
    const novoArquivo = XLSX.write(workbook, { type: "array", bookType: "xlsx" });

    // Aqui você pode:
    // 1. Fazer o download do novo arquivo (em frontend)
    // 2. Enviar para um backend que salve esse arquivo
    // Exemplo de download:
    const blob = new Blob([novoArquivo], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "planilha-atualizada.xlsx";
    a.click();
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Erro ao atualizar a planilha:", error);
  }
}
