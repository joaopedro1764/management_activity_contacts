export interface ContratoCancelado {
  id_cliente: string
  id_contrato: string
  status: "available" | "assigned" | "contacted" | "completed"
  contrato: string // pode ser número do contrato, tipo textual ou identificador
  data_ativacao: string // ou Date
  data_cancelamento: string // ou Date
  motivo_cancelamento: string
  obs_cancelamento: string
  score: number
  telefone: string;
  email: string;
  nome: string;
  meses_base: string;
  contactStatus?: "em_contato" | "contato_encerrado" | "nao_atendeu" | "recuperado" | undefined
  assignedTo: string;
  contactChannel?: "whatsapp" | "telefone";
  contactMade: boolean;
  recovered: boolean;
  data_contato_aceitacao?: string;
  data_contato_final?: string
  descricao_atendente?: string;
  idDiagnostico?: string;
}

export interface StepIndicatorProps {
  stepNumber: number,
  title: string,
  status: string
}

export interface DashboardFilters {
  period: string;
  seller: string;
  status: string;
  channel: string;
  scoreRange: string;
}

export interface KPIData {
  totalClients: number;
  totalAttempts: number;
  totalAnswered: number;
  totalRecovered: number;
  conversionRate: number;
  averageScore: number;
}

export interface ClientLeadProps {
  client: ContratoCancelado;

} 