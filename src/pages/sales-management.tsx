
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Mail, Building, MessageCircle, Check, X, Users, ArrowLeft, CheckCircle, XCircle, Edit } from "lucide-react"
import { usePlanilha } from "@/api/planilha"
import type { ContratoCancelado } from "@/types/client"



const sellers = ["João Vendedor", "Maria Vendedora", "Carlos Vendedor", "Ana Vendedora"]

export default function SellerDashboard() {

  const [currentSeller, setCurrentSeller] = useState<string>(sellers[0])
  const [selectedClient, setSelectedClient] = useState<ContratoCancelado | null>(null)
  const [contactMade, setContactMade] = useState<boolean>(false)
  const [answered, setAnswered] = useState<boolean>(false)
  const [recovered, setRecovered] = useState<boolean>(false)
  const [contactChannel, setContactChannel] = useState<"whatsapp" | "telefone" | "">("")

  const { data: cancelamentos } = usePlanilha({ aba: "Sheet1" })
  const [clients, setClients] = useState<ContratoCancelado[]>()

  useEffect(() => {
    if (cancelamentos) {
      setClients(cancelamentos)
    }
  }, [cancelamentos])

  console.log(contactChannel)

  const nextClient = clients
    ?.filter(client =>
      client.status === "available" ||
      (client.status === "assigned" && client.assignedTo === currentSeller && !client.contactMade)
    )
    .sort((a, b) => b.score - a.score)
  [0];

  // Clientes aceitos/atribuídos ao vendedor atual
  const acceptedClients = clients?.filter(client =>
    client.status === "assigned" && client.assignedTo === currentSeller
  )

  const handleAcceptClient = () => {
    if (nextClient) {
      const updatedClient = {
        ...nextClient,
        contactStatus: "em_contato" as const,
        assignedTo: currentSeller,
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
    }
  }

  const handleSkipClient = () => {
    if (nextClient) {
      // Remove o cliente da lista temporariamente (simulando pular)
      setClients(clients?.filter(client => client.id_cliente !== nextClient.id_cliente))
    }
  }

  const handleSaveClientContact = () => {
    if (selectedClient) {
      let newContactStatus: "em_contato" | "contato_encerrado" | "nao_atendeu" | "recuperado" = "em_contato"

      if (recovered) {
        newContactStatus = "recuperado"
      } else if (contactMade && !answered) {
        newContactStatus = "nao_atendeu"
      } else if (contactMade && answered) {
        newContactStatus = "em_contato"
      }

      const updatedClient = {
        ...selectedClient,
        status: "assigned" as const,
        contactMade,
        answered,
        recovered,
        contactChannel: answered ? contactChannel as "whatsapp" | "telefone" : "undefined",
        contactStatus: newContactStatus
      }

      setClients(clients?.map(client =>
        client.id_cliente === selectedClient.id_cliente ? updatedClient : client
      ))

      setSelectedClient(null)
    }
  }

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

  // Se um cliente está selecionado, mostra a tela de detalhes
  if (selectedClient) {
    return (
      <div className="min-h-screen w-full bg-gray-50">
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

          {/* Card de status do contato */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Status do Contato</CardTitle>
              <CardDescription>
                Marque as opções conforme o progresso do contato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Contato Realizado */}
                <div className="flex items-center space-x-3">
                  <Button
                    variant={contactMade ? "default" : "outline"}
                    size="sm"
                    onClick={() => setContactMade(!contactMade)}
                    className="flex items-center gap-2"
                  >
                    {contactMade ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    Contato Realizado?
                  </Button>
                  <span className="text-sm text-gray-600">
                    {contactMade ? "Sim, contato foi realizado" : "Não, ainda não foi feito contato"}
                  </span>
                </div>

                {/* Atendeu - só aparece se contato foi realizado */}
                {contactMade && (
                  <div className="flex items-center space-x-3">
                    <Button
                      variant={answered ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAnswered(!answered)}
                      className="flex items-center gap-2"
                    >
                      {answered ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      Atendeu?
                    </Button>
                    <span className="text-sm text-gray-600">
                      {answered ? "Sim, cliente atendeu" : "Não, cliente não atendeu"}
                    </span>
                  </div>
                )}

                {/* Canal de Atendimento - só aparece se atendeu */}
                {contactMade && answered && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Canal de Atendimento:</label>
                    <Select value={contactChannel} onValueChange={(value: "whatsapp" | "telefone") => setContactChannel(value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Selecione o canal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </div>
                        </SelectItem>
                        <SelectItem value="telefone">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Telefone
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Recuperado - só aparece se atendeu */}
                {contactMade && answered && (
                  <div className="flex items-center space-x-3">
                    <Button
                      variant={recovered ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRecovered(!recovered)}
                      className="flex items-center gap-2"
                    >
                      {recovered ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      Recuperado?
                    </Button>
                    <span className="text-sm text-gray-600">
                      {recovered ? "Sim, cliente foi recuperado" : "Não, cliente ainda não foi recuperado"}
                    </span>
                  </div>
                )}

                {/* Botão salvar */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={handleSaveClientContact}
                    className="flex items-center gap-2"
                    disabled={answered && !contactChannel}
                  >
                    <Check className="h-4 w-4" />
                    Salvar Status do Contato
                  </Button>
                  {answered && !contactChannel && (
                    <p className="text-sm text-red-600 mt-2">
                      Por favor, selecione o canal de atendimento.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  console.log(acceptedClients)
  // Tela principal do dashboard
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

                    <div>
                      <span className="text-sm font-medium text-gray-700">Motivo do Cancelamento:</span>
                      <p className="text-sm text-gray-600 mt-1">{nextClient.motivo_cancelamento}</p>
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

        {/* Tabela de Clientes Aceitos */}
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
                            <div className="flex items-center gap-1 text-sm">
                              {client.contactChannel === "whatsapp" ? (
                                <MessageCircle className="h-3 w-3" />
                              ) : (
                                <Phone className="h-3 w-3" />
                              )}
                              <span className="capitalize">{client.contactMade}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <button>
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