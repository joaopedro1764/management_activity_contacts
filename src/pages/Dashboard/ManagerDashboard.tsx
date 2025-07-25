import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Users,
    Phone,
    MessageCircle,
    TrendingUp,
    Filter,
    Download,
    BarChart3,
    PieChart,
    Activity,
    CheckCircle,
    Star,
    Award
} from "lucide-react"
import { usePlanilha } from "@/api/planilha"
import type { ContratoCancelado, DashboardFilters, KPIData } from "@/types/client"
import { Pagination } from "@/components/pagination"


export function ManagerDashboard() {
    const { data: allClients, isLoading } = usePlanilha({ aba: "Sheet1" })

    const [filters, setFilters] = useState<DashboardFilters>({
        period: "30",
        seller: "all",
        status: "all",
        channel: "all",
        scoreRange: "all"
    })

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 5;

    const totalPages = Math.ceil((allClients?.length ?? 0) / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = [...(allClients ?? [])]
        .filter(client => client?.score != null && !isNaN(Number(client.score)))
        .sort((a, b) => Number(b.score) - Number(a.score))
        .slice(startIndex, startIndex + itemsPerPage);



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

    const sellers = ["João Vendedor", "Maria Vendedora", "Carlos Vendedor", "Ana Vendedora"]

    console.log(paginatedItems
        ?.sort((a, b) => Number(a.score) - Number(b.score)))

    // Filtrar dados baseado nos filtros
    const filteredData = useMemo(() => {
        if (!allClients) return []

        return allClients.filter(client => {
            if (filters.seller !== "all" && client.assignedTo !== filters.seller) return false
            if (filters.status !== "all" && client.contactStatus !== filters.status) return false
            if (filters.channel !== "all" && client.contactChannel !== filters.channel) return false

            if (filters.scoreRange !== "all") {
                const score = client.score
                switch (filters.scoreRange) {
                    case "high": return score >= 8
                    case "medium": return score >= 6 && score < 8
                    case "low": return score >= 4 && score < 6
                    case "very-low": return score < 4
                    default: return true
                }
            }

            return true
        })
    }, [allClients, filters])

    // Calcular KPIs
    const kpiData = useMemo((): KPIData => {
        const totalClients = filteredData.length
        const totalAttempts = filteredData.filter(c => c.contactMade).length
        const totalAnswered = filteredData.filter(c => c.motivo_cancelamento).length
        const totalRecovered = filteredData.filter(c => c.recovered).length
        const conversionRate = totalAttempts > 0 ? (totalRecovered / totalAttempts) * 100 : 0
        const averageScore = filteredData.length > 0
            ? filteredData.reduce((sum, c) => sum + c.score, 0) / filteredData.length
            : 0

        return {
            totalClients,
            totalAttempts,
            totalAnswered,
            totalRecovered,
            conversionRate,
            averageScore
        }
    }, [filteredData])

    // Dados para gráficos
    const statusDistribution = useMemo(() => {
        const stats = {
            recuperado: 0,
            em_contato: 0,
            nao_atendeu: 0,
            contato_encerrado: 0,
            pendente: 0
        }

        filteredData.forEach(client => {
            if (client.recovered) stats.recuperado++
            else if (client.contactStatus === "em_contato") stats.em_contato++
            else if (client.contactStatus === "nao_atendeu") stats.nao_atendeu++
            else if (client.contactStatus === "contato_encerrado") stats.contato_encerrado++
            else stats.pendente++
        })

        return stats
    }, [filteredData])

    const channelStats = useMemo(() => {
        const stats = { whatsapp: 0, telefone: 0 }
        filteredData.forEach(client => {
            if (client.contactChannel) {
                stats[client.contactChannel]++
            }
        })
        return stats
    }, [filteredData])

    const sellerPerformance = useMemo(() => {
        return sellers.map(seller => {
            const sellerClients = filteredData.filter(c => c.assignedTo === seller)
            const attempts = sellerClients.filter(c => c.contactMade).length
            const recovered = sellerClients.filter(c => c.recovered).length
            const conversionRate = attempts > 0 ? (recovered / attempts) * 100 : 0

            return {
                name: seller,
                total: sellerClients.length,
                attempts,
                recovered,
                conversionRate
            }
        })
    }, [filteredData, sellers])

    const getScoreColor = (score: number) => {
        if (score >= 8) return "text-success font-semibold"
        if (score >= 6) return "text-warning font-semibold"
        if (score >= 4) return "text-orange-600 font-semibold"
        return "text-destructive font-semibold"
    }

    const getStatusBadge = (client: ContratoCancelado) => {
        if (client.recovered) {
            return <Badge className="bg-success/10 text-success border-success/20">Recuperado</Badge>
        }
        if (client.contactStatus === "em_contato") {
            return <Badge className="bg-info/10 text-info border-info/20">Em Contato</Badge>
        }
        if (client.contactStatus === "nao_atendeu") {
            return <Badge className="bg-warning/10 text-warning border-warning/20">Não Atendeu</Badge>
        }
        if (client.contactStatus === "contato_encerrado") {
            return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Encerrado</Badge>
        }
        return <Badge className="bg-yellow-500 text-white">Pendente</Badge>
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Activity className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Carregando dashboard...</p>
                </div>
            </div>
        )
    }




    return (
        <div className="min-h-screen bg-background">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Dashboard Gerencial</h1>
                        <p className="text-muted-foreground mt-1">Análise completa de recuperação de clientes</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Exportar Relatório
                        </Button>
                    </div>
                </div>

                {/* Filtros */}
                <Card className="border-2 border-primary/10">
                    <CardHeader className="bg-gradient-primary font-bold">
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtros Avançados
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Período</label>
                                <Select value={filters.period} onValueChange={(value) => setFilters({ ...filters, period: value })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">Últimos 7 dias</SelectItem>
                                        <SelectItem value="30">Últimos 30 dias</SelectItem>
                                        <SelectItem value="90">Últimos 3 meses</SelectItem>
                                        <SelectItem value="365">Último ano</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Vendedor</label>
                                <Select value={filters.seller} onValueChange={(value) => setFilters({ ...filters, seller: value })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {sellers.map(seller => (
                                            <SelectItem key={seller} value={seller}>{seller}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Status</label>
                                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="recuperado">Recuperados</SelectItem>
                                        <SelectItem value="em_contato">Em Contato</SelectItem>
                                        <SelectItem value="nao_atendeu">Não Atendeu</SelectItem>
                                        <SelectItem value="contato_encerrado">Encerrado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Canal</label>
                                <Select value={filters.channel} onValueChange={(value) => setFilters({ ...filters, channel: value })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                        <SelectItem value="telefone">Telefone</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Faixa Score</label>
                                <Select value={filters.scoreRange} onValueChange={(value) => setFilters({ ...filters, scoreRange: value })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="high">Alto (8-10)</SelectItem>
                                        <SelectItem value="medium">Médio (6-8)</SelectItem>
                                        <SelectItem value="low">Baixo (4-6)</SelectItem>
                                        <SelectItem value="very-low">Muito Baixo (&lt;4)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* KPIs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card className="bg-gradient-info text-info-foreground shadow-info hover:scale-105 transition-transform">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-info-foreground/80 text-sm font-medium">Total de Clientes</p>
                                    <p className="text-3xl font-bold">{kpiData.totalClients}</p>
                                </div>
                                <Users className="h-8 w-8 text-info-foreground/80" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-warning text-warning-foreground shadow-warning hover:scale-105 transition-transform">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-warning-foreground/80 text-sm font-medium">Tentativas</p>
                                    <p className="text-3xl font-bold">{kpiData.totalAttempts}</p>
                                </div>
                                <Phone className="h-8 w-8 text-warning-foreground/80" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-purple text-purple-foreground shadow-purple hover:scale-105 transition-transform">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-foreground/80 text-sm font-medium">Atendimentos</p>
                                    <p className="text-3xl font-bold">{kpiData.totalAnswered}</p>
                                </div>
                                <MessageCircle className="h-8 w-8 text-purple-foreground/80" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-success text-success-foreground shadow-success hover:scale-105 transition-transform">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-success-foreground/80 text-sm font-medium">Recuperações</p>
                                    <p className="text-3xl font-bold">{kpiData.totalRecovered}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-success-foreground/80" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-primary shadow-green-500 hover:scale-105 transition-transform">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Taxa Conversão</p>
                                    <p className="text-3xl font-bold">{kpiData.conversionRate.toFixed(1)}%</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-primary-foreground/80" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-warning text-warning-foreground shadow-warning hover:scale-105 transition-transform">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-warning-foreground/80 text-sm font-medium">Score Médio</p>
                                    <p className="text-3xl font-bold">{kpiData.averageScore.toFixed(1)}</p>
                                </div>
                                <Star className="h-8 w-8 text-warning-foreground/80" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Status Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChart className="h-5 w-5" />
                                Distribuição por Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(statusDistribution).map(([status, count]) => {
                                    const percentage = kpiData.totalClients > 0 ? (count / kpiData.totalClients) * 100 : 0
                                    const getStatusColor = () => {
                                        switch (status) {
                                            case 'recuperado': return 'bg-success'
                                            case 'em_contato': return 'bg-info'
                                            case 'nao_atendeu': return 'bg-warning'
                                            case 'contato_encerrado': return 'bg-destructive'
                                            default: return 'bg-muted'
                                        }
                                    }

                                    const getStatusLabel = () => {
                                        switch (status) {
                                            case 'recuperado': return 'Recuperados'
                                            case 'em_contato': return 'Em Contato'
                                            case 'nao_atendeu': return 'Não Atendeu'
                                            case 'contato_encerrado': return 'Encerrados'
                                            default: return 'Pendentes'
                                        }
                                    }

                                    return (
                                        <div key={status} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">{getStatusLabel()}</span>
                                                <span className="text-sm text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2">
                                                <div
                                                    className={`${getStatusColor()} h-2 rounded-full transition-all duration-300`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Channel Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Performance por Canal
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <MessageCircle className="h-5 w-5 text-success" />
                                        <span className="font-medium">WhatsApp</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Contatos realizados</span>
                                        <span className="font-semibold">{channelStats.whatsapp}</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-3">
                                        <div
                                            className="bg-success h-3 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${(channelStats.whatsapp + channelStats.telefone) > 0
                                                    ? (channelStats.whatsapp / (channelStats.whatsapp + channelStats.telefone)) * 100
                                                    : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-info" />
                                        <span className="font-medium">Telefone</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Contatos realizados</span>
                                        <span className="font-semibold">{channelStats.telefone}</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-3">
                                        <div
                                            className="bg-info h-3 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${(channelStats.whatsapp + channelStats.telefone) > 0
                                                    ? (channelStats.telefone / (channelStats.whatsapp + channelStats.telefone)) * 100
                                                    : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Seller Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Performance dos Vendedores
                        </CardTitle>
                        <CardDescription>
                            Ranking e estatísticas detalhadas de cada vendedor
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-medium">Vendedor</th>
                                        <th className="text-left p-3 font-medium">Total Clientes</th>
                                        <th className="text-left p-3 font-medium">Tentativas</th>
                                        <th className="text-left p-3 font-medium">Recuperações</th>
                                        <th className="text-left p-3 font-medium">Taxa Conversão</th>
                                        <th className="text-left p-3 font-medium">Ranking</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sellerPerformance
                                        .sort((a, b) => b.conversionRate - a.conversionRate)
                                        .map((seller, index) => (
                                            <tr key={seller.name} className="border-b hover:bg-muted/50">
                                                <td className="p-3">
                                                    <div className="font-medium">{seller.name}</div>
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant="outline">{seller.total}</Badge>
                                                </td>
                                                <td className="p-3">
                                                    <Badge className="bg-warning/10 text-warning border-warning/20">{seller.attempts}</Badge>
                                                </td>
                                                <td className="p-3">
                                                    <Badge className="bg-success/10 text-success border-success/20">{seller.recovered}</Badge>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`font-semibold ${seller.conversionRate >= 50 ? 'text-success' :
                                                        seller.conversionRate >= 30 ? 'text-warning' :
                                                            'text-destructive'
                                                        }`}>
                                                        {seller.conversionRate.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        {index === 0 && <span className="text-2xl">🥇</span>}
                                                        {index === 1 && <span className="text-2xl">🥈</span>}
                                                        {index === 2 && <span className="text-2xl">🥉</span>}
                                                        <span className="font-medium">{index + 1}º</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Detailed Client Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Detalhes dos Clientes
                        </CardTitle>
                        <CardDescription>
                            Lista completa com informações detalhadas ({filteredData.length} clientes)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-3 font-medium">Cliente</th>
                                            <th className="text-left p-3 font-medium">Vendedor</th>
                                            <th className="text-left p-3 font-medium">Score</th>
                                            <th className="text-left p-3 font-medium">Status</th>
                                            <th className="text-left p-3 font-medium">Canal</th>
                                            <th className="text-left p-3 font-medium">Motivo Cancelamento</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedItems?.map((client) => (
                                            <tr key={client.id_cliente} className="border-b hover:bg-muted/50">
                                                <td className="p-3">
                                                    <div>
                                                        <div className="font-medium">{client.nome}</div>
                                                        <div className="text-sm text-muted-foreground">{client.email}</div>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="text-sm">
                                                        {client.assignedTo || (
                                                            <Badge variant="outline" className="bg-muted">
                                                                Não atribuído
                                                            </Badge>
                                                        )}
                                                    </div>
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
                                                    {client.contactChannel && (
                                                        <div className="flex items-center gap-1 text-sm">
                                                            {client.contactChannel === "whatsapp" ? (
                                                                <MessageCircle className="h-4 w-4 text-success" />
                                                            ) : (
                                                                <Phone className="h-4 w-4 text-info" />
                                                            )}
                                                            <span className="capitalize">{client.contactChannel}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant="outline" className="bg-muted">
                                                        {client.motivo_cancelamento}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                itemsPerPage={itemsPerPage}
                                totalItems={allClients?.length ?? 0}
                                startIndex={startIndex}
                                getVisiblePageNumbers={getVisiblePageNumbers}
                                goToFirstPage={goToFirstPage}
                                goToPreviousPage={goToPreviousPage}
                                goToPage={goToPage}
                                goToNextPage={goToNextPage}
                                goToLastPage={goToLastPage}
                            />

                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}