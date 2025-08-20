import { useState, useMemo } from "react";
import {
  Filter,
  MoreHorizontal,
  PhoneCall,
  Edit,
  BarChart3,
  Users,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/pagination";
import { useCliente } from "@/api/api";
import { useAuth } from "@/context/AuthContext";
import { FilterClient } from "./Filter";
import { useNavigate, useSearchParams } from "react-router";

function getScoreBadgeColor(score: number) {
  if (score >= 80)
    return "bg-gradient-to-r from-emerald-500 to-green-500 text-white";
  if (score >= 60)
    return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white";
  return "bg-gradient-to-r from-red-500 to-rose-500 text-white";
}

  const getContactStatusColor = (status: string) => {
    const colors = {
      recuperado: "bg-green-100 text-green-800 border-green-200",
      em_contato: "bg-blue-100 text-blue-800 border-blue-200",
      sem_resposta: "bg-gray-100 text-gray-800 border-gray-200",
      nao_recuperado: "bg-red-100 text-red-800 border-red-200",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

function getContactStatusLabel(status: string) {
  switch (status) {
    case "em_contato":
      return "Em Contato";
    case "sem_resposta":
      return "Sem Resposta";
    case "nao_atendeu":
      return "Não Atendeu";
    case "recuperado":
      return "Recuperado";
    case "nao_recuperado":
      return "Não Recuperado";
    default:
      return "Status Desconhecido";
  }
}

export function ListCustomer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { data: allClients } = useCliente();

  const clientFilterByWinner = allClients?.filter((client) => {
    return client.vendedor_responsavel === user.nome;
  });

  const filters = {
    statusFilter: searchParams.get("statusFilter")?.toLowerCase().trim(),
    idClientOrNameClient: searchParams
      .get("idClientOrNameClient")
      ?.toLowerCase()
      .trim(),
  };

  const idOrName = filters.idClientOrNameClient?.toLowerCase().trim();
  const status = filters.statusFilter?.toLowerCase().trim();

  const clienteByUserFilter = clientFilterByWinner?.filter((c) => {
    const id_cliente = c.id_cliente?.toString().toLowerCase() ?? "";
    const razao = c.razao?.toLowerCase() ?? "";
    const etapa_contato = c.etapa_contato?.toLowerCase() ?? "";

    const matchIdOrName = idOrName
      ? id_cliente.includes(idOrName) || razao.includes(idOrName)
      : true;

    const matchStatus = status ? etapa_contato.includes(status) : true;

    return matchIdOrName && matchStatus;
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(
    (clienteByUserFilter?.length ?? 0) / itemsPerPage
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = clienteByUserFilter?.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
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
      const total = clientFilterByWinner.length;
      const recuperados = clientFilterByWinner?.filter(
        (c) => c.etapa_contato === "recuperado"
      ).length;
      const em_contato = clientFilterByWinner?.filter(
        (c) => c.etapa_contato === "em_contato"
      ).length;
      const sem_reposta = clientFilterByWinner?.filter(
        (c) => c.etapa_contato === "sem_resposta"
      ).length;
      const nao_recuperado = clientFilterByWinner?.filter(
        (c) => c.etapa_contato === "nao_recuperado"
      ).length;
      const taxaRecuperacao =
        total > 0 ? Math.round((recuperados / total) * 100) : 0;

      return {
        total,
        recuperados,
        em_contato,
        sem_reposta,
        taxaRecuperacao,
        nao_recuperado
      };
    }
  }, [clientFilterByWinner]);

  const handleViewClient = (clienteId: string) => {
    navigate(`/listaClientes/${clienteId}`);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold">Dashboard do Vendedor</h1>
            </div>
            <p className="text-lg text-white/90 max-w-2xl">
              Gerencie seus clientes e acompanhe suas métricas de recuperação com insights em tempo real
            </p>
          </div>
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/5 blur-2xl"></div>
        </div>


        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 p-6">

          <Card
            className={`relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-600 border transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total clientes</p>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-foreground">{metrics?.total}</p>
                    <p className="text-sm text-muted-foreground font-medium">clientes aceitos</p>
                  </div>

                </div>
                <div className={`p-3 rounded-xl bg-primary text-primary-foreground shadow-lg`}><Users className="w-5 h-5" /></div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 text-green-600 border transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Recuperados</p>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-foreground">{metrics?.recuperados}</p>
                    <p className="text-sm text-muted-foreground font-medium">clientes recuperados</p>
                  </div>

                </div>
                <div className={`p-3 rounded-xl bg-green-500 text-white shadow-lg`}><UserCheck className="w-5 h-5" /></div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`relative overflow-hidden bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 text-yellow-600 border transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Em contato</p>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-foreground">{metrics?.em_contato}</p>
                    <p className="text-sm text-muted-foreground font-medium">clientes em contato</p>
                  </div>

                </div>
                <div className={`p-3 rounded-xl bg-yellow-500 text-white shadow-lg`}><PhoneCall className="w-5 h-5" /></div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`relative overflow-hidden bg-gradient-to-br from-rose-500/10 to-rose-500/5 border-rose-500/20 text-rose-600 border transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Sem resposta</p>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-foreground">{metrics?.sem_reposta}</p>
                    <p className="text-sm text-muted-foreground font-medium">clientes sem resposta</p>
                  </div>

                </div>
                <div className={`p-3 rounded-xl bg-rose-500 text-white shadow-lg`}><Clock className="w-5 h-5" /></div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`relative overflow-hidden bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20 text-red-600 border transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Não recuperado</p>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-foreground">{metrics?.nao_recuperado}</p>
                    <p className="text-sm text-muted-foreground font-medium">clientes não recuperado</p>
                  </div>

                </div>
                <div className={`p-3 rounded-xl bg-red-500 text-white shadow-lg`}><UserX className="w-5 h-5" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Filter className="h-5 w-5 text-blue-600" />
              Lista de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FilterClient />
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/50 border-b border-border/50">
                    <TableHead className="font-semibold text-foreground">ID Cliente</TableHead>
                    <TableHead className="font-semibold text-foreground">Nome</TableHead>
                    <TableHead className="font-semibold text-foreground">Score</TableHead>
                    <TableHead className="font-semibold text-foreground">Motivo Cancelamento</TableHead>
                    <TableHead className="font-semibold text-foreground">Status Contato</TableHead>
                    <TableHead className="font-semibold text-foreground">Contato</TableHead>
                    <TableHead className="font-semibold text-foreground">Data Contato</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Users className="h-12 w-12 opacity-50" />
                          <p className="text-lg font-medium">Nenhum cliente encontrado</p>
                          <p className="text-sm">Ajuste os filtros para ver mais resultados</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedItems?.map((cliente) => (
                      <TableRow
                        key={cliente.id_cliente}
                        className="hover:bg-muted/30 transition-colors border-b border-border/30"
                      >
                        <TableCell className="font-mono font-medium text-blue-600">{cliente.id_cliente}</TableCell>
                        <TableCell className="font-medium">{cliente.razao}</TableCell>
                        <TableCell>
                          <Badge className={`${getScoreBadgeColor(cliente.pontuacao)} font-bold border`}>
                            {cliente.pontuacao}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-600 border border-blue-500/20">
                            {cliente.motivo_cancelamento}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getContactStatusColor(cliente.etapa_contato)} border`}>
                            {getContactStatusLabel(cliente.etapa_contato)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <PhoneCall className="h-3 w-3 text-blue-600" />
                              <span className="font-medium">{cliente.contato_1}</span>
                            </div>
                            {cliente.contato_2 && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <PhoneCall className="h-3 w-3" />
                                <span>{cliente.contato_2}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-muted-foreground">
                          {cliente.data_contato_aceito}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted"
                                disabled={
                                  cliente.etapa_contato === "recuperado" || cliente.etapa_contato === "sem_resposta"
                                }
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleViewClient(cliente.id_cliente)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar Cliente
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={clienteByUserFilter?.length ?? 0}
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
