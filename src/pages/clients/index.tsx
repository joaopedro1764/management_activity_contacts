import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Mail, Building, MessageCircle, Check, X, Users, ArrowLeft, CheckCircle, XCircle, Save, ArrowRight, AlertCircle, User, PhoneOff, AlertTriangle } from "lucide-react"
import { usePlanilha } from "@/api/planilha"
import type { ContratoCancelado, StepIndicatorProps } from "@/types/client"
import { TableClientsAcepted } from "./table-clients-acepted"
import { assuntoNao, assuntoSim } from "@/lib/assuntos"
import { format } from "date-fns"
export const sellers = ["João Vendedor", "Maria Vendedora", "Carlos Vendedor", "Ana Vendedora"]

export const getScoreColor = (score: number) => {
  if (score >= 8) return "text-green-600 font-semibold"
  if (score >= 6) return "text-yellow-600 font-semibold"
  return "text-red-600 font-semibold"
}

export function SalesManagement() {

  const [selectedClient, setSelectedClient] = useState<ContratoCancelado | null>()
  const [contatoFeito, setContatoFeito] = useState(false)
  const [respondido, setRespondido] = useState(false)
  const [recuperado, setRecuperado] = useState(false)
  const [canalDeContato, setCanalDeContato] = useState("")
  const [tipoDeRecuperacao, setTipoDeRecuperacao] = useState("")
  const [deveFecharContato, setDeveFecharContato] = useState(false)
  const [descricaoAtendente, setDescricaoAtendente] = useState("")
  const { data: cancelamentos } = usePlanilha({ aba: "Sheet1" })
  const [clients, setClients] = useState<ContratoCancelado[]>()



  const acceptedClients = clients?.filter(client =>
    client.status === "assigned" && client.assignedTo === sellers[0]
  )
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


  console.log(nextClient)

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
      setTipoDeRecuperacao("")
      setDeveFecharContato(false)
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
        ...overrides
      };
      setClients(clients?.map(client =>
        client.id_cliente === selectedClient.id_cliente ? updatedClient : client
      ));
    };

    if (recuperado) {
      updateClient({
        contactStatus: "recuperado",
        idDiagnostico: tipoDeRecuperacao,
        descricao_atendente: descricaoAtendente,
        data_contato_final: dataFinal
      });
    } else if (contatoFeito && !respondido && deveFecharContato) {
      updateClient({
        contactStatus: "contato_encerrado",
        idDiagnostico: tipoDeRecuperacao,
        descricao_atendente: descricaoAtendente,
        data_contato_final: dataFinal
      });
    } else if (contatoFeito && !respondido) {
      updateClient({ contactStatus: "nao_atendeu" });
    } else if (!contatoFeito && !respondido && !recuperado) {
      updateClient({ contactStatus: "em_contato" });
    }

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


  console.log(clients)

  if (selectedClient) {
    return (
      <div className="min-h-screen w-full bg-gray-100">
        <div className="p-6 space-y-6">
          {/* Header com botão voltar */}
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBackToDashboard} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Detalhes do Cliente</h1>
              <p className="text-gray-600 mt-1">Gerencie o contato com o cliente</p>
            </div>
          </div>

          {/* Card de informações do cliente */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">{selectedClient.nome}</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{selectedClient.telefone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{selectedClient.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span>Na base há {selectedClient.meses_base} meses</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Score Interno:</span>
                    <span className={`ml-2 text-xl ${getScoreColor(selectedClient.score)}`}>
                      {selectedClient.score}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-700">Motivo do Cancelamento:</span>
                    <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded-md">
                      {selectedClient.motivo_cancelamento}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de status do contato melhorado */}
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">Acompanhamento do Cliente</h2>
              <p className="text-gray-600">Registre o progresso do seu contato seguindo os passos abaixo</p>
            </div>

            {/* Progress Steps */}
            <Card className="border-2 border-blue-100">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <User className="h-5 w-5" />
                  Progresso do Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Step 1: Contato Realizado */}
                  <div className="space-y-3">
                    <StepIndicator stepNumber={1} title="Tentativa de Contato" status={getStepStatus(1)} />
                    <div className="ml-11 space-y-3">
                      <p className="text-sm text-gray-600">Você já tentou entrar em contato com este cliente?</p>
                      <div className="flex gap-3">
                        <Button
                          variant={contatoFeito ? "default" : "outline"}
                          size="lg"
                          onClick={() => {
                            setContatoFeito(true);
                            if (!contatoFeito) {
                              setRespondido(false);
                              setCanalDeContato("");
                              setRecuperado(false);
                              setTipoDeRecuperacao("");
                              setDeveFecharContato(false);
                            }
                          }}
                          className="flex items-center gap-2 px-6"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Sim, fiz contato
                        </Button>
                        <Button
                          variant={!contatoFeito ? "destructive" : "outline"}
                          size="lg"
                          onClick={() => {
                            setContatoFeito(false);
                            setRespondido(false);
                            setCanalDeContato("");
                            setRecuperado(false);
                            setTipoDeRecuperacao("");
                            setDeveFecharContato(false);
                          }}
                          className="flex items-center gap-2 px-6"
                        >
                          <XCircle className="h-4 w-4" />
                          Ainda não tentei
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Cliente Atendeu */}
                  {contatoFeito && (
                    <>
                      <div className="flex items-center">
                        <ArrowRight className="h-4 w-4 text-blue-500 mx-4" />
                      </div>
                      <div className="space-y-3">
                        <StepIndicator stepNumber={2} title="Resposta do Cliente" status={getStepStatus(2)} />
                        <div className="ml-11 space-y-3">
                          <p className="text-sm text-gray-600">O cliente respondeu/atendeu seu contato?</p>
                          <div className="flex gap-3">
                            <Button
                              variant={respondido ? "default" : "outline"}
                              size="lg"
                              onClick={() => {
                                setRespondido(true);
                                setDeveFecharContato(false);
                                if (!respondido) {
                                  setCanalDeContato("");
                                  setRecuperado(false);
                                  setTipoDeRecuperacao("");
                                }
                              }}
                              className="flex items-center gap-2 px-6"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Sim, me atendeu
                            </Button>
                            <Button
                              variant={!respondido ? "destructive" : "outline"}
                              size="lg"
                              onClick={() => {
                                setRespondido(false);
                                setCanalDeContato("");
                                setRecuperado(false);
                              }}
                              className="flex items-center gap-2 px-6"
                            >
                              <XCircle className="h-4 w-4" />
                              Não atendeu
                            </Button>
                          </div>

                          {/* Opção de encerrar contato quando cliente não atender */}
                          {contatoFeito && !respondido && (
                            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-3">
                              <div className="flex items-center gap-2">
                                <PhoneOff className="h-5 w-5 text-orange-600" />
                                <h4 className="text-sm font-semibold text-orange-800">Cliente não atendeu</h4>
                              </div>
                              <p className="text-sm text-orange-700">
                                Você pode optar por encerrar o contato com este cliente ou manter para futuras tentativas.
                              </p>
                              <div className="flex gap-3">
                                <Button
                                  variant={deveFecharContato ? "destructive" : "outline"}
                                  size="sm"
                                  onClick={() => setDeveFecharContato(true)}
                                  className="flex items-center gap-2"
                                >
                                  <PhoneOff className="h-4 w-4" />
                                  Encerrar Contato
                                </Button>
                                <Button
                                  variant={!deveFecharContato ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setDeveFecharContato(false)}
                                  className="flex items-center gap-2"
                                >
                                  <Phone className="h-4 w-4" />
                                  Manter para novas tentativas
                                </Button>
                              </div>
                              {deveFecharContato && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                                  <p className="text-sm text-red-700 font-medium">
                                    ⚠️ O contato será encerrado e este cliente não aparecerá mais na sua lista.
                                  </p>

                                  <Select value={tipoDeRecuperacao} onValueChange={setTipoDeRecuperacao}>
                                    <SelectTrigger className="w-full bg-white mt-2 border-red-300">
                                      <SelectValue placeholder="Escolha o motivo da não recuperação" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {assuntoNao.map((item) => (
                                        <SelectItem value={item.id} key={item.id}>
                                          <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            {item.status}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-red-700">
                                      Observações adicionais:
                                    </label>
                                    <textarea
                                      value={descricaoAtendente}
                                      onChange={(e) => setDescricaoAtendente(e.target.value)}
                                      className="w-full min-h-[100px] p-3 bg-white border border-red-300 rounded-md 
                                  text-sm text-gray-900 placeholder-red-400
                                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
                                  hover:border-red-400 transition-colors duration-200
                                  resize-none shadow-sm"
                                      placeholder="Descreva detalhes sobre a tentativa de recuperação..."
                                      rows={4}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 3: Canal de Atendimento */}
                  {contatoFeito && respondido && (
                    <>
                      <div className="flex items-center">
                        <ArrowRight className="h-4 w-4 text-blue-500 mx-4" />
                      </div>
                      <div className="space-y-3">
                        <StepIndicator stepNumber={3} title="Canal de Comunicação" status={getStepStatus(3)} />
                        <div className="ml-11 space-y-3">
                          <p className="text-sm text-gray-600">Por qual meio vocês conversaram?</p>
                          <div className="flex gap-3">
                            <Button
                              variant={canalDeContato === "whatsapp" ? "default" : "outline"}
                              size="lg"
                              onClick={() => setCanalDeContato("whatsapp")}
                              className="flex items-center gap-2 px-6"
                            >
                              <MessageCircle className="h-4 w-4" />
                              WhatsApp
                            </Button>
                            <Button
                              variant={canalDeContato === "telefone" ? "default" : "outline"}
                              size="lg"
                              onClick={() => setCanalDeContato("telefone")}
                              className="flex items-center gap-2 px-6"
                            >
                              <Phone className="h-4 w-4" />
                              Ligação
                            </Button>
                          </div>
                          {respondido && !canalDeContato && (
                            <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-lg">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm">Selecione como vocês conversaram para continuar</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 4: Cliente Recuperado */}
                  {contatoFeito && respondido && canalDeContato && (
                    <>
                      <div className="flex items-center">
                        <ArrowRight className="h-4 w-4 text-blue-500 mx-4" />
                      </div>
                      <div className="space-y-3">
                        <StepIndicator stepNumber={4} title="Resultado Final" status={getStepStatus(4)} />
                        <div className="ml-11 space-y-4">
                          <p className="text-sm text-gray-600">Conseguiu recuperar o cliente?</p>
                          <div className="flex gap-3">
                            <Button
                              variant={recuperado ? "default" : "outline"}
                              size="lg"
                              onClick={() => setRecuperado(true)}
                              className="flex items-center gap-2 px-6"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Sim, recuperei!
                            </Button>
                            <Button
                              variant={!recuperado ? "destructive" : "outline"}
                              size="lg"
                              onClick={() => setRecuperado(false)}
                              className="flex items-center gap-2 px-6"
                            >
                              <XCircle className="h-4 w-4" />
                              Não, não consegui
                            </Button>
                          </div>

                          {/* Resumo do Atendimento - RECUPERADO */}
                          {recuperado && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <h4 className="text-sm font-semibold text-green-800">Parabéns! Cliente recuperado com sucesso</h4>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-green-700">
                                  Selecione o tipo de recuperação:
                                </label>
                                <Select value={tipoDeRecuperacao} onValueChange={setTipoDeRecuperacao}>
                                  <SelectTrigger className="w-full bg-white border-green-300">
                                    <SelectValue placeholder="Escolha o resultado do atendimento" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {assuntoSim.map((item) => (
                                      <SelectItem value={item.id}>
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          {item.status}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-green-700">
                                    Observações adicionais:
                                  </label>
                                  <textarea
                                    value={descricaoAtendente}
                                    onChange={(e) => setDescricaoAtendente(e.target.value)}
                                    className="w-full min-h-[100px] p-3 bg-white border border-green-300 rounded-md 
                                  text-sm text-gray-900 placeholder-green-400
                                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                                  hover:border-green-400 transition-colors duration-200
                                  resize-none shadow-sm"
                                    placeholder="Descreva detalhes sobre a tentativa de recuperação..."
                                    rows={4}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Resumo do Atendimento - NÃO RECUPERADO */}
                          {!recuperado && contatoFeito && respondido && canalDeContato && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-red-600" />
                                <h4 className="text-sm font-semibold text-red-800">Cliente não foi recuperado</h4>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-red-700">
                                  Selecione o motivo da não recuperação:
                                </label>
                                <Select value={tipoDeRecuperacao} onValueChange={setTipoDeRecuperacao}>
                                  <SelectTrigger className="w-full bg-white border-red-300">
                                    <SelectValue placeholder="Escolha o motivo da não recuperação" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {assuntoNao.map((item) => (
                                      <SelectItem value={item.id} key={item.id}>
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                          {item.status}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Textarea estilizado */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-red-700">
                                  Observações adicionais:
                                </label>
                                <textarea
                                  value={descricaoAtendente}
                                  onChange={(e) => setDescricaoAtendente(e.target.value)}
                                  className="w-full min-h-[100px] p-3 bg-white border border-red-300 rounded-md 
                                  text-sm text-gray-900 placeholder-red-400
                                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
                                  hover:border-red-400 transition-colors duration-200
                                  resize-none shadow-sm"
                                  placeholder="Descreva detalhes sobre a tentativa de recuperação..."
                                  rows={4}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status Summary */}
            <Card className="border-2 border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
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
                        {tipoDeRecuperacao === "venda-nova-instalacao" && "🏠 Nova Instalação"}
                        {tipoDeRecuperacao === "venda-migracao" && "🔄 Migração de Provedor"}
                        {tipoDeRecuperacao === "reagendamento" && "📅 Reagendamento"}
                        {tipoDeRecuperacao === "reativacao" && "🔄 Reativação"}
                        {tipoDeRecuperacao === "upgrade" && "⬆️ Upgrade de Plano"}
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
                disabled={respondido && !canalDeContato}
                className="px-8 py-3 text-lg"
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

        {/* Tabela de clientes aceitos */}
        <TableClientsAcepted acceptedClients={acceptedClients} setSelectedClient={setSelectedClient} />
      </div>
    </div>
  )
}