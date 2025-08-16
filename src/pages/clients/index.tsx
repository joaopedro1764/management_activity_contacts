import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Phone,
  MessageCircle,
  Users,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Save,
  ArrowRight,
  AlertCircle,
  PhoneOff,
  AlertTriangle,
  Contact,
  ArrowBigLeft,
  CircleCheck,
  ArrowBigRight,
  DollarSign,
  MapPin,
  Calendar,
  FileUser,
  PhoneCall,
  Copy,
  ContactRound,
  PhoneForwarded,
  CalendarClock,
  CalendarOff,
} from "lucide-react";
import type {
  ClienteRecuperadoAtivo,
  StepIndicatorProps,
} from "@/types/client";
import { assuntoNao, assuntoSim } from "@/lib/assuntos";
import { format, intervalToDuration } from "date-fns";
import { SelectRecuperacao } from "@/components/ui/SelectRecuperacao";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useParams } from "react-router";
import { useCliente, useUpdateClient } from "@/api/api";
export const sellers = [
  "João Vendedor",
  "Maria Vendedora",
  "Carlos Vendedor",
  "Ana Vendedora",
];

export const getScoreColor = (score: number) => {
  if (score >= 8) return "text-green-600 font-semibold";
  if (score >= 6) return "text-yellow-600 font-semibold";
  return "text-red-600 font-semibold";
};

interface TipoRecuperacao {
  id: string;
  status: string;
}

export function SalesManagement() {
  const { id_cliente } = useParams();
  const [selectedClient, setSelectedClient] =
    useState<ClienteRecuperadoAtivo | null>();
  const [contatoFeito, setContatoFeito] = useState(false);
  const [respondido, setRespondido] = useState(false);
  const [recuperado, setRecuperado] = useState(false);
  const [canalDeContato, setCanalDeContato] = useState("");
  const [tipoDeRecuperacao, setTipoDeRecuperacao] = useState<TipoRecuperacao>({
    id: "",
    status: "",
  });
  const [deveFecharContato, setDeveFecharContato] = useState(false);
  const [descricaoAtendente, setDescricaoAtendente] = useState("");
  const { data: cancelamentos, isLoading } = useCliente();
  const { mutateAsync: updateClientFn } = useUpdateClient();
  const [clients, setClients] = useState<ClienteRecuperadoAtivo[]>();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const { user } = useAuth();
  const options = recuperado ? assuntoSim : assuntoNao;
  const navigate = useNavigate();

  useEffect(() => {
    if (!id_cliente) return;
    const client = cancelamentos?.find(
      (c) => String(c.id_cliente) === String(id_cliente)
    );
    if (client) {
      setSelectedClient(client);
      setContatoFeito(
        client.etapa_contato === "em_contato" ||
          client.etapa_contato === "nao_atendeu"
      );
      setRespondido(client.etapa_contato === "sem_resposta");
      setRecuperado(client.etapa_contato === "recuperado");
      setCanalDeContato(client.canal_de_contato);
      setTipoDeRecuperacao({
        id: client.id_diagnostico ?? "",
        status: client.descricao_diagnostico ?? "",
      });
    }
  }, [id_cliente, cancelamentos]);

  useEffect(() => {
    setClients(
      [...(cancelamentos ?? [])].sort(
        (a, b) => Number(b.pontuacao) - Number(a.pontuacao)
      )
    );
  }, [cancelamentos]);

  useEffect(() => {
    const stillExists = options.some((opt) => opt.id === tipoDeRecuperacao.id);
    if (!stillExists) {
      setTipoDeRecuperacao({ id: "", status: "" });
    }
  }, [options]);

  const filteredClients: ClienteRecuperadoAtivo[] = useMemo(() => {
    return (
      clients?.filter(
        (client) =>
          client.status_contrato === "I" &&
          (!client.vendedor_responsavel ||
            client.vendedor_responsavel.trim() === "")
      ) ?? []
    );
  }, [clients]);

  const nextClient = filteredClients[currentIndex];

  function handleNextClient() {
    if (currentIndex < filteredClients.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function handlePreviousClient() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }

  if (isLoading) {
    return (
      <button type="button" className="bg-indigo-500 ..." disabled>
        <svg className="mr-3 size-5 animate-spin ..." viewBox="0 0 24 24"></svg>
        Carregando...
      </button>
    );
  }

  async function handleAcceptClient() {
    if (nextClient) {
      const updatedClient: ClienteRecuperadoAtivo = {
        ...nextClient,
        etapa_contato: "em_contato" as const,
        canal_de_contato: "telefone",
        vendedor_responsavel: user.nome,
        data_contato_aceito: String(format(Date.now(), "dd/MM/yyyy")),
      };
      setSelectedClient(updatedClient);
      await updateClientFn(updatedClient);
      toast.success("Cliente aceito com sucesso, cheque sua lista");
    }
  }

  function determinarStatusFinal():
    | "recuperado"
    | "nao_recuperado"
    | "sem_resposta"
    | "nao_atendeu"
    | "em_contato" {
    if (recuperado) {
      return "recuperado";
    }

    if (!contatoFeito) {
      return "em_contato";
    }

    if (!recuperado && contatoFeito && respondido) {
      return "nao_recuperado";
    }

    if (contatoFeito && deveFecharContato) {
      return "sem_resposta";
    }

    if (contatoFeito && !respondido) {
      return "nao_atendeu";
    }

    return "em_contato";
  }

  function isTratado(status: string): "Sim" | "Não" {
    if (["sem_resposta", "recuperado"].includes(status)) {
      return "Sim";
    }
    return "Não";
  }

  async function handleSaveClientContact() {
    if (!selectedClient) return;

    const etapaContato = determinarStatusFinal();

    const updatedClient: ClienteRecuperadoAtivo = {
      ...selectedClient,
      etapa_contato: etapaContato,
      tratado: isTratado(etapaContato),
      vendedor_responsavel: user.nome,
      canal_de_contato: canalDeContato ?? "Telefone",
      descricao_atendente: descricaoAtendente,
      id_diagnostico: tipoDeRecuperacao.id ?? null,
      descricao_diagnostico: tipoDeRecuperacao.status ?? "",
      data_contato_final:
        etapaContato === "sem_resposta" || etapaContato === "recuperado"
          ? String(format(Date.now(), "dd/MM/yyyy"))
          : "",
    };

    try {
      await updateClientFn(updatedClient);
      toast.success("Cliente atualizado com sucesso, cheque sua lista!");
      setSelectedClient(null);
    } catch (error) {
      toast.error("Ocorreu um erro, tente novamente!");
    }
  }

  const handleBackToDashboard = () => {
    navigate("/listaClientes");

    setSelectedClient(null);
  };

  const getStepStatus = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return contatoFeito ? "completed" : "current";
      case 2:
        return !contatoFeito
          ? "disabled"
          : respondido
          ? "completed"
          : "current";
      case 3:
        return !respondido
          ? "disabled"
          : canalDeContato
          ? "completed"
          : "current";
      case 4:
        return !respondido ? "disabled" : recuperado ? "completed" : "current";
      default:
        return "disabled";
    }
  };

  const StepIndicator = ({ stepNumber, title, status }: StepIndicatorProps) => {
    const getStepStyles = () => {
      switch (status) {
        case "completed":
          return "bg-green-500 text-white border-green-500";
        case "current":
          return "bg-blue-500 text-white border-blue-500";
        case "disabled":
          return "bg-gray-200 text-gray-400 border-gray-200";
        default:
          return "bg-gray-200 text-gray-400 border-gray-200";
      }
    };
    return (
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${getStepStyles()}`}
        >
          {status === "completed" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            stepNumber
          )}
        </div>
        <span
          className={`text-sm font-medium ${
            status === "disabled" ? "text-gray-400" : "text-gray-700"
          }`}
        >
          {title}
        </span>
      </div>
    );
  };

  function formatMonthsToYearsAndMonths(totalMonths: number): string {
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    const yearStr = years > 0 ? `${years} ${years === 1 ? "ano" : "anos"}` : "";
    const monthStr =
      months > 0 ? `${months} ${months === 1 ? "mês" : "meses"}` : "";

    if (yearStr && monthStr) return `${yearStr} e ${monthStr}`;
    if (yearStr) return yearStr;
    if (monthStr) return monthStr;

    return "0 mês";
  }

  const start = new Date(nextClient?.data_cancelamento);
  const end = new Date();
  const intervalDateFromCancelation = intervalToDuration({ start, end });

  const parts: string[] = [];

  if (intervalDateFromCancelation.years) {
    parts.push(
      `${intervalDateFromCancelation.years} ${
        intervalDateFromCancelation.years === 1 ? "ano" : "anos"
      }`
    );
  }
  if (intervalDateFromCancelation.months) {
    parts.push(
      `${intervalDateFromCancelation.months} ${
        intervalDateFromCancelation.months === 1 ? "mês" : "meses"
      }`
    );
  }
  if (intervalDateFromCancelation.days) {
    parts.push(
      `${intervalDateFromCancelation.days} ${
        intervalDateFromCancelation.days === 1 ? "dia" : "dias"
      }`
    );
  }

  function copyText(text: string) {
    try {
      navigator.clipboard.writeText(text);
      toast.success("Copiado com sucesso!");
    } catch (err) {
      toast.error("Erro ao copiar texto: " + err);
    }
  }

  if (selectedClient) {
    return (
      <div className="min-h-screen w-full bg-blue-50">
        <div className="p-6 space-y-6">
          {/* Header com botão voltar */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Detalhes do Cliente
              </h1>
              <p className="text-slate-600 mt-1">
                Gerencie o contato com o cliente
              </p>
            </div>
          </div>

          {/* Card de informações do cliente */}
          <div className="w-full border-2 border-blue-300 shadow-lg bg-white rounded-lg">
            {/* Header compacto */}
            <div className="bg-gradient-to-r border-b border-blue-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                    <ContactRound className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-600 text-white">
                        {selectedClient.id_cliente}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">
                        {selectedClient.razao}
                      </h3>
                    </div>
                  </div>
                </div>
                <button
                  title="Copiar ID do Cliente"
                  onClick={() => copyText(selectedClient.id_cliente)}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Corpo principal em grid compacto */}
            <div className="bg-white border-x border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                {/* Coluna 1: Contato e Dados Básicos */}
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide border-b pb-1">
                    Informações cliente:
                  </h3>

                  <div className="space-y-2">
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="space-y-2">
                        {[
                          selectedClient.contato_1,
                          selectedClient.contato_2,
                          selectedClient.contato_3,
                        ]
                          .filter(
                            (contato, index, self) =>
                              contato && self.indexOf(contato) === index
                          )
                          .map((contato, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg group hover:bg-blue-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center">
                                  <PhoneCall className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="font-medium text-slate-900">
                                  {contato}
                                </span>
                              </div>
                              <button
                                onClick={() => copyText(contato)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-blue-600 hover:text-blue-700 transition-all duration-200"
                                title="Copiar telefone"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Data do cancelamento
                        </p>
                        <p className="font-semibold text-slate-900">
                          {format(
                            selectedClient.data_cancelamento,
                            "dd/MM/yyyy"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 border border-slate-200  rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CalendarClock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Tempo na base
                      </p>
                      <p className="text-blue-700">
                        Permaneceu na base por{" "}
                        {formatMonthsToYearsAndMonths(
                          Number(selectedClient.meses_ativo)
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CalendarOff className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Tempo desde o cancelamento
                      </p>
                      <p className="text-blue-700">
                        Cliente cancelado há {parts.join(" ")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Coluna 2: Endereço e Localização */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Endereço
                      </p>
                      <p className="font-semibold text-slate-900 text-sm">
                        <p className="text-slate-900 font-medium">
                          {selectedClient.endereco}, {selectedClient.numero} -{" "}
                          {selectedClient.bairro}
                        </p>
                      </p>
                    </div>
                  </div>

                  {/* Valores financeiros compactos */}
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Valor total recebido
                      </p>
                      <p className="font-semibold text-slate-900">
                        {selectedClient.valor_recebido_total.toLocaleString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Valor total em aberto
                      </p>
                      <p className="font-semibold text-slate-900">
                        {selectedClient.valor_aberto_total.toLocaleString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <PhoneForwarded className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Etapa contato
                      </p>
                      <p className="font-semibold text-slate-900">
                        {selectedClient.etapa_contato}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Coluna 3: Motivo do Cancelamento */}
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide border-b pb-1">
                    Motivo do Cancelamento
                  </h3>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-xs font-medium text-blue-800 mb-1">
                      {selectedClient.motivo_cancelamento ||
                        "Motivo não informado"}
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-t-0 border-gray-200 rounded-b-lg p-3">
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                        📝 Observações detalhadas (clique para expandir)
                      </summary>
                      <div className="mt-2 text-xs text-gray-600 bg-white p-3 rounded border">
                        {selectedClient.obs_cancelamento ||
                          "Nenhuma observação disponível."}
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card de status do contato horizontal */}
          <div className="w-full space-y-6">
            {/* Progress Steps Horizontal */}
            <Card className="border-2 border-blue-300 shadow-2xl bg-gradient-to-br from-white via-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-medium gap-2">
                  <Contact className="h-8 w-8 text-blue-500" />
                  Progresso do Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Steps Indicator */}
                <div className="flex items-center justify-between mb-8">
                  <StepIndicator
                    stepNumber={1}
                    title="Tentativa de Contato"
                    status={getStepStatus(1)}
                  />
                  <ArrowRight className="h-6 w-6 text-gradient-to-r from-blue-400 to-indigo-500 mx-2" />
                  <StepIndicator
                    stepNumber={2}
                    title="Resposta do Cliente"
                    status={getStepStatus(2)}
                  />
                  <ArrowRight className="h-6 w-6 text-gradient-to-r from-blue-400 to-indigo-500 mx-2" />
                  <StepIndicator
                    stepNumber={3}
                    title="Canal de Comunicação"
                    status={getStepStatus(3)}
                  />
                  <ArrowRight className="h-6 w-6 text-gradient-to-r from-blue-400 to-indigo-500 mx-2" />
                  <StepIndicator
                    stepNumber={4}
                    title="Resultado Final"
                    status={getStepStatus(4)}
                  />
                </div>

                {/* Steps Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Step 1: Contato Realizado */}
                  <div className="space-y-4 p-4 bg-gradient-to-br from-violet-50 to-purple-100 rounded-lg border border-violet-200 shadow-md hover:shadow-lg transition-all duration-300">
                    <h3 className="font-semibold text-violet-800">
                      1. Tentativa de Contato
                    </h3>
                    <p className="text-sm text-violet-700">
                      Você já tentou entrar em contato com este cliente?
                    </p>
                    <div className="space-y-2">
                      <Button
                        variant={contatoFeito ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setContatoFeito(true);
                          if (!contatoFeito) {
                            setRespondido(false);
                            setCanalDeContato("");
                            setRecuperado(false);
                            setTipoDeRecuperacao({ id: "", status: "" });
                            setDeveFecharContato(false);
                          }
                        }}
                        className={`w-full flex items-center gap-2 transition-all duration-300 ${
                          contatoFeito
                            ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-200 text-white"
                            : "hover:bg-green-600"
                        }`}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Sim, fiz contato
                      </Button>
                      <Button
                        variant={!contatoFeito ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setContatoFeito(false);
                          setRespondido(false);
                          setCanalDeContato("");
                          setRecuperado(false);
                          setTipoDeRecuperacao({ id: "", status: "" });
                          setDeveFecharContato(false);
                        }}
                        className={`w-full flex items-center gap-2 transition-all duration-300 ${
                          !contatoFeito
                            ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-200 text-white"
                            : "hover:bg-red-600"
                        }`}
                      >
                        <XCircle className="h-4 w-4" />
                        Ainda não tentei
                      </Button>
                    </div>
                  </div>

                  {/* Step 2: Cliente Atendeu */}
                  <div
                    className={`space-y-4 p-4 rounded-lg border shadow-md hover:shadow-lg transition-all duration-300 ${
                      contatoFeito
                        ? "bg-gradient-to-br from-cyan-50 to-blue-100 border-cyan-200"
                        : "bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300"
                    }`}
                  >
                    <h3
                      className={`font-semibold ${
                        contatoFeito ? "text-cyan-800" : "text-slate-500"
                      }`}
                    >
                      2. Resposta do Cliente
                    </h3>
                    {contatoFeito ? (
                      <>
                        <p className="text-sm text-cyan-700">
                          O cliente respondeu/atendeu seu contato?
                        </p>
                        <div className="space-y-2">
                          <Button
                            variant={respondido ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setRespondido(true);
                              setDeveFecharContato(false);
                              if (!respondido) {
                                setCanalDeContato("");
                                setRecuperado(false);
                                setTipoDeRecuperacao({
                                  id: "",
                                  status: "",
                                });
                              }
                            }}
                            className={`w-full flex items-center gap-2 transition-all duration-300 ${
                              respondido
                                ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-200 text-white"
                                : "hover:bg-green-600"
                            }`}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Sim, me atendeu
                          </Button>
                          <Button
                            variant={!respondido ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setRespondido(false);
                              setCanalDeContato("");
                              setRecuperado(false);
                            }}
                            className={`w-full flex items-center gap-2 transition-all duration-300 ${
                              !respondido
                                ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-200 text-white"
                                : "hover:bg-red-700"
                            }`}
                          >
                            <XCircle className="h-4 w-4" />
                            Não atendeu
                          </Button>
                        </div>

                        {/* Opção de encerrar contato quando cliente não atender */}
                        {!respondido && (
                          <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-100 border border-amber-300 rounded-lg space-y-3 shadow-inner">
                            <div className="flex items-center gap-2">
                              <PhoneOff className="h-4 w-4 text-amber-700" />
                              <h4 className="text-xs font-semibold text-amber-800">
                                Cliente não atendeu
                              </h4>
                            </div>
                            <div className="space-y-2">
                              <Button
                                variant={
                                  deveFecharContato ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setDeveFecharContato(true)}
                                className={`w-full text-xs transition-all duration-300 ${
                                  deveFecharContato
                                    ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg shadow-red-200"
                                    : "hover:bg-red-700"
                                }`}
                              >
                                Encerrar Contato
                              </Button>
                              <Button
                                variant={
                                  !deveFecharContato ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setDeveFecharContato(false)}
                                className={`w-full text-xs transition-all duration-300 ${
                                  !deveFecharContato
                                    ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-200"
                                    : "hover:bg-green-600"
                                }`}
                              >
                                Manter tentativas
                              </Button>
                            </div>
                            {deveFecharContato && (
                              <div className="space-y-2">
                                <SelectRecuperacao
                                  options={assuntoNao}
                                  value={tipoDeRecuperacao}
                                  setValue={setTipoDeRecuperacao}
                                  placeholder="Motivo de não recuperação"
                                  recuperado={recuperado}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Complete o passo anterior
                      </p>
                    )}
                  </div>

                  {/* Step 3: Canal de Atendimento */}
                  <div
                    className={`space-y-4 p-4 rounded-lg border shadow-md hover:shadow-lg transition-all duration-300 ${
                      contatoFeito && respondido
                        ? "bg-gradient-to-br from-indigo-50 to-blue-100 border-indigo-200"
                        : "bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300"
                    }`}
                  >
                    <h3
                      className={`font-semibold ${
                        contatoFeito && respondido
                          ? "text-indigo-800"
                          : "text-slate-500"
                      }`}
                    >
                      3. Canal de Comunicação
                    </h3>
                    {contatoFeito && respondido ? (
                      <>
                        <p className="text-sm text-indigo-700">
                          Por qual meio vocês conversaram?
                        </p>
                        <div className="space-y-2">
                          <Button
                            variant={
                              canalDeContato === "whatsapp"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => setCanalDeContato("whatsapp")}
                            className={`w-full flex items-center gap-2 transition-all duration-300 ${
                              canalDeContato === "whatsapp"
                                ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-200 text-white"
                                : "hover:bg-blue-700"
                            }`}
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </Button>
                          <Button
                            variant={
                              canalDeContato === "telefone"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => setCanalDeContato("telefone")}
                            className={`w-full flex items-center gap-2 transition-all duration-300 ${
                              canalDeContato === "telefone"
                                ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-200 text-white"
                                : "hover:bg-blue-700"
                            }`}
                          >
                            <Phone className="h-4 w-4" />
                            Ligação
                          </Button>
                        </div>
                        {!canalDeContato && (
                          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-2 rounded text-xs">
                            <AlertCircle className="h-3 w-3" />
                            <span>Selecione o canal</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Complete os passos anteriores
                      </p>
                    )}
                  </div>

                  {/* Step 4: Cliente Recuperado */}
                  <div
                    className={`space-y-4 p-4 rounded-lg border shadow-md hover:shadow-lg transition-all duration-300 ${
                      contatoFeito && respondido && canalDeContato
                        ? "bg-gradient-to-br from-teal-50 to-emerald-100 border-teal-200"
                        : "bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300"
                    }`}
                  >
                    <h3
                      className={`font-semibold ${
                        contatoFeito && respondido && canalDeContato
                          ? "text-teal-800"
                          : "text-slate-500"
                      }`}
                    >
                      4. Resultado Final
                    </h3>
                    {contatoFeito && respondido && canalDeContato ? (
                      <>
                        <p className="text-sm text-teal-700">
                          Conseguiu recuperar o cliente?
                        </p>
                        <div className="space-y-2">
                          <Button
                            variant={recuperado ? "default" : "outline"}
                            size="sm"
                            onClick={() => setRecuperado(true)}
                            className={`w-full flex items-center gap-2 transition-all duration-300 ${
                              recuperado
                                ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-200 text-white"
                                : "hover:bg-green-600"
                            }`}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Sim, recuperei!
                          </Button>
                          <Button
                            variant={!recuperado ? "default" : "outline"}
                            size="sm"
                            onClick={() => setRecuperado(false)}
                            className={`w-full flex items-center gap-2 transition-all duration-300 ${
                              !recuperado
                                ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-200 text-white"
                                : "hover:bg-red-600"
                            }`}
                          >
                            <XCircle className="h-4 w-4" />
                            Não consegui
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Complete os passos anteriores
                      </p>
                    )}
                  </div>
                </div>

                {/* Detailed Results Section */}
                {((recuperado &&
                  contatoFeito &&
                  respondido &&
                  canalDeContato) ||
                  (!recuperado &&
                    contatoFeito &&
                    respondido &&
                    canalDeContato)) && (
                  <div className="mt-8 space-y-4">
                    <div
                      className={`p-4 rounded-lg border-2 ${
                        recuperado
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        {recuperado ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <h4 className="text-sm font-semibold text-green-800">
                              Parabéns! Cliente recuperado com sucesso
                            </h4>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-600" />
                            <h4 className="text-sm font-semibold text-red-800">
                              Cliente não foi recuperado
                            </h4>
                          </>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label
                            className={`text-sm font-medium ${
                              recuperado ? "text-green-700" : "text-red-700"
                            }`}
                          >
                            {recuperado
                              ? "Tipo de recuperação:"
                              : "Motivo da não recuperação:"}
                          </label>
                          <SelectRecuperacao
                            options={options}
                            value={tipoDeRecuperacao}
                            setValue={setTipoDeRecuperacao}
                            placeholder="Selecione o motivo"
                            recuperado={recuperado}
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            className={`text-sm font-medium ${
                              recuperado ? "text-green-700" : "text-red-700"
                            }`}
                          >
                            Observações adicionais:
                          </label>
                          <textarea
                            value={descricaoAtendente}
                            onChange={(e) =>
                              setDescricaoAtendente(e.target.value)
                            }
                            className={`w-full min-h-[100px] p-3 bg-white border rounded-md text-sm text-gray-900 
                            focus:outline-none focus:ring-2 hover:border-opacity-80 transition-colors duration-200 resize-none shadow-sm
                            ${
                              recuperado
                                ? "border-green-300 placeholder-green-400 focus:ring-green-500 focus:border-green-500 hover:border-green-400"
                                : "border-red-300 placeholder-red-400 focus:ring-red-500 focus:border-red-500 hover:border-red-400"
                            }`}
                            placeholder="Descreva detalhes sobre a tentativa de recuperação..."
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Summary */}
            <Card className="border-2 border-blue-300">
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contato feito:</span>
                    <span
                      className={
                        contatoFeito
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {contatoFeito ? "✓ Sim" : "✗ Não"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cliente atendeu:</span>
                    <span
                      className={
                        respondido
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {contatoFeito ? (respondido ? "✓ Sim" : "✗ Não") : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Canal usado:</span>
                    <span className="font-medium">
                      {canalDeContato
                        ? canalDeContato === "whatsapp"
                          ? "📱 WhatsApp"
                          : "📞 Telefone"
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cliente recuperado:</span>
                    <span
                      className={
                        recuperado
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {respondido ? (recuperado ? "✓ Sim" : "✗ Não") : "—"}
                    </span>
                  </div>
                  {contatoFeito && !respondido && (
                    <div className="flex justify-between col-span-2 pt-2 border-t">
                      <span className="text-gray-600">Ação escolhida:</span>
                      <span
                        className={
                          deveFecharContato
                            ? "text-red-600 font-medium"
                            : "text-blue-600 font-medium"
                        }
                      >
                        {deveFecharContato
                          ? "🚫 Encerrar Contato"
                          : "🔄 Manter para novas tentativas"}
                      </span>
                    </div>
                  )}
                  {recuperado && tipoDeRecuperacao && (
                    <div className="flex justify-between col-span-2 pt-2 border-t">
                      <span className="text-gray-600">
                        Tipo de recuperação:
                      </span>
                      <span className="font-medium text-green-600">
                        {tipoDeRecuperacao.status}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="text-center">
              <Button
                onClick={handleSaveClientContact}
                size="lg"
                disabled={
                  respondido &&
                  !canalDeContato /* || (descricaoAtendente.length === 0 || tipoDeRecuperacao?.id?.length === 0) */
                }
                className="px-8 py-3 text-lg bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-200 text-white transition-all duration-300"
              >
                <Save className="h-5 w-5 mr-2" />
                Salvar Informações
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard principal
  return (
    <main className="min-h-screen w-full bg-blue-50">
      <div className="w-full space-y-8">
        {/* Main Content Area */}
        <div className="flex items-center gap-6 p-4 md:p-6 lg:p-8">
          {/* Próximo Cliente Card - Takes 2/3 of the width on large screens */}
          <Card className="w-full shadow-lg border-2 border-blue-300">
            <CardContent className="pt-6">
              {nextClient ? (
                <div className="space-y-8">
                  <h3 className="text-xl font-medium text-slate-600">
                    <strong>N-Recupera+</strong> | Plataforma de recuperação de
                    clientes cancelados
                  </h3>
                  {/* Grid Principal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Informações do Cliente */}
                    <div className="bg-white border-2 border-blue-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                      {/* Header Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                              <ContactRound className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <span
                                  onClick={() =>
                                    copyText(nextClient.id_cliente)
                                  }
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm cursor-copy font-semibold bg-blue-600 text-white"
                                >
                                  {nextClient.id_cliente}
                                </span>
                                <h3 className="text-xl font-bold text-slate-900">
                                  {nextClient.razao}
                                </h3>
                              </div>
                              <p className="text-sm text-slate-600 mt-1">
                                Cliente disponível para contato
                              </p>
                            </div>
                          </div>
                          <button
                            title="Copiar ID do Cliente"
                            onClick={() => copyText(nextClient.id_cliente)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6">
                        {/* Client Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {/* CPF/CNPJ */}
                          <div
                            className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-copy"
                            onClick={() => copyText(nextClient.cnpj_cpf)}
                          >
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileUser className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                CPF/CNPJ
                              </p>
                              <p className="font-semibold text-slate-900">
                                {nextClient.cnpj_cpf}
                              </p>
                            </div>
                          </div>

                          {/* Data de Cancelamento */}
                          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Data do cancelamento
                              </p>
                              <p className="font-semibold text-slate-900">
                                {format(
                                  nextClient.data_cancelamento,
                                  "dd/MM/yyyy"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Contacts Section */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <PhoneCall className="w-4 h-4" />
                            Contatos Disponíveis
                          </h4>
                          <div className="space-y-2">
                            {[
                              nextClient.contato_1,
                              nextClient.contato_2,
                              nextClient.contato_3,
                            ]
                              .filter(
                                (contato, index, self) =>
                                  contato && self.indexOf(contato) === index
                              )
                              .map((contato, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg group hover:bg-blue-100 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center">
                                      <PhoneCall className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="font-medium text-slate-900">
                                      {contato}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => copyText(contato)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-blue-600 hover:text-blue-700 transition-all duration-200"
                                    title="Copiar telefone"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Address Section */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Endereço
                          </h4>
                          <div className="p-4 bg-slate-50 rounded-xl border flex gap-3 items-center border-slate-200">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-slate-900 font-medium">
                              {nextClient.endereco}, {nextClient.numero} -{" "}
                              {nextClient.bairro}, {nextClient.cidade}
                            </p>
                          </div>
                        </div>

                        {/* Status Tags */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-4 border border-slate-200  rounded-xl">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <CalendarClock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-blue-800">
                                Tempo na base
                              </p>
                              <p className="text-blue-700">
                                Permaneceu na base por{" "}
                                {formatMonthsToYearsAndMonths(
                                  Number(nextClient.meses_ativo)
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <CalendarOff className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-blue-800">
                                Tempo desde o cancelamento
                              </p>
                              <p className="text-blue-700">
                                Cliente cancelado há {parts.join(" ")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Score, Cancelamento e Financeiro */}
                    <div className="space-y-6">
                      {/* Score */}
                      <div className="bg-blue-100/60 border-2 border-blue-300 font-medium rounded-xl p-5 flex gap-2 items-center shadow-sm">
                        <span className="text-xl uppercase font-semibold">
                          Score Interno:
                        </span>
                        <span
                          className={`text-4xl font-black tracking-tight ${getScoreColor(
                            nextClient.pontuacao
                          )}`}
                        >
                          {nextClient.pontuacao}
                        </span>
                      </div>

                      {/* Motivo Cancelamento */}
                      <div className="space-y-2">
                        <span className="text-base font-medium flex items-center gap-2 text-gray-800">
                          <AlertTriangle className="w-5 h-5 animate-pulse" />
                          Motivo do Cancelamento
                        </span>
                        <div
                          className={`text-sm font-semibold px-4 py-3 rounded-lg shadow-sm bg-blue-400 text-white`}
                        >
                          {nextClient.motivo_cancelamento}
                        </div>
                        {nextClient.obs_cancelamento && (
                          <p className="text-[15px] text-gray-700 mt-1 leading-relaxed">
                            <strong>Observação:</strong>{" "}
                            {nextClient.obs_cancelamento}
                          </p>
                        )}
                      </div>

                      {/* Valores Financeiros */}
                      <div className="grid grid-cols-2 gap-4 border-t pt-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <span>
                            Valor Recebido:{" "}
                            <span className="font-semibold text-blue-700">
                              R${" "}
                              {nextClient.valor_recebido_total.toLocaleString(
                                "pt-BR"
                              )}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <span>
                            Valor Aberto:{" "}
                            <span className="font-semibold text-blue-700">
                              R${" "}
                              {nextClient.valor_aberto_total.toLocaleString(
                                "pt-BR"
                              )}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-6">
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <Button
                        onClick={handlePreviousClient}
                        className="flex items-center gap-2 text-black bg-transparent border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100 shadow-sm"
                      >
                        <ArrowBigLeft className="h-5 w-5" />
                        Voltar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleNextClient}
                        className="flex items-center gap-2 border text-black border-gray-300 hover:bg-blue-500 hover:text-white px-6 py-3 rounded-lg shadow-sm"
                      >
                        <ArrowBigRight className="h-5 w-5" />
                        Pular Cliente
                      </Button>
                    </div>
                    <Button
                      onClick={handleAcceptClient}
                      className="flex items-center gap-2 text-black bg-transparent border border-gray-300 px-6 py-3 rounded-lg hover:bg-blue-500 hover:text-white shadow-sm"
                    >
                      <CircleCheck className="h-6 w-6" />
                      Aceitar Cliente
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600 font-medium">
                    Nenhum cliente disponível no momento.
                  </p>
                  <p className="text-gray-500 mt-2">
                    Aguarde por novos clientes ou verifique suas atribuições.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
