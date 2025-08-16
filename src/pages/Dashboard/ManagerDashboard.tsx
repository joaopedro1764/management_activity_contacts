import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Phone,
  Filter,
  Activity,
  Award,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Target,
  X,
} from "lucide-react";
import { arrayStatusOrdemDesejada, type KPIData } from "@/types/client";
import { Pagination } from "@/components/pagination";
import { useCliente, useUsers } from "@/api/api";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

function getStatusLabel(status: string) {
  if (status === "em_contato") {
    return "Em contato";
  }
  if (status === "recuperado") {
    return "Recuperado";
  }
  if (status === "nao_recuperado") {
    return "Não recuperado";
  }
  if (status === "sem_resposta") {
    return "Sem resposta";
  }
  if (status === "nao_atendeu") {
    return "Não atendeu";
  }

  return "Pendente para contato";
}

export function ManagerDashboard() {
  const { data: allClients, isLoading } = useCliente();
  const { data: usuarios } = useUsers();
  const [filtros, setFiltros] = useState({
    periodo: "todos",
    vendedor: "todos",
    status: "todos",
    canal: "todos",
  });

  const dadosFiltrados = useMemo(() => {
    return allClients?.filter((item) => {
      let ok = true;

      const periodo = filtros.periodo || "30d"; // fallback para 30d
      const dataCliente = new Date(item.data_contato_aceito);

      // Filtro por período
      if (periodo === "30d") {
        const limite = new Date();
        limite.setDate(limite.getDate() - 30);
        ok = ok && dataCliente >= limite;
      }

      if (periodo === "90d") {
        const limite = new Date();
        limite.setDate(limite.getDate() - 90);
        ok = ok && dataCliente >= limite;
      }

      if (periodo === "1y") {
        const limite = new Date();
        limite.setFullYear(limite.getFullYear() - 1);
        ok = ok && dataCliente >= limite;
      }

      // Vendedor
      if (filtros.vendedor && filtros.vendedor !== "todos") {
        ok =
          ok &&
          item.vendedor_responsavel?.toLowerCase() ===
            filtros.vendedor.toLowerCase();
      }

      // Status
      if (filtros.status && filtros.status !== "todos") {
        ok =
          ok &&
          item.etapa_contato
            ?.toLowerCase()
            .includes(filtros.status.toLowerCase());
      }

      // Canal
      if (filtros.canal && filtros.canal !== "todos") {
        ok =
          ok &&
          item.canal_de_contato?.toLowerCase() === filtros.canal.toLowerCase();
      }

      return ok;
    });
  }, [allClients, filtros]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil((dadosFiltrados?.length ?? 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedItems = useMemo(() => {
    if (!dadosFiltrados) return [];
    return dadosFiltrados
      .filter(
        (client) =>
          client?.pontuacao != null && !isNaN(Number(client.pontuacao))
      )
      .sort((a, b) => Number(b.pontuacao) - Number(a.pontuacao))
      .slice(startIndex, startIndex + itemsPerPage);
  }, [dadosFiltrados, startIndex, itemsPerPage]);

  const goToPage = (page: number) =>
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);
  const getVisiblePageNumbers = () => {
    const delta = 2;
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    const pages = [];
    for (let i = left; i <= right; i++) pages.push(i);
    return pages;
  };

  const kpiData: KPIData = useMemo(() => {
    if (!allClients || allClients.length === 0) {
      return {
        totalEmContato: 0,
        totalRecuperado: 0,
        totalPendentes: 0,
        totalNaoAtendeu: 0,
        totalSemResposta: 0,
        totalNaoRecuperado: 0,
        baseTotalClientes: 0,
        taxaConversao: 0,
        scoreMedio: 0,
      };
    }

    let totalEmContato = 0;
    let totalRecuperado = 0;
    let totalPendentes = 0;
    let totalNaoAtendeu = 0;
    let totalNaoRecuperado = 0;
    let totalSemResposta = 0;
    let somaPontuacao = 0;

    allClients.forEach((client) => {
      if (client.etapa_contato === "em_contato") totalEmContato++;
      if (client.etapa_contato === "recuperado") totalRecuperado++;
      if (client.tratado.trim() === "") totalPendentes++;
      if (client.etapa_contato === "nao_atendeu") totalNaoAtendeu++;
      if (client.etapa_contato === "sem_resposta") totalSemResposta++;
      if (client.etapa_contato === "nao_recuperado") totalNaoRecuperado++;
      somaPontuacao += client.pontuacao || 0;
    });

    const baseTotalClientes = allClients.length;
    const taxaConversao = (totalRecuperado / baseTotalClientes) * 100;
    const scoreMedio = somaPontuacao / baseTotalClientes;

    return {
      totalEmContato,
      totalRecuperado,
      totalPendentes,
      totalNaoAtendeu,
      totalSemResposta,
      baseTotalClientes,
      totalNaoRecuperado,
      taxaConversao,
      scoreMedio,
    };
  }, [allClients]);

  const {
    statusDistribution,
    totalPorStatusDiagnosticoNaoRecuperado,
    totalPorStatusDiagnosticoRecuperado,
    totalPorVendedor,
  } = useMemo(() => {
    if (!allClients || allClients.length === 0) {
      return {
        statusDistribution: {
          em_contato: 0,
          recuperado: 0,
          nao_atendeu: 0,
          nao_recuperado: 0,
          sem_resposta: 0,
        },
        channelStats: { whatsapp: 0, telefone: 0 },
        totalPorStatusDiagnosticoRecuperado: [],
        totalPorStatusDiagnosticoNaoRecuperado: [],
        totalPorVendedor: [],
      };
    }

    const resultado = allClients.reduce(
      (acc, client) => {
        // Distribuição de status
        const status = client.etapa_contato?.trim() || "pendentes_contato";
        acc.statusDistribution[status] =
          (acc.statusDistribution[status] || 0) + 1;

        // Canais
        if (client.canal_de_contato === "whatsapp") acc.channelStats.whatsapp++;
        if (client.canal_de_contato === "telefone") acc.channelStats.telefone++;

        const nomeDiagnostico = client.descricao_diagnostico;
        const diagLower = nomeDiagnostico?.toLowerCase() || "";

        // Recuperados (mas não "Não Recuperado")
        if (
          diagLower.includes("recuperado") &&
          !diagLower.includes("não recuperado")
        ) {
          const existente = acc.totalPorStatusDiagnosticoRecuperado.find(
            (item) => item.nome === nomeDiagnostico
          );
          if (existente) existente.quantidade++;
          else
            acc.totalPorStatusDiagnosticoRecuperado.push({
              nome: nomeDiagnostico,
              quantidade: 1,
            });
        }

        // Não Recuperados
        if (diagLower.includes("não recuperado")) {
          const existente = acc.totalPorStatusDiagnosticoNaoRecuperado.find(
            (item) => item.nome === nomeDiagnostico
          );
          if (existente) existente.quantidade++;
          else
            acc.totalPorStatusDiagnosticoNaoRecuperado.push({
              nome: nomeDiagnostico,
              quantidade: 1,
            });
        }

        // ---- AGRUPAR POR VENDEDOR (apenas com vendedor atribuído) ----
        if (
          !client.vendedor_responsavel ||
          !client.vendedor_responsavel.trim()
        ) {
          return acc; // ignora se não tiver vendedor
        }

        const vendedor = client.vendedor_responsavel.trim();
        let vendedorExistente = acc.totalPorVendedor.find(
          (v) => v.vendedor === vendedor
        );

        if (!vendedorExistente) {
          vendedorExistente = {
            vendedor,
            totalClientes: 0,
            recuperacoes: 0,
          };
          acc.totalPorVendedor.push(vendedorExistente);
        }

        // Incrementa total de clientes
        vendedorExistente.totalClientes++;

        // Incrementa recuperações
        if (
          diagLower.includes("recuperado") &&
          !diagLower.includes("não recuperado")
        ) {
          vendedorExistente.recuperacoes++;
        }

        return acc;
      },
      {
        statusDistribution: {
          em_contato: 0,
          recuperado: 0,
          nao_atendeu: 0,
          nao_recuperado: 0,
          sem_resposta: 0,
        } as Record<string, number>,
        channelStats: { whatsapp: 0, telefone: 0 },
        totalPorStatusDiagnosticoRecuperado: [] as {
          nome: string;
          quantidade: number;
        }[],
        totalPorStatusDiagnosticoNaoRecuperado: [] as {
          nome: string;
          quantidade: number;
        }[],
        totalPorVendedor: [] as {
          vendedor: string;
          totalClientes: number;
          recuperacoes: number;
          taxaConversao?: number;
          ranking?: string;
        }[],
      }
    );

    // Calcula taxa de conversão e ranking
    resultado.totalPorVendedor = resultado.totalPorVendedor
      .map((v) => ({
        ...v,
        taxaConversao:
          v.totalClientes > 0 ? (v.recuperacoes / v.totalClientes) * 100 : 0,
      }))
      .sort((a, b) => b.taxaConversao - a.taxaConversao)
      .map((v, idx) => ({
        ...v,
        ranking: `#${idx + 1}`,
      }));

    return resultado;
  }, [allClients]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!allClients) {
    return <p>Ocorreu um erro na API</p>;
  }

  const recuperado = Number(kpiData.totalRecuperado) || 0;
  const naoRecuperado = Number(kpiData.totalNaoRecuperado) || 0;

  const taxaConversao =
    recuperado + naoRecuperado > 0
      ? (recuperado / (recuperado + naoRecuperado)) * 100
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-blue-500 shadow-lg rounded-b">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Dashboard Gerencial
              </h1>
              <p className="text-blue-100 mt-1">
                Análise completa de recuperação de clientes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Filters Section */}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2  gap-6 mb-8">
          <Card className="shadow-sm border-blue-200 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-blue-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Taxa de Recuperação
                  </p>
                  <p className="text-3xl font-bold text-emerald-600">{`${taxaConversao.toFixed(
                    2
                  )}%`}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {statusDistribution.recuperado} de {allClients?.length ?? 0}{" "}
                    clientes recuperados
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-blue-200 hover:shadow-md transition-shadow bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Clientes em Contato</p>
                  <p className="text-3xl font-bold">
                    {statusDistribution.em_contato ?? 0}
                  </p>
                  <p className="text-xs mt-1">Oportunidades ativas</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-sm border-blue-200 bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-lg text-emerald-700 font-medium">
                  Performance por Recuperados
                </CardTitle>
              </div>
              <CardDescription>
                Top 4 motivos de sucesso na recuperação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  {totalPorStatusDiagnosticoRecuperado.map((recuperado) => (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-full">
                          <Target className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-emerald-800">
                            {recuperado.nome}
                          </span>
                          <div className="text-xs text-emerald-600">
                            Oferta de valor agregado
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-800 mb-1"
                        >
                          {recuperado.quantidade}
                        </Badge>
                        <Progress
                          value={45}
                          className="h-2 w-20 bg-emerald-100"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-700">
                      Total Recuperados
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-800"
                    >
                      {statusDistribution.recuperado}
                    </Badge>
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">
                    Estratégias mais eficazes para recuperação de clientes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-blue-200 bg-gradient-to-br from-white to-red-50/30">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <CardTitle className="text-lg text-red-700 font-medium">
                  Performance por Não Recuperados
                </CardTitle>
              </div>
              <CardDescription>
                Top 4 motivos de não recuperação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  {totalPorStatusDiagnosticoNaoRecuperado.map(
                    (naoRecuperado) => (
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 rounded-full">
                            <CheckCircle2 className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-red-800">
                              {naoRecuperado.nome}
                            </span>
                            <div className="text-xs text-red-600">
                              Cliente não vê necessidade de mudança
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-800 mb-1"
                          >
                            {naoRecuperado.quantidade}
                          </Badge>
                          <Progress
                            value={42}
                            className="h-2 w-20 bg-red-100"
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
                <div className="pt-4 border-t border-red-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-700">
                      Total Não Recuperados
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-800"
                    >
                      {statusDistribution.nao_recuperado}
                    </Badge>
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    Principais obstáculos para recuperação
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Distribution */}
        <Card className="mb-8 shadow-sm border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg text-blue-900">
                Distribuição por Status
              </CardTitle>
            </div>
            <CardDescription>
              Visão geral da base de clientes por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-black`}></div>
                    <span className="font-medium text-blue-800">
                      Base total
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {/*  <span className="text-sm text-blue-600">{item.toFixed(2)}%</span> */}
                    <span className="text-sm font-semibold text-blue-900 min-w-[60px] text-right">
                      {kpiData.baseTotalClientes}
                    </span>
                  </div>
                </div>
                <Progress value={kpiData.baseTotalClientes} className="h-3" />
              </div>
              {Object.entries(statusDistribution)
                .sort(
                  ([nomeA], [nomeB]) =>
                    arrayStatusOrdemDesejada.indexOf(nomeA) -
                    arrayStatusOrdemDesejada.indexOf(nomeB)
                )
                .map(([nome, quantidade]) => (
                  <div key={nome} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-black`}></div>
                        <span className="font-medium text-blue-500">
                          {getStatusLabel(nome)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-blue-800 min-w-[60px] text-right">
                          {quantidade}
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={quantidade / kpiData.baseTotalClientes}
                      className="h-3"
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        {/* Vendor Performance */}
        <Card className="mb-8 shadow-sm border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg text-blue-900">
                Performance dos Vendedores
              </CardTitle>
            </div>
            <CardDescription>
              Ranking e estatísticas detalhadas de cada vendedor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-200">
                    <th className="text-left py-3 px-4 font-semibold text-blue-800">
                      Vendedor
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-blue-800">
                      Total Clientes
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-blue-800">
                      Recuperações
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-blue-800">
                      Taxa Conversão
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-blue-800">
                      Ranking
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {totalPorVendedor.map((item) => (
                    <tr className="border-b border-blue-100 hover:bg-blue-50/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">
                              JP
                            </span>
                          </div>
                          <span className="font-medium text-blue-900">
                            {item.vendedor}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-blue-800">
                        {item.totalClientes}
                      </td>
                      <td className="py-4 px-4 text-blue-800">
                        {item.recuperacoes}
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-800"
                        >
                          {item.taxaConversao?.toFixed(2)} %
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          {item.ranking}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card className="mb-8 shadow-sm border-blue-200 bg-gradient-to-r from-white to-blue-50/30">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg text-blue-900">
                Filtros Avançados
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-blue-800 mb-2 block">
                  Período
                </label>
                <Select
                  value={filtros.periodo}
                  onValueChange={(valor) =>
                    setFiltros((prev) => ({ ...prev, periodo: valor }))
                  }
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-500 w-full">
                    <SelectValue placeholder="Filtre pelo período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="30d">Últimos 30 dias</SelectItem>
                    <SelectItem value="90d">Últimos 90 dias</SelectItem>
                    <SelectItem value="1y">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-blue-800 mb-2 block">
                  Vendedor
                </label>
                <Select
                  value={filtros.vendedor}
                  onValueChange={(valor) =>
                    setFiltros((prev) => ({ ...prev, vendedor: valor }))
                  }
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-500 w-full">
                    <SelectValue placeholder="Filtre pelo vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {usuarios?.map((usuario) => (
                      <SelectItem value={usuario}>{usuario}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-blue-800 mb-2 block">
                  Status
                </label>
                <Select
                  value={filtros.status}
                  onValueChange={(valor) =>
                    setFiltros((prev) => ({ ...prev, status: valor }))
                  }
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-500 w-full">
                    <SelectValue placeholder="Filtre pelo status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="recuperado">Recuperado</SelectItem>
                    <SelectItem value="nao_recuperado">
                      Não Recuperado
                    </SelectItem>
                    <SelectItem value="em_contato">Em Contato</SelectItem>
                    <SelectItem value=" ">Pendente</SelectItem>
                    <SelectItem value="sem_resposta">Sem resposta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-blue-800 mb-2 block">
                  Canal
                </label>
                <Select
                  value={filtros.canal}
                  onValueChange={(valor) =>
                    setFiltros((prev) => ({ ...prev, canal: valor }))
                  }
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-500 w-full">
                    <SelectValue placeholder="Filtre pelo canal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button className="mt-7">
                  <X />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Client Details */}
        <Card className="shadow-sm border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg text-blue-900">
                    Detalhes dos Clientes
                  </CardTitle>
                </div>
                <CardDescription>
                  Lista completa com informações detalhadas (8.694 clientes)
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="text-blue-700 border-blue-300"
              >
                Mostrando 1 a 5 de 8.694 resultados
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-200">
                    <th className="text-left py-3 px-4 font-semibold text-blue-800">
                      Cliente
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-blue-800">
                      Score
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-blue-800">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-blue-800">
                      Canal
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-blue-800">
                      Motivo Cancelamento
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-blue-800">
                      Vendedor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.length === 0 && (
                    <div className="w-full flex justify-center items-center">
                      <span className="font-bold">
                        Nenhum cliente pelo filtro
                      </span>
                    </div>
                  )}
                  {paginatedItems?.map((client, index) => (
                    <tr
                      key={index}
                      className="border-b border-blue-100 hover:bg-blue-50/50"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-blue-900">
                            {client.id_cliente} - {client.razao}
                          </div>
                          <div className="text-sm text-blue-600">
                            {client.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-blue-900">
                          {client.pontuacao}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge>{getStatusLabel(client.etapa_contato)}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {client.canal_de_contato === "telefone" && (
                            <Phone className="w-4 h-4 text-blue-500" />
                          )}
                          {client.canal_de_contato === "whatsapp" && (
                            <MessageSquare className="w-4 h-4 text-green-500" />
                          )}
                          <span className="text-sm text-blue-700">
                            {client.canal_de_contato}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-blue-700 max-w-xs truncate block">
                          {client.motivo_cancelamento}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {client.vendedor_responsavel ? (
                            <span className="text-sm text-blue-800">
                              {client.vendedor_responsavel}
                            </span>
                          ) : (
                            <p>Nâo atribuido</p>
                          )}
                        </div>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
