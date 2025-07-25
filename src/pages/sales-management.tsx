import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Mail, Building, MessageCircle, Check, X, Users, ArrowLeft, CheckCircle, XCircle, Edit, Save, ArrowRight, AlertCircle, User, PhoneOff, AlertTriangle } from "lucide-react"
import { usePlanilha } from "@/api/planilha"
import type { ContratoCancelado, StepIndicatorProps } from "@/types/client"

const sellers = ["João Vendedor", "Maria Vendedora", "Carlos Vendedor", "Ana Vendedora"]

export function SalesManagement() {
  const [selectedClient, setSelectedClient] = useState<ContratoCancelado | null>()
  const [contactMade, setContactMade] = useState(false)
  const [answered, setAnswered] = useState(false)
  const [recovered, setRecovered] = useState(false)
  const [contactChannel, setContactChannel] = useState("")
  const [recoveryType, setRecoveryType] = useState("")
  const [shouldCloseContact, setShouldCloseContact] = useState(false)

  const { data: cancelamentos } = usePlanilha({ aba: "Sheet1" })

  const [clients, setClients] = useState<ContratoCancelado[]>()

  useEffect(() => {
    setClients(cancelamentos)
  }, [cancelamentos])


  const nextClient = clients
    ?.filter(client =>
      client.status === "available" ||
      (client.status === "assigned" && client.assignedTo === sellers[0] && !client.contactMade)
    )
    .sort((a, b) => a.score - b.score)
  [0];

  // Clientes aceitos/atribuídos ao vendedor atual
  const acceptedClients = clients?.filter(client =>
    client.status === "assigned" && client.assignedTo === sellers[0]
  )

  const handleAcceptClient = () => {
    if (nextClient) {
      const updatedClient = {
        ...nextClient,
        contactStatus: "em_contato" as const,
        assignedTo: sellers[0],
      }
      setClients(clients?.map(client =>
        client.id_cliente === nextClient.id_cliente ? updatedClient : client
      ))
      setSelectedClient(updatedClient)
      // Reset form states
      setContactMade(false)
      setAnswered(false)
      setRecovered(false)
      setContactChannel("")
      setRecoveryType("")
      setShouldCloseContact(false)
    }
  }

  const handleSkipClient = () => {
    if (nextClient) {
      // Remove o cliente da lista temporariamente (simulando pular)
      setClients(clients?.filter(client => client.id_cliente !== nextClient.id_cliente))
    }
  }

type ContactStatus = "em_contato" | "contato_encerrado" | "nao_atendeu" | "recuperado";

const handleSaveClientContact = () => {
  if (selectedClient) {
    let newContactStatus: ContactStatus = "em_contato";

    if (recovered) {
      newContactStatus = "recuperado";
    } else if (contactMade && !answered && shouldCloseContact) {
      newContactStatus = "contato_encerrado";
    } else if (contactMade && !answered) {
      newContactStatus = "nao_atendeu";
    } else if (contactMade && answered) {
      newContactStatus = "em_contato";
    }

    const updatedClient = {
      ...selectedClient,
      status: "assigned" as const,
      contactMade,
      answered,
      recovered,
      contactChannel: answered ? contactChannel as "whatsapp" | "telefone" : undefined,
      contactStatus: newContactStatus
    };

    setClients(clients?.map(client =>
      client.id_cliente === selectedClient.id_cliente ? updatedClient : client
    ));

    setSelectedClient(null);
  }
};


  const handleBackToDashboard = () => {
    setSelectedClient(null)
  }

  const getStatusBadge = (client: ContratoCancelado) => {
    if (client.recovered) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Recuperado</Badge>
    }
    if (client.contactStatus === "em_contato") {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Em Contato</Badge>
    }
    if (client.contactStatus === "nao_atendeu") {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Não Atendeu</Badge>
    }
    if (client.contactStatus === "contato_encerrado") {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Contato Encerrado</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Pendente</Badge>
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 font-semibold"
    if (score >= 6) return "text-yellow-600 font-semibold"
    return "text-red-600 font-semibold"
  }

  const getStepStatus = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return contactMade ? 'completed' : 'current';
      case 2:
        return !contactMade ? 'disabled' : answered ? 'completed' : 'current';
      case 3:
        return !answered ? 'disabled' : contactChannel ? 'completed' : 'current';
      case 4:
        return !answered ? 'disabled' : recovered ? 'completed' : 'current';
      default:
        return 'disabled';
    }
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


  // Se um cliente está selecionado, mostra a tela de detalhes
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
                          variant={contactMade ? "default" : "outline"}
                          size="lg"
                          onClick={() => {
                            setContactMade(true);
                            if (!contactMade) {
                              setAnswered(false);
                              setContactChannel("");
                              setRecovered(false);
                              setRecoveryType("");
                              setShouldCloseContact(false);
                            }
                          }}
                          className="flex items-center gap-2 px-6"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Sim, fiz contato
                        </Button>
                        <Button
                          variant={!contactMade ? "destructive" : "outline"}
                          size="lg"
                          onClick={() => {
                            setContactMade(false);
                            setAnswered(false);
                            setContactChannel("");
                            setRecovered(false);
                            setRecoveryType("");
                            setShouldCloseContact(false);
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
                  {contactMade && (
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
                              variant={answered ? "default" : "outline"}
                              size="lg"
                              onClick={() => {
                                setAnswered(true);
                                setShouldCloseContact(false);
                                if (!answered) {
                                  setContactChannel("");
                                  setRecovered(false);
                                  setRecoveryType("");
                                }
                              }}
                              className="flex items-center gap-2 px-6"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Sim, me atendeu
                            </Button>
                            <Button
                              variant={!answered ? "destructive" : "outline"}
                              size="lg"
                              onClick={() => {
                                setAnswered(false);
                                setContactChannel("");
                                setRecovered(false);
                              }}
                              className="flex items-center gap-2 px-6"
                            >
                              <XCircle className="h-4 w-4" />
                              Não atendeu
                            </Button>
                          </div>

                          {/* Opção de encerrar contato quando cliente não atender */}
                          {contactMade && !answered && (
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
                                  variant={shouldCloseContact ? "destructive" : "outline"}
                                  size="sm"
                                  onClick={() => setShouldCloseContact(true)}
                                  className="flex items-center gap-2"
                                >
                                  <PhoneOff className="h-4 w-4" />
                                  Encerrar Contato
                                </Button>
                                <Button
                                  variant={!shouldCloseContact ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setShouldCloseContact(false)}
                                  className="flex items-center gap-2"
                                >
                                  <Phone className="h-4 w-4" />
                                  Manter para novas tentativas
                                </Button>
                              </div>
                              {shouldCloseContact && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                                  <p className="text-sm text-red-700 font-medium">
                                    ⚠️ O contato será encerrado e este cliente não aparecerá mais na sua lista.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 3: Canal de Atendimento */}
                  {contactMade && answered && (
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
                              variant={contactChannel === "whatsapp" ? "default" : "outline"}
                              size="lg"
                              onClick={() => setContactChannel("whatsapp")}
                              className="flex items-center gap-2 px-6"
                            >
                              <MessageCircle className="h-4 w-4" />
                              WhatsApp
                            </Button>
                            <Button
                              variant={contactChannel === "telefone" ? "default" : "outline"}
                              size="lg"
                              onClick={() => setContactChannel("telefone")}
                              className="flex items-center gap-2 px-6"
                            >
                              <Phone className="h-4 w-4" />
                              Ligação
                            </Button>
                          </div>
                          {answered && !contactChannel && (
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
                  {contactMade && answered && contactChannel && (
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
                              variant={recovered ? "default" : "outline"}
                              size="lg"
                              onClick={() => setRecovered(true)}
                              className="flex items-center gap-2 px-6"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Sim, recuperei!
                            </Button>
                            <Button
                              variant={!recovered ? "destructive" : "outline"}
                              size="lg"
                              onClick={() => setRecovered(false)}
                              className="flex items-center gap-2 px-6"
                            >
                              <XCircle className="h-4 w-4" />
                              Não, não consegui
                            </Button>
                          </div>

                          {/* Resumo do Atendimento - RECUPERADO */}
                          {recovered && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <h4 className="text-sm font-semibold text-green-800">Parabéns! Cliente recuperado com sucesso</h4>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-green-700">
                                  Selecione o tipo de recuperação:
                                </label>
                                <Select value={recoveryType} onValueChange={setRecoveryType}>
                                  <SelectTrigger className="w-full bg-white border-green-300">
                                    <SelectValue placeholder="Escolha o resultado do atendimento" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="venda-nova-instalacao">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        Venda Concluída - Nova Instalação
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="venda-migracao">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        Venda Concluída - Migração de Provedor
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="reagendamento">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        Reagendamento de Visita Técnica
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="reativacao">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        Reativação de Contrato Cancelado
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="upgrade">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                        Upgrade de Plano Existente
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}

                          {/* Resumo do Atendimento - NÃO RECUPERADO */}
                          {!recovered && contactMade && answered && contactChannel && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-red-600" />
                                <h4 className="text-sm font-semibold text-red-800">Cliente não foi recuperado</h4>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-red-700">
                                  Selecione o motivo da não recuperação:
                                </label>
                                <Select value={recoveryType} onValueChange={setRecoveryType}>
                                  <SelectTrigger className="w-full bg-white border-red-300">
                                    <SelectValue placeholder="Escolha o motivo da não recuperação" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="preco-alto">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        Preço considerado alto
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="satisfeito-atual">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        Satisfeito com provedor atual
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="problemas-tecnicos">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        Receio de problemas técnicos
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="nao-interesse">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                        Não tem interesse no momento
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="mudanca-endereco">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        Mudança de endereço
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="questoes-financeiras">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        Questões financeiras
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="experiencia-ruim">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                        Experiência ruim anterior
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="outros">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                        Outros motivos
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
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
                    <span className={contactMade ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {contactMade ? "✓ Sim" : "✗ Não"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cliente atendeu:</span>
                    <span className={answered ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {contactMade ? (answered ? "✓ Sim" : "✗ Não") : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Canal usado:</span>
                    <span className="font-medium">
                      {contactChannel ? (contactChannel === "whatsapp" ? "📱 WhatsApp" : "📞 Telefone") : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cliente recuperado:</span>
                    <span className={recovered ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {answered ? (recovered ? "✓ Sim" : "✗ Não") : "—"}
                    </span>
                  </div>
                  {contactMade && !answered && (
                    <div className="flex justify-between col-span-2 pt-2 border-t">
                      <span className="text-gray-600">Ação escolhida:</span>
                      <span className={shouldCloseContact ? "text-red-600 font-medium" : "text-blue-600 font-medium"}>
                        {shouldCloseContact ? "🚫 Encerrar Contato" : "🔄 Manter para novas tentativas"}
                      </span>
                    </div>
                  )}
                  {recovered && recoveryType && (
                    <div className="flex justify-between col-span-2 pt-2 border-t">
                      <span className="text-gray-600">Tipo de recuperação:</span>
                      <span className="font-medium text-green-600">
                        {recoveryType === "venda-nova-instalacao" && "🏠 Nova Instalação"}
                        {recoveryType === "venda-migracao" && "🔄 Migração de Provedor"}
                        {recoveryType === "reagendamento" && "📅 Reagendamento"}
                        {recoveryType === "reativacao" && "🔄 Reativação"}
                        {recoveryType === "upgrade" && "⬆️ Upgrade de Plano"}
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
                disabled={answered && !contactChannel}
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
                      <p className={`max-w-md get text-sm mt-1 px-3 py-2 text-white rounded-lg shadow-md font-semibold animate-fade-in`}>
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
        <Card>
          <CardHeader>
            <CardTitle>Meus Clientes Aceitos</CardTitle>
            <CardDescription>
              {acceptedClients?.length} clientes atribuídos a você
            </CardDescription>
          </CardHeader>
          <CardContent>
            {acceptedClients && acceptedClients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Cliente</th>
                      <th className="text-left p-3 font-medium">Meses base</th>
                      <th className="text-left p-3 font-medium">Contato</th>
                      <th className="text-left p-3 font-medium">Score</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Canal</th>
                      <th className="text-left p-3 font-medium">Editar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acceptedClients?.map((client) => (
                      <tr key={client.id_cliente} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{client.nome}</div>
                            <div className="text-sm text-gray-500">{client.email}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            <div className="text-gray-500">{client.meses_base} meses na base</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{client.telefone}</div>
                        </td>
                        <td className="p-3">
                          <span className={getScoreColor(client.score)}>
                            {client.score}
                          </span>
                        </td>
                        <td className="p-3">
                          {getStatusBadge(client)}
                        </td>
                        <td className="p-3">
                          {client.contactMade && (
                            <div title={client.contactChannel} className="flex items-center gap-1 text-sm">
                              {client.contactChannel === "whatsapp" ? (
                                <MessageCircle className="h-5 w-5" />
                              ) : (
                                <Phone className="h-5 w-5" />
                              )}
                              <span className="capitalize">{client.contactChannel}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <button
                            title={client.recovered ? "Cliente já recuperado" : "Editar contato"}
                            disabled={client.recovered}
                            className="disabled:cursor-not-allowed disabled:opacity-50 hover:text-blue-600"
                            onClick={() => setSelectedClient(client)}
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Você ainda não aceitou nenhum cliente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}