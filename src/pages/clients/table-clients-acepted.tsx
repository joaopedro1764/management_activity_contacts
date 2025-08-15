import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ClienteRecuperadoAtivo  } from "@/types/client";
import { Edit, Users } from "lucide-react";

interface TableClientsAceptedProps {
    setSelectedClient: (client: ClienteRecuperadoAtivo  | null) => void;
    acceptedClients: ClienteRecuperadoAtivo [] | undefined
}


export function TableClientsAcepted({ setSelectedClient, acceptedClients }: TableClientsAceptedProps) {

    function getStatusBadge(client: ClienteRecuperadoAtivo ) {
        if (client.recovered) {
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Recuperado</Badge>
        }
        if (client.contactStatus === "em_contato") {
            return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Em Contato</Badge>
        }
        if (client.contactStatus === "nao_atendeu") {
            return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Não Atendeu</Badge>
        }
        if (client.contactStatus === "") {
            return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Contato Encerrado</Badge>
        }
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Pendente</Badge>
    }

    const getScoreColor = (score: number) => {
        if (score >= 8) return "text-success font-semibold"
        if (score >= 6) return "text-warning font-semibold"
        if (score >= 4) return "text-orange-600 font-semibold"
        return "text-destructive font-semibold"
    }

    return (
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
                                            <button
                                            
                                                disabled={client.recovered || client.contactStatus === "sem_reposta"}
                                                className="disabled:cursor-not-allowed disabled:opacity-50 hover:text-blue-600"
                                                onClick={() => setSelectedClient(client)}
                                            >
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
    )
}