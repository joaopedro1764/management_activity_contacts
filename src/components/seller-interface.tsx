"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  Building,
  Calendar,
  Star,
  AlertCircle,
  Check,
  X,
  MessageSquare,
} from "lucide-react"
import type { Client } from "../types/client"

interface SellerInterfaceProps {
  clients: Client[]
  currentSeller: string
  onUpdateClient: (client: Client) => void
}

export function SellerInterface({ clients, currentSeller, onUpdateClient }: SellerInterfaceProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [currentClientIndex, setCurrentClientIndex] = useState(0)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [contactData, setContactData] = useState({
    contactMade: false,
    answered: false,
    recovered: false,
    contactChannel: "",
    notes: "",
    contactStatus: "em_contato",
  })

  const availableClients = clients.filter((client) => client.status === "available")
  const myClients = clients.filter((client) => client.assignedTo === currentSeller)

  const steps = [
    { id: 1, title: "Selecionar Cliente", icon: User },
    { id: 2, title: "Informações de Contato", icon: Phone },
    { id: 3, title: "Registrar Resultado", icon: Check },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-800"
    if (score >= 6) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Alto"
    if (score >= 6) return "Médio"
    return "Baixo"
  }

  const handleAcceptClient = () => {
    if (availableClients[currentClientIndex]) {
      const client = availableClients[currentClientIndex]
      const updatedClient = {
        ...client,
        status: "assigned" as const,
        assignedTo: currentSeller,
        assignedAt: new Date(),
      }
      setSelectedClient(updatedClient)
      onUpdateClient(updatedClient)
      setCurrentStep(2)
    }
  }

  const handleRejectClient = () => {
    if (currentClientIndex < availableClients.length - 1) {
      setCurrentClientIndex(currentClientIndex + 1)
    } else {
      setCurrentClientIndex(0)
    }
  }

  const handleSaveContact = () => {
    if (selectedClient) {
      const updatedClient = {
        ...selectedClient,
        status: "contacted" as const,
        contactMade: contactData.contactMade,
        answered: contactData.answered,
        recovered: contactData.recovered,
        contactChannel: contactData.contactChannel as "whatsapp" | "telefone",
        contactStatus: contactData.contactStatus as Client["contactStatus"],
        contactedAt: new Date(),
        notes: contactData.notes,
      }
      onUpdateClient(updatedClient)
      setCurrentStep(3)
    }
  }

  const handleFinish = () => {
    setCurrentStep(1)
    setSelectedClient(null)
    setContactData({
      contactMade: false,
      answered: false,
      recovered: false,
      contactChannel: "",
      notes: "",
      contactStatus: "em_contato",
    })
    setCurrentClientIndex(0)
  }


   
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        if (availableClients.length === 0) {
          return (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum cliente disponível</h3>
              <p className="text-muted-foreground">Todos os clientes já foram atribuídos ou não há clientes na base.</p>
            </div>
          )
        }

        const client = availableClients[currentClientIndex]
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Cliente Disponível</h3>
              <p className="text-muted-foreground">
                Cliente {currentClientIndex + 1} de {availableClients.length}
              </p>
            </div>

            <Card className="border-2">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <User className="h-5 w-5" />
                  {client.name}
                </CardTitle>
                <CardDescription>{client.company}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Motivo do Cancelamento:</span>
                    </div>
                    <p className="text-sm bg-red-50 p-2 rounded">{client.cancelReason}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Tempo na Base:</span>
                    </div>
                    <p className="text-sm bg-blue-50 p-2 rounded">{client.monthsInBase} meses</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Score Interno:</span>
                  </div>
                  <Badge className={getScoreColor(client.internalScore)}>
                    {client.internalScore}/10 - {getScoreLabel(client.internalScore)}
                  </Badge>
                </div>

                <Separator />

                <div className="flex justify-center gap-4">
                  <Button onClick={handleAcceptClient} className="gap-2">
                    <Check className="h-4 w-4" />
                    Aceitar Cliente
                  </Button>
                  <Button onClick={handleRejectClient} variant="outline" className="gap-2 bg-transparent">
                    <X className="h-4 w-4" />
                    Próximo Cliente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 2:
        if (!selectedClient) return null
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center">Informações de Contato</h3>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {selectedClient.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedClient.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedClient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedClient.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <Badge className={getScoreColor(selectedClient.internalScore)}>
                      Score: {selectedClient.internalScore}/10
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Status do Contato</h4>
                  <RadioGroup
                    value={contactData.contactStatus}
                    onValueChange={(value) => setContactData({ ...contactData, contactStatus: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="em_contato" id="em_contato" />
                      <Label htmlFor="em_contato">Em Contato</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="contato_encerrado" id="contato_encerrado" />
                      <Label htmlFor="contato_encerrado">Contato Encerrado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao_atendeu" id="nao_atendeu" />
                      <Label htmlFor="nao_atendeu">Não Atendeu</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="recuperado" id="recuperado" />
                      <Label htmlFor="recuperado">Recuperado</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Controle de Contato</h4>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="contactMade"
                        checked={contactData.contactMade}
                        onCheckedChange={(checked) =>
                          setContactData({ ...contactData, contactMade: checked as boolean })
                        }
                      />
                      <Label htmlFor="contactMade">Contato Realizado?</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="answered"
                        checked={contactData.answered}
                        onCheckedChange={(checked) => setContactData({ ...contactData, answered: checked as boolean })}
                      />
                      <Label htmlFor="answered">Atendeu?</Label>
                    </div>

                    {contactData.answered && (
                      <div className="ml-6 space-y-2">
                        <Label>Canal de Atendimento:</Label>
                        <RadioGroup
                          value={contactData.contactChannel}
                          onValueChange={(value) => setContactData({ ...contactData, contactChannel: value })}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="whatsapp" id="whatsapp" />
                            <Label htmlFor="whatsapp" className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              WhatsApp
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="telefone" id="telefone" />
                            <Label htmlFor="telefone" className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Telefone
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recovered"
                        checked={contactData.recovered}
                        onCheckedChange={(checked) => setContactData({ ...contactData, recovered: checked as boolean })}
                      />
                      <Label htmlFor="recovered">Recuperado?</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Adicione observações sobre o contato..."
                    value={contactData.notes}
                    onChange={(e) => setContactData({ ...contactData, notes: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">Contato Registrado!</h3>
            <p className="text-muted-foreground">As informações do contato foram salvas com sucesso.</p>

            {selectedClient && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Resumo do Contato</h4>
                  <div className="text-left space-y-2 text-sm">
                    <p>
                      <strong>Cliente:</strong> {selectedClient.name}
                    </p>
                    <p>
                      <strong>Contato Realizado:</strong> {contactData.contactMade ? "Sim" : "Não"}
                    </p>
                    <p>
                      <strong>Atendeu:</strong> {contactData.answered ? "Sim" : "Não"}
                    </p>
                    {contactData.answered && (
                      <p>
                        <strong>Canal:</strong> {contactData.contactChannel === "whatsapp" ? "WhatsApp" : "Telefone"}
                      </p>
                    )}
                    <p>
                      <strong>Recuperado:</strong> {contactData.recovered ? "Sim" : "Não"}
                    </p>
                    <p>
                      <strong>Status:</strong> {contactData.contactStatus.replace("_", " ").toUpperCase()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button onClick={handleFinish} className="mt-4">
              Próximo Cliente
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header com Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Interface do Vendedor - {currentSeller}</CardTitle>
          <CardDescription>Gerencie seus contatos com clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep === step.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : currentStep > step.id
                        ? "bg-green-100 text-green-600 border-green-300"
                        : "bg-muted text-muted-foreground border-muted-foreground"
                  }`}
                >
                  <step.icon className="h-4 w-4" />
                </div>
                <div className="ml-2 hidden sm:block">
                  <p
                    className={`text-sm font-medium ${
                      currentStep === step.id ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${currentStep > step.id ? "bg-green-300" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Stats rápidas */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{availableClients.length}</p>
                <p className="text-xs text-muted-foreground">Disponíveis</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{myClients.length}</p>
                <p className="text-xs text-muted-foreground">Meus Clientes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{myClients.filter((c) => c.recovered).length}</p>
                <p className="text-xs text-muted-foreground">Recuperados</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo do Step Atual */}
      <Card>
        <CardContent className="p-6">{renderStepContent()}</CardContent>
      </Card>

      {/* Navegação */}
      {currentStep > 1 && currentStep < 3 && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          {currentStep === 2 && (
            <Button onClick={handleSaveContact} className="gap-2">
              Salvar Contato
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
