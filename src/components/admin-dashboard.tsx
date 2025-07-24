"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, Users, Phone, CheckCircle, TrendingUp, BarChart3, FileText, UserCheck } from "lucide-react"
import type { Client, SalesReport, SellerStats } from "../types/client"

interface AdminDashboardProps {
  clients: Client[]
  onUploadClients: (clients: Client[]) => void
}

export function AdminDashboard({ clients, onUploadClients }: AdminDashboardProps) {
  const [uploadData, setUploadData] = useState("")
  const [uploadFormat, setUploadFormat] = useState<"csv" | "json">("json")

  const generateReport = (): SalesReport => {
    const totalClients = clients.length
    const totalContacted = clients.filter((c) => c.contactMade).length
    const totalAnswered = clients.filter((c) => c.answered).length
    const totalRecovered = clients.filter((c) => c.recovered).length

    return {
      totalClients,
      totalContacted,
      totalAnswered,
      totalRecovered,
      conversionRate: totalClients > 0 ? (totalRecovered / totalClients) * 100 : 0,
      answerRate: totalContacted > 0 ? (totalAnswered / totalContacted) * 100 : 0,
      recoveryRate: totalAnswered > 0 ? (totalRecovered / totalAnswered) * 100 : 0,
    }
  }

  const getSellerStats = (): SellerStats[] => {
    const sellers = [...new Set(clients.filter((c) => c.assignedTo).map((c) => c.assignedTo!))]

    return sellers.map((seller) => {
      const sellerClients = clients.filter((c) => c.assignedTo === seller)
      return {
        sellerName: seller,
        assigned: sellerClients.length,
        contacted: sellerClients.filter((c) => c.contactMade).length,
        answered: sellerClients.filter((c) => c.answered).length,
        recovered: sellerClients.filter((c) => c.recovered).length,
      }
    })
  }

  const handleUpload = () => {
    try {
      let newClients: Client[] = []

      if (uploadFormat === "json") {
        const jsonData = JSON.parse(uploadData)
        newClients = Array.isArray(jsonData) ? jsonData : [jsonData]
      } else {
        // Simular parse de CSV
        const lines = uploadData.trim().split("\n")
        const headers = lines[0].split(",")
        newClients = lines.slice(1).map((line, index) => {
          const values = line.split(",")
          return {
            id: clients.length + index + 1,
            name: values[0] || "",
            email: values[1] || "",
            phone: values[2] || "",
            company: values[3] || "",
            cancelReason: values[4] || "",
            monthsInBase: Number.parseInt(values[5]) || 0,
            internalScore: Number.parseInt(values[6]) || 0,
            status: "available" as const,
            contactMade: false,
            answered: false,
            recovered: false,
          }
        })
      }

      onUploadClients(newClients)
      setUploadData("")
      alert(`${newClients.length} clientes importados com sucesso!`)
    } catch (error) {
      alert("Erro ao processar os dados. Verifique o formato.")
    }
  }

  const report = generateReport()
  const sellerStats = getSellerStats()

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Dashboard Administrativo
          </CardTitle>
          <CardDescription>Controle geral de clientes e performance dos vendedores</CardDescription>
        </CardHeader>
      </Card>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{report.totalClients}</p>
                <p className="text-xs text-muted-foreground">Total de Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{report.totalContacted}</p>
                <p className="text-xs text-muted-foreground">Contatos Realizados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{report.totalAnswered}</p>
                <p className="text-xs text-muted-foreground">Atenderam</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{report.totalRecovered}</p>
                <p className="text-xs text-muted-foreground">Recuperados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Taxas de Conversão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Taxas de Conversão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{report.answerRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Taxa de Atendimento</p>
              <p className="text-xs text-muted-foreground">
                {report.totalAnswered} de {report.totalContacted} contatos
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{report.recoveryRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Taxa de Recuperação</p>
              <p className="text-xs text-muted-foreground">
                {report.totalRecovered} de {report.totalAnswered} atendimentos
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{report.conversionRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Conversão Geral</p>
              <p className="text-xs text-muted-foreground">
                {report.totalRecovered} de {report.totalClients} clientes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload de Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload de Clientes
            </CardTitle>
            <CardDescription>Importe clientes via JSON ou CSV</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={uploadFormat === "json" ? "default" : "outline"}
                size="sm"
                onClick={() => setUploadFormat("json")}
              >
                JSON
              </Button>
              <Button
                variant={uploadFormat === "csv" ? "default" : "outline"}
                size="sm"
                onClick={() => setUploadFormat("csv")}
              >
                CSV
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-data">Dados ({uploadFormat.toUpperCase()})</Label>
              <Textarea
                id="upload-data"
                placeholder={
                  uploadFormat === "json"
                    ? `[{"name": "João Silva", "email": "joao@email.com", "phone": "(11) 99999-9999", "company": "Empresa X", "cancelReason": "Preço alto", "monthsInBase": 12, "internalScore": 8}]`
                    : `name,email,phone,company,cancelReason,monthsInBase,internalScore\nJoão Silva,joao@email.com,(11) 99999-9999,Empresa X,Preço alto,12,8`
                }
                value={uploadData}
                onChange={(e) => setUploadData(e.target.value)}
                rows={8}
              />
            </div>

            <Button onClick={handleUpload} className="w-full gap-2">
              <Upload className="h-4 w-4" />
              Importar Clientes
            </Button>
          </CardContent>
        </Card>

        {/* Performance por Vendedor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Performance por Vendedor
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sellerStats.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-center">Atribuídos</TableHead>
                    <TableHead className="text-center">Contatados</TableHead>
                    <TableHead className="text-center">Atenderam</TableHead>
                    <TableHead className="text-center">Recuperados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellerStats.map((seller) => (
                    <TableRow key={seller.sellerName}>
                      <TableCell className="font-medium">{seller.sellerName}</TableCell>
                      <TableCell className="text-center">{seller.assigned}</TableCell>
                      <TableCell className="text-center">{seller.contacted}</TableCell>
                      <TableCell className="text-center">{seller.answered}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={seller.recovered > 0 ? "default" : "secondary"}>{seller.recovered}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-4">Nenhum vendedor com clientes atribuídos ainda.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista de Todos os Clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Todos os Clientes
          </CardTitle>
          <CardDescription>Visualização completa da base de clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{client.company}</TableCell>
                    <TableCell>
                      <Badge variant={client.internalScore >= 7 ? "default" : "secondary"}>
                        {client.internalScore}/10
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          client.status === "available"
                            ? "outline"
                            : client.status === "assigned"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {client.status === "available"
                          ? "Disponível"
                          : client.status === "assigned"
                            ? "Atribuído"
                            : client.status === "contacted"
                              ? "Contatado"
                              : "Finalizado"}
                      </Badge>
                    </TableCell>
                    <TableCell>{client.assignedTo || "-"}</TableCell>
                    <TableCell>
                      {client.contactMade ? <Badge variant="default">Sim</Badge> : <Badge variant="outline">Não</Badge>}
                    </TableCell>
                    <TableCell>
                      {client.recovered ? (
                        <Badge className="bg-green-100 text-green-800">Recuperado</Badge>
                      ) : client.answered ? (
                        <Badge className="bg-yellow-100 text-yellow-800">Atendeu</Badge>
                      ) : client.contactMade ? (
                        <Badge className="bg-red-100 text-red-800">Não Atendeu</Badge>
                      ) : (
                        <Badge variant="outline">-</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
