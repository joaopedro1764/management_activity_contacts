import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Building, MessageCircle, Check, X, Users, ArrowLeft, CheckCircle, XCircle, Save, ArrowRight, AlertCircle, PhoneOff, AlertTriangle, Contact, ClipboardList } from "lucide-react"
import { usePlanilha } from "@/api/planilha"
import type { ContratoCancelado, StepIndicatorProps } from "@/types/client"
import { assuntoNao, assuntoSim } from "@/lib/assuntos"
import { format } from "date-fns"
import { SelectRecuperacao } from "@/components/ui/SelectRecuperacao"
import { toast } from "sonner"
export const sellers = ["João Vendedor", "Maria Vendedora", "Carlos Vendedor", "Ana Vendedora"]

export const getScoreColor = (score: number) => {
  if (score >= 8) return "text-green-600 font-semibold"
  if (score >= 6) return "text-yellow-600 font-semibold"
  return "text-red-600 font-semibold"
}

interface TipoRecuperacao {
  id: string;
  status: string;
}

export function SalesManagement() {

  const [selectedClient, setSelectedClient] = useState<ContratoCancelado | null>()
  const [contatoFeito, setContatoFeito] = useState(false)
  const [respondido, setRespondido] = useState(false)
  const [recuperado, setRecuperado] = useState(false)
  const [canalDeContato, setCanalDeContato] = useState("")
  const [tipoDeRecuperacao, setTipoDeRecuperacao] = useState<TipoRecuperacao>({
    id: "",
    status: ""
  });

  const [deveFecharContato, setDeveFecharContato] = useState(false)
  const [descricaoAtendente, setDescricaoAtendente] = useState("")
  const { data: cancelamentos } = usePlanilha({ aba: "Sheet1" })
  const [clients, setClients] = useState<ContratoCancelado[]>()


  /* 
    const acceptedClients = clients?.filter(client =>
      client.status === "assigned" && client.assignedTo === sellers[0]
    ) */

  useEffect(() => {
    setClients(cancelamentos?.sort(
      (a, b) => Number(b.score) - Number(a.score)
    ))
  }, [cancelamentos])

  const nextClient = clients?.find(client =>
    client.status === "available" ||
    (
      client.status === "assigned" &&
      client.assignedTo === sellers[0] &&
      !client.contactMade &&
      (!client.contactStatus || client.contactStatus === "nao_atendeu")
    )
  );



  const options = recuperado ? assuntoSim : assuntoNao;

  // Quando a lista de opções mudar, resetar o valor selecionado se não existir mais
  useEffect(() => {
    const stillExists = options.some(opt => opt.id === tipoDeRecuperacao.id);
    if (!stillExists) {
      setTipoDeRecuperacao({ id: "", status: "" }); // resetar se o valor não existir mais
    }
  }, [options]);

  const handleAcceptClient = () => {

    if (nextClient) {
      const updatedClient: ContratoCancelado = {
        ...nextClient,
        contactStatus: "em_contato" as const,
        assignedTo: sellers[0],
        data_contato_aceitacao: format(Date.now(), "dd/MM/yyyy")
      }
      setClients(clients?.map(client =>
        client.id_cliente === nextClient.id_cliente ? updatedClient : client
      ))
      setSelectedClient(updatedClient)
      // Reset form states
      setContatoFeito(false)
      setRespondido(false)
      setRecuperado(false)
      setCanalDeContato("")
      setTipoDeRecuperacao({ id: "", status: "" })
      setDeveFecharContato(false)
      toast.success('Cliente aceito com sucesso, cheque sua lista')
    }
  }


  const handleSkipClient = () => {
    if (nextClient) {
      // Remove o cliente da lista temporariamente (simulando pular)
      setClients(clients?.filter(client => client.id_cliente !== nextClient.id_cliente))
    }
  }

  const handleSaveClientContact = () => {
    if (!selectedClient) return;

    const dataFinal = format(Date.now(), "dd/MM/yyyy");
    const updateClient = (overrides: Partial<ContratoCancelado>) => {
      const updatedClient: ContratoCancelado = {
        ...selectedClient,
        status: "assigned",
        contactMade: contatoFeito,
        recovered: recuperado,
        assignedTo: sellers[0],
        contactChannel: respondido ? canalDeContato as "whatsapp" | "telefone" : undefined,
        ...overrides,
      };

      // Atualiza o estado da UI
      const novosClientes = clients?.map(client =>
        client.id_cliente === updatedClient.id_cliente ? updatedClient : client
      );
      setClients(novosClientes);

      // --- Atualiza apenas os clientes alterados na sessionStorage ---
      const sessionKey = "clientesAtualizados";

      const salvos = sessionStorage.getItem(sessionKey);
      const atualizados: ContratoCancelado[] = salvos ? JSON.parse(salvos) : [];

      const atualizadosSemEsse = atualizados.filter(
        c => c.id_cliente !== updatedClient.id_cliente
      );

      const novosAtualizados = [...atualizadosSemEsse, updatedClient];

      sessionStorage.setItem(sessionKey, JSON.stringify(novosAtualizados));
    };

    if (recuperado) {
      updateClient({
        contactStatus: "recuperado",
        idDiagnostico: tipoDeRecuperacao.id,
        descricao_atendente: descricaoAtendente,
        data_contato_final: dataFinal
      });
    } else if (contatoFeito && !respondido && deveFecharContato) {
      updateClient({
        contactStatus: "contato_encerrado",
        idDiagnostico: tipoDeRecuperacao.id,
        descricao_atendente: descricaoAtendente,
        data_contato_final: dataFinal
      });
    } else if (contatoFeito && !respondido) {
      updateClient({ contactStatus: "nao_atendeu" });
    } else if (!contatoFeito && !respondido && !recuperado) {
      updateClient({ contactStatus: "em_contato" });
    }
    toast.success('Atualização salva com sucesso, cheque sua lista')
    setDescricaoAtendente("");
    setSelectedClient(null);
  };


  const handleBackToDashboard = () => {
    setSelectedClient(null)
  }

  const getStepStatus = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return contatoFeito ? 'completed' : 'current';
      case 2:
        return !contatoFeito ? 'disabled' : respondido ? 'completed' : 'current';
      case 3:
        return !respondido ? 'disabled' : canalDeContato ? 'completed' : 'current';
      case 4:
        return !respondido ? 'disabled' : recuperado ? 'completed' : 'current';
      default:
        return 'disabled';
    }
  };

  const motivoColors: Record<string, string> = {
    "MUDANCA DE ENDERECO (INVIABILIDADE TECNICA)": "bg-blue-600 text-white",
    "SOLICITACAO DE AGENDAMENTO NAO ATENDIDA": "bg-blue-700 text-white",

    "INSATISFACAO COM SERVICO PRESTADO": "bg-red-600 text-white",
    "INSATISFAÇÃO COM STREAMING": "bg-red-500 text-white",
    "INSATISFACAO COM ATENDIMENTO": "bg-pink-600 text-white",
    "INSATISFACAO COM VALOR DO SERVICO": "bg-yellow-500 text-white",

    "CORTE DE GASTOS": "bg-yellow-600 text-white",
    "TROCOU DE PROVEDOR (MELHOR PROPOSTA FINANCEIRA)": "bg-yellow-700 text-white",
    "TROCOU DE PROVEDOR (PACOTE DADOS MOVEIS INCLUSO)": "bg-purple-700 text-white",
    "TROCOU DE PROVEDOR (PACOTE DE TV INCLUSO)": "bg-purple-600 text-white",
    "MUDANCA PARA LOCAL QUE JA POSSUI NMULTIFIBRA": "bg-indigo-600 text-white",

    "TERMINO DE CONTRATO": "bg-green-600 text-white",

    "PAUSA NO CONTRATO": "bg-gray-700 text-white",
    "PESSOAL NAO DETALHADO": "bg-gray-600 text-white",

    "FALECIMENTO DO TITULAR": "bg-gray-800 text-white",
    "EMPRESA FECHOU": "bg-zinc-700 text-white",

    "FRAUDE NA CONTRATAÇÃO": "bg-orange-600 text-white",
    "DIREITO DO CONSUMIDOR 7 DIAS": "bg-orange-700 text-white"
  };

  const StepIndicator = ({ stepNumber, title, status }: StepIndicatorProps) => {
    const getStepStyles = () => {
      switch (status) {
        case 'completed':
          return 'bg-green-500 text-white border-green-500';
        case 'current':
          return 'bg-blue-500 text-white border-blue-500';
        case 'disabled':
          return 'bg-gray-200 text-gray-400 border-gray-200';
        default:
          return 'bg-gray-200 text-gray-400 border-gray-200';
      }
    };
    return (
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${getStepStyles()}`}>
          {status === 'completed' ? <CheckCircle className="h-4 w-4" /> : stepNumber}
        </div>
        <span className={`text-sm font-medium ${status === 'disabled' ? 'text-gray-400' : 'text-gray-700'}`}>
          {title}
        </span>
      </div>
    );
  };

  if (selectedClient) {
    return (
      <div className="min-h-screen w-full bg-gray-100">
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
              <p className="text-slate-600 mt-1">Gerencie o contato com o cliente</p>
            </div>
          </div>

          {/* Card de informações do cliente */}
          <Card className="w-full border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Users className="h-5 w-5 text-blue-600" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      {selectedClient.nome}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium text-slate-700">{selectedClient.telefone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-slate-700">{selectedClient.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Building className="h-4 w-4 text-purple-600" />
                      <span className="text-slate-700">Na base há {selectedClient.meses_base} meses</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-slate-700">Score Interno:</span>
                    <span className={`ml-2 text-xl ${getScoreColor(selectedClient.score)}`}>{selectedClient.score}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-700">Motivo do Cancelamento:</span>
                    <p className="text-sm text-slate-600 mt-1 fontbold p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-md border border-slate-200">
                      {selectedClient.motivo_cancelamento}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de status do contato horizontal */}
          <div className="w-full space-y-6">

            {/* Progress Steps Horizontal */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-medium gap-2">
                  <Contact className="h-8 w-8 text-blue-500" />
                  Progresso do Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Steps Indicator */}
                <div className="flex items-center justify-between mb-8">
                  <StepIndicator stepNumber={1} title="Tentativa de Contato" status={getStepStatus(1)} />
                  <ArrowRight className="h-6 w-6 text-gradient-to-r from-blue-400 to-indigo-500 mx-2" />
                  <StepIndicator stepNumber={2} title="Resposta do Cliente" status={getStepStatus(2)} />
                  <ArrowRight className="h-6 w-6 text-gradient-to-r from-blue-400 to-indigo-500 mx-2" />
                  <StepIndicator stepNumber={3} title="Canal de Comunicação" status={getStepStatus(3)} />
                  <ArrowRight className="h-6 w-6 text-gradient-to-r from-blue-400 to-indigo-500 mx-2" />
                  <StepIndicator stepNumber={4} title="Resultado Final" status={getStepStatus(4)} />
                </div>

                {/* Steps Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Step 1: Contato Realizado */}
                  <div className="space-y-4 p-4 bg-gradient-to-br from-violet-50 to-purple-100 rounded-lg border border-violet-200 shadow-md hover:shadow-lg transition-all duration-300">
                    <h3 className="font-semibold text-violet-800">1. Tentativa de Contato</h3>
                    <p className="text-sm text-violet-700">Você já tentou entrar em contato com este cliente?</p>
                    <div className="space-y-2">
                      <Button
                        variant={contatoFeito ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setContatoFeito(true)
                          if (!contatoFeito) {
                            setRespondido(false)
                            setCanalDeContato("")
                            setRecuperado(false)
                            setTipoDeRecuperacao({ id: "", status: "" })
                            setDeveFecharContato(false)
                          }
                        }}
                        className={`w-full flex items-center gap-2 transition-all duration-300 ${contatoFeito
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
                          setContatoFeito(false)
                          setRespondido(false)
                          setCanalDeContato("")
                          setRecuperado(false)
                          setTipoDeRecuperacao({ id: "", status: "" })
                          setDeveFecharContato(false)
                        }}
                        className={`w-full flex items-center gap-2 transition-all duration-300 ${!contatoFeito
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
                    className={`space-y-4 p-4 rounded-lg border shadow-md hover:shadow-lg transition-all duration-300 ${contatoFeito
                      ? "bg-gradient-to-br from-cyan-50 to-blue-100 border-cyan-200"
                      : "bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300"
                      }`}
                  >
                    <h3 className={`font-semibold ${contatoFeito ? "text-cyan-800" : "text-slate-500"}`}>
                      2. Resposta do Cliente
                    </h3>
                    {contatoFeito ? (
                      <>
                        <p className="text-sm text-cyan-700">O cliente respondeu/atendeu seu contato?</p>
                        <div className="space-y-2">
                          <Button
                            variant={respondido ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setRespondido(true)
                              setDeveFecharContato(false)
                              if (!respondido) {
                                setCanalDeContato("")
                                setRecuperado(false)
                                setTipoDeRecuperacao({
                                  id: "",
                                  status: ""
                                })
                              }
                            }}
                            className={`w-full flex items-center gap-2 transition-all duration-300 ${respondido
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
                              setRespondido(false)
                              setCanalDeContato("")
                              setRecuperado(false)
                            }}
                            className={`w-full flex items-center gap-2 transition-all duration-300 ${!respondido
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
                              <h4 className="text-xs font-semibold text-amber-800">Cliente não atendeu</h4>
                            </div>
                            <div className="space-y-2">
                              <Button
                                variant={deveFecharContato ? "default" : "outline"}
                                size="sm"
                                onClick={() => setDeveFecharContato(true)}
                                className={`w-full text-xs transition-all duration-300 ${deveFecharContato
                                  ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg shadow-red-200"
                                  : "hover:bg-red-700"
                                  }`}
                              >
                                Encerrar Contato
                              </Button>
                              <Button
                                variant={!deveFecharContato ? "default" : "outline"}
                                size="sm"
                                onClick={() => setDeveFecharContato(false)}
                                className={`w-full text-xs transition-all duration-300 ${!deveFecharContato
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
                      <p className="text-sm text-slate-500">Complete o passo anterior</p>
                    )}
                  </div>

                  {/* Step 3: Canal de Atendimento */}
                  <div
                    className={`space-y-4 p-4 rounded-lg border shadow-md hover:shadow-lg transition-all duration-300 ${contatoFeito && respondido
                      ? "bg-gradient-to-br from-indigo-50 to-blue-100 border-indigo-200"
                      : "bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300"
                      }`}
                  >
                    <h3 className={`font-semibold ${contatoFeito && respondido ? "text-indigo-800" : "text-slate-500"}`}>
                      3. Canal de Comunicação
                    </h3>
                    {contatoFeito && respondido ? (
                      <>
                        <p className="text-sm text-indigo-700">Por qual meio vocês conversaram?</p>
                        <div className="space-y-2">
                          <Button
                            variant={canalDeContato === "whatsapp" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCanalDeContato("whatsapp")}
                            className={`w-full flex items-center gap-2 transition-all duration-300 ${canalDeContato === "whatsapp"
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-200 text-white"
                              : "hover:bg-blue-700"
                              }`}
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </Button>
                          <Button
                            variant={canalDeContato === "telefone" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCanalDeContato("telefone")}
                            className={`w-full flex items-center gap-2 transition-all duration-300 ${canalDeContato === "telefone"
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
                      <p className="text-sm text-slate-500">Complete os passos anteriores</p>
                    )}
                  </div>

                  {/* Step 4: Cliente Recuperado */}
                  <div
                    className={`space-y-4 p-4 rounded-lg border shadow-md hover:shadow-lg transition-all duration-300 ${contatoFeito && respondido && canalDeContato
                      ? "bg-gradient-to-br from-teal-50 to-emerald-100 border-teal-200"
                      : "bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300"
                      }`}
                  >
                    <h3
                      className={`font-semibold ${contatoFeito && respondido && canalDeContato ? "text-teal-800" : "text-slate-500"}`}
                    >
                      4. Resultado Final
                    </h3>
                    {contatoFeito && respondido && canalDeContato ? (
                      <>
                        <p className="text-sm text-teal-700">Conseguiu recuperar o cliente?</p>
                        <div className="space-y-2">
                          <Button
                            variant={recuperado ? "default" : "outline"}
                            size="sm"
                            onClick={() => setRecuperado(true)}
                            className={`w-full flex items-center gap-2 transition-all duration-300 ${recuperado
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
                            className={`w-full flex items-center gap-2 transition-all duration-300 ${!recuperado
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
                      <p className="text-sm text-slate-500">Complete os passos anteriores</p>
                    )}
                  </div>
                </div>

                {/* Detailed Results Section */}
                {((recuperado && contatoFeito && respondido && canalDeContato) ||
                  (!recuperado && contatoFeito && respondido && canalDeContato)) && (
                    <div className="mt-8 space-y-4">
                      <div
                        className={`p-4 rounded-lg border-2 ${recuperado ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
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
                              <h4 className="text-sm font-semibold text-red-800">Cliente não foi recuperado</h4>
                            </>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className={`text-sm font-medium ${recuperado ? "text-green-700" : "text-red-700"}`}>
                              {recuperado ? "Tipo de recuperação:" : "Motivo da não recuperação:"}
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
                            <label className={`text-sm font-medium ${recuperado ? "text-green-700" : "text-red-700"}`}>
                              Observações adicionais:
                            </label>
                            <textarea
                              value={descricaoAtendente}
                              onChange={(e) => setDescricaoAtendente(e.target.value)}
                              className={`w-full min-h-[100px] p-3 bg-white border rounded-md text-sm text-gray-900 
                            focus:outline-none focus:ring-2 hover:border-opacity-80 transition-colors duration-200 resize-none shadow-sm
                            ${recuperado
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
            <Card className="border-2 border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contato feito:</span>
                    <span className={contatoFeito ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {contatoFeito ? "✓ Sim" : "✗ Não"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cliente atendeu:</span>
                    <span className={respondido ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {contatoFeito ? (respondido ? "✓ Sim" : "✗ Não") : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Canal usado:</span>
                    <span className="font-medium">
                      {canalDeContato ? (canalDeContato === "whatsapp" ? "📱 WhatsApp" : "📞 Telefone") : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cliente recuperado:</span>
                    <span className={recuperado ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {respondido ? (recuperado ? "✓ Sim" : "✗ Não") : "—"}
                    </span>
                  </div>
                  {contatoFeito && !respondido && (
                    <div className="flex justify-between col-span-2 pt-2 border-t">
                      <span className="text-gray-600">Ação escolhida:</span>
                      <span className={deveFecharContato ? "text-red-600 font-medium" : "text-blue-600 font-medium"}>
                        {deveFecharContato ? "🚫 Encerrar Contato" : "🔄 Manter para novas tentativas"}
                      </span>
                    </div>
                  )}
                  {recuperado && tipoDeRecuperacao && (
                    <div className="flex justify-between col-span-2 pt-2 border-t">
                      <span className="text-gray-600">Tipo de recuperação:</span>
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
                disabled={(respondido && !canalDeContato) /* || (descricaoAtendente.length === 0 || tipoDeRecuperacao?.id?.length === 0) */}
                className="px-8 py-3 text-lg bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-200 text-white transition-all duration-300"
              >
                <Save className="h-5 w-5 mr-2" />
                Salvar Informações
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard principal
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interface do colaborador</h1>
            <p className="text-gray-600 mt-1">Gerencie seus clientes de contato ativo</p>
          </div>
        </div>

        {/* Próximo Cliente Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Próximo Cliente
            </CardTitle>
            <CardDescription>
              Cliente disponível para contato
            </CardDescription>
          </CardHeader>
          <CardContent>
            {nextClient ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{nextClient.nome}</h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{nextClient.telefone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{nextClient.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span>Na base há {nextClient.meses_base} meses</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Score Interno:</span>
                      <span className={`ml-2 text-lg ${getScoreColor(nextClient.score)}`}>
                        {nextClient.score}
                      </span>
                    </div>

                    <div className="mt-4">
                      <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-700 animate-pulse " />
                        Motivo do Cancelamento:
                      </span>
                      <p className={`max-w-md get text-sm mt-1 px-3 py-2 ${motivoColors[nextClient.motivo_cancelamento] || 'bg-gray-50 text-gray-600'} rounded-lg shadow-md font-semibold animate-fade-in`}>
                        {nextClient.motivo_cancelamento}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={handleAcceptClient} className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Aceitar Cliente
                  </Button>
                  <Button variant="outline" onClick={handleSkipClient} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Pular Cliente
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum cliente disponível no momento</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-1 h-full bg-red-900 justify-center">
          <Card className="w-full mt-8">
            <CardHeader className="text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <CardTitle className="text-2xl font-semibold text-gray-800">Nenhum Cliente Disponível</CardTitle>
              <CardDescription className="text-base text-gray-600 mt-2">
                Parece que não há novos clientes para aceitar no momento. Por favor, aguarde novas atribuições ou verifique
                a lista de clientes existentes.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {/* You can add a button here if you want to navigate the user to another section, e.g., "Ver Clientes Existentes" */}
              {/* <Button className="mt-4">Ver Clientes Existentes</Button> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}