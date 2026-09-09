
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinancas } from "@/contexts/FinancasContext";

interface FiltroTransacoesProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedAccount: string;
  onAccountChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

export const FiltroTransacoes = ({
  searchTerm,
  onSearchChange,
  selectedAccount,
  onAccountChange,
  selectedCategory,
  onCategoryChange,
}: FiltroTransacoesProps) => {
  const { contas, categorias } = useFinancas();

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Filtrar por descrição..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={selectedAccount} onValueChange={onAccountChange}>
        <SelectTrigger className="w-full md:w-44">
          <SelectValue placeholder="Todas as contas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as contas</SelectItem>
          {contas.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full md:w-44">
          <SelectValue placeholder="Todas as categorias" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {categorias.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
