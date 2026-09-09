
import { useFinancas } from "@/contexts/FinancasContext";
import { Transaction } from "@/types/finance";
import { formatCurrency } from "@/utils/formatters";
import {
  ArrowDownCircle, ArrowUpCircle, Receipt, CreditCard, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { transacoesParaMes } from "@/utils/recorrentes";

interface TransacoesRecentesProps {
  onViewAll?: () => void;
}

export const TransacoesRecentes = ({ onViewAll }: TransacoesRecentesProps) => {
  const { transacoes, categorias } = useFinancas();

  const mesAtual = new Date().toISOString().substring(0, 7);
  const txMesAtual = transacoesParaMes(transacoes, mesAtual);

  // Transações não-recorrentes de meses anteriores
  const txPassadas = transacoes.filter(
    tx => !tx.isRecurring && tx.date.substring(0, 7) < mesAtual
  );

  // Combina: transações do mês atual + passadas; deduplicadas por id
  const seen = new Set<string>();
  const recentes: Transaction[] = [...txMesAtual, ...txPassadas]
    .filter(tx => {
      if (seen.has(tx.id)) return false;
      seen.add(tx.id);
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const formatDate = (dateStr: string) =>
    new Date(dateStr + (dateStr.length === 10 ? "T00:00:00" : "")).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit",
    });

  const getCategoryColor = (categoryId: string) =>
    categorias.find(c => c.id === categoryId)?.color ?? "#94a3b8";

  const getCategoryName = (categoryId: string) =>
    categorias.find(c => c.id === categoryId)?.name ?? "Outros";

  const getIcon = (tx: Transaction) => {
    if (tx.installments) return <CreditCard className="w-5 h-5" />;
    if (tx.isRecurring) return <RefreshCw className="w-5 h-5" />;
    return tx.type === "income"
      ? <ArrowUpCircle className="w-5 h-5" />
      : <ArrowDownCircle className="w-5 h-5" />;
  };

  if (recentes.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="font-semibold mb-4 dark:text-gray-100">Transações recentes</h2>
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Receipt className="w-7 h-7 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-700 dark:text-gray-300">Nenhuma transação registrada</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Adicione sua primeira transação para visualizar o histórico
            </p>
          </div>
          {onViewAll && (
            <Button variant="outline" onClick={onViewAll} className="mt-1">
              Ver lançamentos
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="font-semibold mb-4 dark:text-gray-100">Transações recentes</h2>
      <div className="space-y-4">
        {recentes.map(tx => {
          const color = getCategoryColor(tx.categoryId);
          const catName = getCategoryName(tx.categoryId);
          const installmentLabel = tx.installments
            ? ` (${tx.installments.current}/${tx.installments.total})`
            : "";
          const recurringLabel = tx.isRecurring ? " (recorrente)" : "";

          return (
            <div key={`${tx.id}-${tx.date}`} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {getIcon(tx)}
                </div>
                <div>
                  <p className="font-medium dark:text-gray-100 text-sm">
                    {tx.description}{installmentLabel}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {catName} · {formatDate(tx.date)}{recurringLabel}
                  </p>
                </div>
              </div>
              <div className={`font-medium text-sm ${tx.type === "income" ? "text-green-500" : "text-red-500"}`}>
                {tx.type === "income" ? "+" : "-"} {formatCurrency(tx.amount)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <Button variant="outline" className="w-full" onClick={onViewAll}>Ver todas</Button>
      </div>
    </div>
  );
};
