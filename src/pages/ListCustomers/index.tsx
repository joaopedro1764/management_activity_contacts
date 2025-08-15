import { useState, useMemo } from "react";
import {
  Filter,
  MoreHorizontal,
  PhoneCall,
  Edit,
  CircleCheckBig,
  PhoneOff,
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
import { format } from "date-fns";
import { ClientListFilter } from "./FilterListBySeller";
import { useNavigate, useSearchParams } from "react-router";

function getScoreBadgeColor(score: number) {
  if (score >= 80)
    return "bg-gradient-to-r from-emerald-500 to-green-500 text-white";
  if (score >= 60)
    return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white";
  return "bg-gradient-to-r from-red-500 to-rose-500 text-white";
}

function getContactStatusColor(status: string) {
  switch (status) {
    case "em_contato":
      return "bg-yellow-500 text-white border border-yellow-200";
    case "sem_resposta":
      return "bg-gray-500 text-white border border-gray-200";
    case "nao_atendeu":
      return "bg-orange-500 text-white border border-orange-200";
    case "recuperado":
      return "bg-green-500 text-white border border-green-200";
      case "nao_recuperado":
      return "bg-red-500 text-white border border-red-200";
    default:
      return "bg-gray-500 text-white";
  }
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

  console.log(clientFilterByWinner);

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
      const taxaRecuperacao =
        total > 0 ? Math.round((recuperados / total) * 100) : 0;

      return {
        total,
        recuperados,
        em_contato,
        sem_reposta,
        taxaRecuperacao,
      };
    }
  }, [clientFilterByWinner]);

  const handleViewClient = (clienteId: string) => {
    navigate(`/listaClientes/${clienteId}`);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Dashboard do Vendedor
            </h1>
            <p className="text-slate-600 mt-1">
              Gerencie seus clientes e acompanhe suas métricas
            </p>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border-blue-400 border-2 rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500 text-white">
                    <CircleCheckBig className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-blue-500 uppercase tracking-wide">
                    Total de clientes
                  </h3>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex flex-col items-baseline space-x-2">
                  <span className="text-5xl font-bold text-gray-900">
                    {metrics?.total}
                  </span>
                  <span className="text-xl text-blue-500 font-medium">
                    clientes aceitos
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-green-400 border-2 rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-500 text-white">
                    <CircleCheckBig className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-green-500 uppercase tracking-wide">
                    Recuperados
                  </h3>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex flex-col items-baseline space-x-2">
                  <span className="text-5xl font-bold text-gray-900">
                    {metrics?.recuperados}
                  </span>
                  <span className="text-xl text-green-500 font-medium">
                    clientes recuperados
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-yellow-400 border-2 rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-yellow-500 text-white">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-yellow-500 uppercase tracking-wide">
                    Em Contato
                  </h3>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex flex-col items-baseline space-x-2">
                  <span className="text-5xl font-bold text-gray-900">
                    {metrics?.em_contato}
                  </span>
                  <span className="text-xl text-yellow-500 font-medium">
                    clientes em processo de contato
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white border-red-400 border-2 rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-red-500 text-white">
                    <PhoneOff className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wide">
                    Sem reposta
                  </h3>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex flex-col items-baseline space-x-2">
                  <span className="text-5xl font-bold text-gray-900">
                    {metrics?.sem_reposta}
                  </span>
                  <span className="text-xl text-red-500 font-medium">
                    clientes sem resposta
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Filter className="h-5 w-5 text-blue-600" />
              Lista de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ClientListFilter />
            <div className="rounded-lg border border-slate-200 overflow-hidden p-2">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50">
                    <TableHead className="cursor-pointer hover:bg-slate-100 transition-colors">
                      ID cliente
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-slate-100 transition-colors">
                      Nome
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-slate-100 transition-colors">
                      Score
                    </TableHead>
                    <TableHead>Motivo cancelamento</TableHead>
                    <TableHead>Status Contato</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead className="cursor-pointer hover:bg-slate-100 transition-colors">
                      Data contato aceito
                    </TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-gray-500 font-medium"
                      >
                        Nenhum cliente encontrado
                      </TableCell>
                    </TableRow>
                  )}
                  {paginatedItems?.map((cliente) => (
                    <TableRow
                      key={cliente.id_cliente}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {cliente.id_cliente}
                      </TableCell>
                      <TableCell className="font-medium">
                        {cliente.razao}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getScoreBadgeColor(
                            cliente.pontuacao
                          )} font-bold`}
                        >
                          {cliente.pontuacao}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white font-bold px-3 py-1 rounded-md">
                          {cliente.motivo_cancelamento}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getContactStatusColor(
                            cliente.etapa_contato
                          )}
                        >
                          {getContactStatusLabel(cliente.etapa_contato)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <span className="text-sm text-blue-500 font-medium gap-1 flex items-center">
                            <PhoneCall className="w-4 h-4" />
                            {cliente.contato_1}
                          </span>
                          {cliente.contato_2 && (
                            <span className="text-sm text-blue-500 font-medium flex gap-1 items-center">
                              <PhoneCall className="w-4 h-4" />
                              {cliente.contato_2}
                            </span>
                          )}
                          {cliente.contato_3 && (
                            <span className="text-sm text-blue-500 font-medium flex gap-1 items-center">
                              <PhoneCall className="w-4 h-4" />
                              {cliente.contato_3}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="font-medium">
                        {cliente.data_contato_aceito}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              disabled={
                                cliente.etapa_contato === "recuperado" ||
                                cliente.etapa_contato === "sem_resposta"
                              }
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleViewClient(cliente.id_cliente)
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
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
