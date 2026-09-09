
import { useFinancas } from "@/contexts/FinancasContext";
import { formatCurrency } from "@/utils/formatters";
import { Eye, EyeOff } from "lucide-react";
import { transacoesParaMes } from "@/utils/recorrentes";

interface CartaoSaldoProps {
  showBalance: boolean;
  onToggle: () => void;
}

export const CartaoSaldo = ({ showBalance, onToggle }: CartaoSaldoProps) => {
  const { transacoes } = useFinancas();

  const getCurrentMonthTotals = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getFullYear() + '-' + String(currentDate.getMonth() + 1).padStart(2, '0');
    const txMes = transacoesParaMes(transacoes, currentMonth);

    const receitaMensal = txMes
      .filter(t => t.type === 'income')
      .reduce((total, t) => total + t.amount, 0);

    const despesasMensais = txMes
      .filter(t => t.type === 'expense')
      .reduce((total, t) => total + t.amount, 0);

    return { income: receitaMensal, expenses: despesasMensais, balance: receitaMensal - despesasMensais };
  };

  const monthlyTotals = getCurrentMonthTotals();
  const mask = "••••••";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-end items-center mb-2">
        <button onClick={onToggle}>
          {showBalance ? (
            <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <EyeOff className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>
      <div className="flex items-center mb-2">
        <div className="text-2xl font-bold">
          {showBalance ? formatCurrency(monthlyTotals.balance) : mask}
        </div>
      </div>
      <div className="flex justify-between text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">receita mensal</p>
          <p className="text-green-500">
            + {showBalance ? formatCurrency(monthlyTotals.income) : mask}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">despesas mensais</p>
          <p className="text-red-500">
            - {showBalance ? formatCurrency(monthlyTotals.expenses) : mask}
          </p>
        </div>
      </div>
    </div>
  );
};
