import { useState, useMemo} from "react"
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
import { Pagination } from "@/components/pagination"
import { useCliente } from "@/api/api"
import { useAuth } from "@/context/AuthContext"



function getScoreBadgeColor(score: number) {
    if (score >= 80) return "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
    if (score >= 60) return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
    return "bg-gradient-to-r from-red-500 to-rose-500 text-white"
}

function getContactStatusColor(status: string) {
    switch (status) {
        case "em_contato":
            return "bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
        case "contato_encerrado":
            return "bg-gradient-to-r from-zinc-500 to-zinc-600 text-white"
        case "nao_atendeu":
            return "bg-gradient-to-r from-orange-400 to-orange-500 text-white"
        case "recuperado":
            return "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
        default:
            return "bg-gray-500 text-white"
    }
}

function getContactStatusLabel(status: string) {
    switch (status) {
        case "em_contato":
            return "Em Contato"
        case "contato_encerrado":
            return "Contato Encerrado"
        case "nao_atendeu":
            return "Não Atendeu"
        case "recuperado":
            return "Recuperado"
        default:
            return "Status Desconhecido"
    }
}

export function ListCustomer() {

    const { user } = useAuth()
    const { data: allClients } = useCliente()

    const clientFilterByWinner = allClients?.filter((client) => {
        return client.vendedor_responsavel === user.nome
    })


    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("todos")
    const [sortBy, setSortBy] = useState("score")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 6;

    const totalPages = Math.ceil((clientFilterByWinner?.length ?? 0) / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = clientFilterByWinner?.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const goToPage = (page: number) => setCurrentPage(page);
    const getVisiblePageNumbers = () => {
        const delta = 2;
        const left = Math.max(1, currentPage - delta);
        const right = Math.min(totalPages, currentPage + delta);
        const pages = [];

        for (let i = left; i <= right; i++) {
            pages.push(i);
        }

        return pages;
    };


    // Calcular métricas
    const metrics = useMemo(() => {
        if (clientFilterByWinner) {
            const total = clientFilterByWinner.length
            const recuperados = clientFilterByWinner?.filter((c) => c.etapa_contato === "recuperado").length
            const emContato = clientFilterByWinner?.filter((c) => c.etapa_contato === "em_contato").length
            const scoreAlto = clientFilterByWinner?.filter((c) => c.pontuacao >= 80).length
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

    const handleViewClient = (clienteId: string) => {
        console.log("Ver detalhes do cliente:", clienteId)
        // Implementar navegação para detalhes do cliente
    }

    const handleContactClient = (cliente: any) => {
        console.log("Entrar em contato com:", cliente.nome)
        // Implementar ação de contato
    }

    console.log(paginatedItems)

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
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-800">
                            <Filter className="h-5 w-5 text-blue-600" />
                            Lista de Clientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="">
                        {/* Filtros */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <Input
                                        placeholder="Buscar por nome ou ID"
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
                        <div className="rounded-lg border border-slate-200 overflow-hidden p-2">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50">
                                        <TableHead
                                            className="cursor-pointer hover:bg-slate-100 transition-colors"

                                        >
                                            <div className="flex items-center gap-2">
                                                ID CLIENTE
                                                <ArrowUpDown className="h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer hover:bg-slate-100 transition-colors"

                                        >
                                            <div className="flex items-center gap-2">
                                                Cliente
                                                <ArrowUpDown className="h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer hover:bg-slate-100 transition-colors"

                                        >
                                            <div className="flex items-center gap-2">
                                                Score
                                                <ArrowUpDown className="h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead>Motivo cancelamento</TableHead>
                                        <TableHead>Status Contato</TableHead>
                                        <TableHead>Melhor Contato</TableHead>

                                        <TableHead
                                            className="cursor-pointer hover:bg-slate-100 transition-colors"

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
                                    {paginatedItems?.map((cliente) => (
                                        <TableRow key={cliente.id_cliente} className="hover:bg-slate-50 transition-colors">
                                            <TableCell className="font-medium text-slate-700">{cliente.id_cliente}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1 flex flex-col">
                                                    <span className="font-medium text-slate-800">{cliente.razao}</span>
                                                    <span className="text-sm text-blue-500 font-medium flex gap-1 items-center"> <Phone className="w-4 h-4" />{cliente.contato_1}</span>
                                                    {cliente.contato_2 && (
                                                        <span className="text-sm text-blue-500 font-medium flex gap-1 items-center"> <Phone className="w-4 h-4" />{cliente.contato_2}</span>
                                                    )}
                                                    {cliente.contato_3 && (
                                                        <span className="text-sm text-blue-500 font-medium flex gap-1 items-center"> <Phone className="w-4 h-4" />{cliente.contato_1}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getScoreBadgeColor(cliente.pontuacao)} font-bold`}>{cliente.pontuacao}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {cliente.motivo_cancelamento}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getContactStatusColor(cliente.etapa_contato)}>{getContactStatusLabel(cliente.etapa_contato)}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {cliente.contato_1 === "whatsapp" ? (
                                                        <MessageCircle className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <>
                                                            <Phone className="h-4 w-4 text-blue-600" />
                                                        </>
                                                    )}
                                                    <span className="text-sm text-slate-600 capitalize">{cliente.contato_1 || "Telefone"}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-slate-600">
                                                {cliente.data_cancelamento}
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
                                                            {cliente.canal_de_contato === "whatsapp" ? (
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

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            itemsPerPage={itemsPerPage}
                            totalItems={clientFilterByWinner?.length ?? 0}
                            startIndex={startIndex}
                            getVisiblePageNumbers={getVisiblePageNumbers}
                            goToFirstPage={goToFirstPage}
                            goToPreviousPage={goToPreviousPage}
                            goToPage={goToPage}
                            goToNextPage={goToNextPage}
                            goToLastPage={goToLastPage}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
