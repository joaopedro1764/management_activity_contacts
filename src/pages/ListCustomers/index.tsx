import { useState, useMemo, useEffect } from "react"
import {
    Search,
    Filter,
    Eye,
    ArrowUpDown,
    MoreHorizontal,
    Phone,
    MessageCircle,
    User,
    Mail,
    MessageCircleMore,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ContratoCancelado } from "@/types/client"



function getScoreBadgeColor(score: number) {
    if (score >= 80) return "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
    if (score >= 60) return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
    return "bg-gradient-to-r from-red-500 to-rose-500 text-white"
}

function getStatusColor(status: string) {
    switch (status) {
        case "recuperado":
            return "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
        case "ativo":
            return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
        case "em_contato":
            return "bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
        case "pendente":
            return "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
        case "nao_recuperado":
            return "bg-gradient-to-r from-red-500 to-rose-500 text-white"
        default:
            return "bg-gray-500 text-white"
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case "recuperado":
            return "Recuperado"
        case "ativo":
            return "Ativo"
        case "em_contato":
            return "Em Contato"
        case "pendente":
            return "Pendente"
        case "nao_recuperado":
            return "Não Recuperado"
        default:
            return status
    }
}

export function ListCustomer() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("todos")
    const [sortBy, setSortBy] = useState("score")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [clientesData, setClientesData] = useState<ContratoCancelado[]>()

    useEffect(() => {
        const clientesSalvos = sessionStorage.getItem("clientesAtualizados");
        if (clientesSalvos) {
            setClientesData(JSON.parse(clientesSalvos))
        }
    }, []);

    console.log(clientesData)

    // Filtrar e ordenar dados
    const filteredAndSortedData = useMemo(() => {
        const filtered = clientesData?.filter((cliente) => {
            const matchesSearch =
                cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cliente.id_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cliente.email.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus = statusFilter === "todos" || cliente.status === statusFilter

            return matchesSearch && matchesStatus
        })

        // Ordenar
        filtered?.sort((a, b) => {
            const aValue = a[sortBy as keyof typeof a]
            const bValue = b[sortBy as keyof typeof b]

            // Coloca valores indefinidos no final da ordenação
            if (aValue === undefined) return 1
            if (bValue === undefined) return -1

            let valA = aValue
            let valB = bValue

            if (typeof valA === "string" && typeof valB === "string") {
                valA = valA.toLowerCase()
                valB = valB.toLowerCase()
            }

            if (sortOrder === "asc") {
                return valA < valB ? -1 : valA > valB ? 1 : 0
            } else {
                return valA > valB ? -1 : valA < valB ? 1 : 0
            }
        })


        return filtered
    }, [searchTerm, statusFilter, sortBy, sortOrder])

    // Calcular métricas
    const metrics = useMemo(() => {
        if (clientesData) {
            const total = clientesData.length
            const recuperados = clientesData.filter((c) => c.contactStatus === "recuperado").length
            const emContato = clientesData.filter((c) => c.contactStatus === "em_contato").length
            const scoreAlto = clientesData.filter((c) => c.score >= 80).length
            const taxaRecuperacao = total > 0 ? Math.round((recuperados / total) * 100) : 0

            return {
                total,
                recuperados,
                emContato,
                scoreAlto,
                taxaRecuperacao,
            }
        }
    }, [])

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortBy(field)
            setSortOrder("desc")
        }
    }

    const handleViewClient = (clienteId: string) => {
        console.log("Ver detalhes do cliente:", clienteId)
        // Implementar navegação para detalhes do cliente
    }

    const handleContactClient = (cliente: any) => {
        console.log("Entrar em contato com:", cliente.nome)
        // Implementar ação de contato
    }

    console.log(clientesData)

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Dashboard do Vendedor
                        </h1>
                        <p className="text-slate-600 mt-1">Gerencie seus clientes e acompanhe suas métricas</p>
                    </div>
                </div>

                {/* Cards de Métricas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white border-l-4 border-l-blue-600 border-t border-r border-b border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <User className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                        Total de Clientes
                                    </h3>
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-3xl font-bold text-gray-900">{metrics?.total}</span>
                                    <span className="text-sm text-gray-500 font-medium">clientes aceitos</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="inline-block transform rotate-45 mr-1">↑</span>
                                    +5.2%
                                </div>
                                <span className="text-xs text-gray-400 font-medium">vs. período anterior</span>
                            </div>
                        </div>
                        <div className="h-px bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"></div>
                    </div>

                    <div className="bg-white border-l-4 border-l-emerald-600 border-t border-r border-b border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <MessageCircleMore className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                        Recuperados
                                    </h3>
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-3xl font-bold text-gray-900">{metrics?.recuperados}</span>
                                    <span className="text-sm text-gray-500 font-medium">clientes recuperados</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="inline-block transform rotate-45 mr-1">↑</span>
                                    +8.1%
                                </div>
                                <span className="text-xs text-gray-400 font-medium">vs. período anterior</span>
                            </div>
                        </div>
                        <div className="h-px bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"></div>
                    </div>

                    <div className="bg-white border-l-4 border-l-amber-600 border-t border-r border-b border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <Mail className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                        Em Contato
                                    </h3>
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-3xl font-bold text-gray-900">{metrics?.emContato}</span>
                                    <span className="text-sm text-gray-500 font-medium">em processo</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="inline-block transform rotate-45 mr-1">↑</span>
                                    +12.3%
                                </div>
                                <span className="text-xs text-gray-400 font-medium">vs. período anterior</span>
                            </div>
                        </div>
                        <div className="h-px bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"></div>
                    </div>

                    <div className="bg-white border-l-4 border-l-violet-600 border-t border-r border-b border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <Phone className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                        Score Alto
                                    </h3>
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-3xl font-bold text-gray-900">{metrics?.scoreAlto}</span>
                                    <span className="text-sm text-gray-500 font-medium">score ≥ 80</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                    <span className="inline-block transform rotate-90 mr-1">↓</span>
                                    -2.1%
                                </div>
                                <span className="text-xs text-gray-400 font-medium">vs. período anterior</span>
                            </div>
                        </div>
                        <div className="h-px bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"></div>
                    </div>
                </div>

                {/* Filtros e Tabela */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-100">
                        <CardTitle className="flex items-center gap-2 text-slate-800">
                            <Filter className="h-5 w-5 text-blue-600" />
                            Lista de Clientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Filtros */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <Input
                                        placeholder="Buscar por nome, ID ou email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                                    />
                                </div>
                            </div>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-48 bg-white border-slate-200">
                                    <SelectValue placeholder="Filtrar por status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos os Status</SelectItem>
                                    <SelectItem value="recuperado">Recuperado</SelectItem>
                                    <SelectItem value="contato_encerrado">Contato Encerrado</SelectItem>
                                    <SelectItem value="em_contato">Em Contato</SelectItem>
                                    <SelectItem value="nao_atendeu">Não atendeu</SelectItem>
                                    <SelectItem value="nao_recuperado">Não Recuperado</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={`${sortBy}-${sortOrder}`}
                                onValueChange={(value) => {
                                    const [field, order] = value.split("-")
                                    setSortBy(field)
                                    setSortOrder(order as "asc" | "desc")
                                }}
                            >
                                <SelectTrigger className="w-full md:w-48 bg-white border-slate-200">
                                    <SelectValue placeholder="Ordenar por" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="score-desc">Score (Maior → Menor)</SelectItem>
                                    <SelectItem value="score-asc">Score (Menor → Maior)</SelectItem>
                                    <SelectItem value="nome-asc">Nome (A → Z)</SelectItem>
                                    <SelectItem value="nome-desc">Nome (Z → A)</SelectItem>
                                    <SelectItem value="data_contato-desc">Data (Mais Recente)</SelectItem>
                                    <SelectItem value="data_contato-asc">Data (Mais Antiga)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tabela */}
                        <div className="rounded-lg border border-slate-200 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50">
                                        <TableHead
                                            className="cursor-pointer hover:bg-slate-100 transition-colors"
                                            onClick={() => handleSort("id")}
                                        >
                                            <div className="flex items-center gap-2">
                                                ID
                                                <ArrowUpDown className="h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer hover:bg-slate-100 transition-colors"
                                            onClick={() => handleSort("nome")}
                                        >
                                            <div className="flex items-center gap-2">
                                                Cliente
                                                <ArrowUpDown className="h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer hover:bg-slate-100 transition-colors"
                                            onClick={() => handleSort("score")}
                                        >
                                            <div className="flex items-center gap-2">
                                                Score
                                                <ArrowUpDown className="h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Canal Preferido</TableHead>

                                        <TableHead
                                            className="cursor-pointer hover:bg-slate-100 transition-colors"
                                            onClick={() => handleSort("data_contato")}
                                        >
                                            <div className="flex items-center gap-2">
                                                Último Contato
                                                <ArrowUpDown className="h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedData?.map((cliente) => (
                                        <TableRow key={cliente.id_cliente} className="hover:bg-slate-50 transition-colors">
                                            <TableCell className="font-medium text-slate-700">#{cliente.id_cliente}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium text-slate-800">{cliente.nome}</div>
                                                    <div className="text-sm text-slate-500">{cliente.email}</div>
                                                    <div className="text-sm text-slate-500">{cliente.telefone}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getScoreBadgeColor(cliente.score)} font-bold`}>{cliente.score}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(cliente.status)}>{getStatusLabel(cliente.status)}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {cliente.contactChannel === "whatsapp" ? (
                                                        <MessageCircle className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <>
                                                            <Phone className="h-4 w-4 text-blue-600" />
                                                        </>
                                                    )}
                                                    <span className="text-sm text-slate-600 capitalize">{cliente.contactChannel}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-slate-600">
                                                {cliente.data_contato_aceitacao}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleViewClient(cliente.id_cliente)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Ver Detalhes
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleContactClient(cliente)}>
                                                            {cliente.contactChannel === "whatsapp" ? (
                                                                <MessageCircle className="mr-2 h-4 w-4" />
                                                            ) : (
                                                                <Phone className="mr-2 h-4 w-4" />
                                                            )}
                                                            Entrar em Contato
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Resultado da busca */}
                        <div className="mt-4 text-sm text-slate-600">
                            Mostrando {filteredAndSortedData?.length} de {clientesData?.length} clientes
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
