import { z } from "zod";
export interface ClienteRecuperadoAtivo {
  id_cliente: string;
  id_contrato: string;
  data_ativacao: string; // ou Date, se você estiver tratando como objeto Date
  data_cancelamento: string; // ou Date
  obs_cancelamento: string;
  meses_ativo: string;
  valor_aberto_total: number;
  valor_recebido_total: number;
  pontuacao: number;
  ie_identidade: string;
  email: string;
  id_condominio: string;
  contato_1: string;
  contato_2: string;
  contato_3: string;
  endereco: string;
  cidade: string;
  cep: string;
  complemento: string;
  data_nascimento: string;
  razao: string;
  numero: string;
  cnpj_cpf: string;
  bairro: string;
  vendedor_responsavel: string;
  tratado: string;
  status_contrato: string;
  contrato: string;
  motivo_cancelamento: string;
  etapa_contato: string;
  data_contato_aceito: string;
  data_contato_final: string;
  canal_de_contato: string;
  descricao_atendente: string;
  descricao_diagnostico: string;
  id_diagnostico: string;
}

export interface StepIndicatorProps {
  stepNumber: number;
  title: string;
  status: string;
}

export interface DashboardFilters {
  period: string;
  seller: string;
  status: string;
  channel: string;
  scoreRange: string;
}

export interface KPIData {
  totalEmContato: number;
  totalRecuperado: number;
  totalPendentes: number;
  totalNaoAtendeu: number;
  totalSemResposta: number;
  totalNaoRecuperado: number; 
  baseTotalClientes: number;
  taxaConversao: number;
  scoreMedio: number;
}

export interface ClientLeadProps {
  client: ClienteRecuperadoAtivo;
}

export interface LoginProps {
  email: string;
  senha: string;
}
export interface JwtPayload {
  email: string;
  nome: string;
  tipo: "admin" | "vendedor";
  iat: number;
  exp: number;
}

export interface Status_Contato {
  em_contato: boolean;
  sem_reposta: boolean;
  nao_atendeu: boolean;
  recuperado: boolean;
}

export const ClientSearchProps = z.object({
  idClientOrNameClient: z.string().optional(),
  statusFilter: z.string().optional(),
});

export const arrayStatusOrdemDesejada = [
  "pendentes_contato",
  "recuperado",
  "nao_recuperado",
  "em_contato",
  "nao_atendeu",
  "sem_resposta",
];
