import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClientSearchProps } from "@/types/client";
import { Search, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import type z from "zod";

export type ClienteSearchProps = z.infer<typeof ClientSearchProps>;

export const ClientListFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("statusFilter");
  const idClientOrNameClient = searchParams.get("idClientOrNameClient");

  const { register, handleSubmit, reset, control } = useForm({
    values: {
      idClientOrNameClient: idClientOrNameClient ?? "",
      statusFilter: statusFilter ?? "todos",
    },
  });

  function handleFilter(filters: ClienteSearchProps) {
    setSearchParams((state) => {
      Object.entries(filters).forEach(([key, value]) => {
        const isString = typeof value === "string";
        if (!value || (isString && value === "todos")) {
          state.delete(key);
        } else {
      
          state.set(key, value);
        }
      });
      return state;
    });
  }

  function handleClearAllFilters() {
    setSearchParams(new URLSearchParams());
    reset();
  }

  return (
    <form
      onSubmit={handleSubmit(handleFilter)}
      className="flex flex-col md:flex-row gap-4 mb-6"
    >
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            {...register("idClientOrNameClient")}
            placeholder="Buscar por nome ou ID"
            className="pl-10 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400"
          />
        </div>
      </div>

      <Controller
        name="statusFilter"
        control={control}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="w-full md:w-48 bg-white border-slate-200">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="recuperado">Recuperado</SelectItem>
              <SelectItem value="sem_reposta">
                Sem reposta
              </SelectItem>
              <SelectItem value="em_contato">Em Contato</SelectItem>
              <SelectItem value="nao_atendeu">Não atendeu</SelectItem>
              <SelectItem value="nao_recuperado">Não Recuperado</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      <Button type="submit" className="w-full md:w-auto">
        <Search className="w-5 h-5" />
      </Button>
      <Button
        onClick={handleClearAllFilters}
        type="button"
        className="w-full md:w-auto bg-gray-500 hover:bg-gray-400"
      >
        <X className="w-5 h-5" />
      </Button>
    </form>
  );
};
