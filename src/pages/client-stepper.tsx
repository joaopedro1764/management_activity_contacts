"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  Users,
  UserPlus,
  Eye,
  Edit,
  Check,
  Phone,
  Mail,
  MapPin,
  Building,
} from "lucide-react"
import { usePlanilha } from "@/api/planilha"

interface Client {
  id: number
  name: string
  email: string
  phone: string
  company: string
  address: string
  status: "active" | "inactive" | "pending"
  avatar?: string
}

const mockClients: Client[] = [
  {
    id: 1,
    name: "Ana Silva",
    email: "ana.silva@email.com",
    phone: "(11) 99999-1234",
    company: "Tech Solutions",
    address: "São Paulo, SP",
    status: "active",
  },
  {
    id: 2,
    name: "Carlos Santos",
    email: "carlos.santos@email.com",
    phone: "(21) 88888-5678",
    company: "Digital Corp",
    address: "Rio de Janeiro, RJ",
    status: "pending",
  },
  {
    id: 3,
    name: "Maria Oliveira",
    email: "maria.oliveira@email.com",
    phone: "(31) 77777-9012",
    company: "Innovation Ltd",
    address: "Belo Horizonte, MG",
    status: "active",
  },
  {
    id: 4,
    name: "João Costa",
    email: "joao.costa@email.com",
    phone: "(47) 66666-3456",
    company: "StartUp Inc",
    address: "Florianópolis, SC",
    status: "inactive",
  },
]

export default function Component() {

  const [currentStep, setCurrentStep] = useState(1)
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState<Partial<Client>>({})



  const steps = [
    { id: 1, title: "Lista de Clientes", icon: Users },
    { id: 2, title: "Adicionar Cliente", icon: UserPlus },
    { id: 3, title: "Visualizar Detalhes", icon: Eye },
    { id: 4, title: "Editar Cliente", icon: Edit },
    { id: 5, title: "Confirmação", icon: Check },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo"
      case "pending":
        return "Pendente"
      case "inactive":
        return "Inativo"
      default:
        return status
    }
  }

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
    setFormData(client)
    setCurrentStep(3)
  }

  const handleAddClient = () => {
    setFormData({})
    setSelectedClient(null)
    setCurrentStep(2)
  }

  const handleEditClient = () => {
    if (selectedClient) {
      setFormData(selectedClient)
      setCurrentStep(4)
    }
  }

  const handleSaveClient = () => {
    if (formData.name && formData.email) {
      if (selectedClient) {
        // Editar cliente existente
        setClients(
          clients.map((client) => (client.id === selectedClient.id ? ({ ...client, ...formData } as Client) : client)),
        )
      } else {
        // Adicionar novo cliente
        const newClient: Client = {
          id: Math.max(...clients.map((c) => c.id)) + 1,
          name: formData.name || "",
          email: formData.email || "",
          phone: formData.phone || "",
          company: formData.company || "",
          address: formData.address || "",
          status: (formData.status as Client["status"]) || "pending",
        }
        setClients([...clients, newClient])
      }
      setCurrentStep(5)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Lista de Clientes</h3>
              <Button onClick={handleAddClient} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Adicionar Cliente
              </Button>
            </div>
            <div className="grid gap-4">
              {clients.map((client) => (
                <Card key={client.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={client.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {client.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{client.name}</h4>
                          <p className="text-sm text-muted-foreground">{client.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(client.status)}>{getStatusText(client.status)}</Badge>
                        <Button variant="outline" size="sm" onClick={() => handleClientSelect(client)}>
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Adicionar Novo Cliente</h3>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Digite o nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    value={formData.company || ""}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Nome da empresa"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Textarea
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Endereço completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || "pending"}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Client["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 3:
        return selectedClient ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Detalhes do Cliente</h3>
              <Button onClick={handleEditClient} variant="outline" className="gap-2 bg-transparent">
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedClient.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {selectedClient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-xl font-semibold">{selectedClient.name}</h4>
                    <Badge className={getStatusColor(selectedClient.status)}>
                      {getStatusText(selectedClient.status)}
                    </Badge>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="grid gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClient.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClient.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClient.company}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClient.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Editar Cliente</h3>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome Completo</Label>
                  <Input
                    id="edit-name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Telefone</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Empresa</Label>
                  <Input
                    id="edit-company"
                    value={formData.company || ""}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Endereço</Label>
                <Textarea
                  id="edit-address"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status || "pending"}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Client["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold">Operação Concluída!</h3>
            <p className="text-muted-foreground">
              {selectedClient ? "Cliente editado" : "Cliente adicionado"} com sucesso.
            </p>
            <Button onClick={() => setCurrentStep(1)} className="mt-4">
              Voltar à Lista
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
          <CardTitle>Gerenciamento de Clientes</CardTitle>
          <CardDescription>Gerencie seus clientes através de um processo step-by-step</CardDescription>
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
        </CardContent>
      </Card>

      {/* Conteúdo do Step Atual */}
      <Card>
        <CardContent className="p-6">{renderStepContent()}</CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={currentStep === 1}
          className="gap-2 bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {(currentStep === 2 || currentStep === 4) && (
            <Button onClick={handleSaveClient} className="gap-2">
              <Check className="h-4 w-4" />
              Salvar
            </Button>
          )}

          {currentStep < steps.length && currentStep !== 2 && currentStep !== 4 && currentStep !== 5 && (
            <Button onClick={handleNextStep} className="gap-2">
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
