export interface SalesReport {
    totalClients: number
    totalContacted: number
    totalAnswered: number
    totalRecovered: number
    conversionRate: number
    answerRate: number
    recoveryRate: number
}

export interface SellerStats {
    sellerName: string
    assigned: number
    contacted: number
    answered: number
    recovered: number
}
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
    contactStatus?: "em_contato" | "contato_encerrado" | "nao_atendeu" | "recuperado"
    assignedTo: string;
    contactChannel?: "whatsapp" | "telefone";
    contactMade: boolean;
    recovered: boolean;
}
