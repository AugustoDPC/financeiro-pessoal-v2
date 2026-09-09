
import { useFinancas } from "@/contexts/FinancasContext";
import { formatCurrency } from "@/utils/formatters";
import { Card } from "@/components/ui/card";
import { transacoesParaMes } from "@/utils/recorrentes";

interface ResumoSaldoProps {
  selectedAccount: string;
  currentMonth: string;
  searchTerm?: string;
  selectedCategory?: string;
}

export const ResumoSaldo = ({ selectedAccount, currentMonth, searchTerm = "", selectedCategory = "all" }: ResumoSaldoProps) => {
  const { contas, transacoes } = useFinancas();

  const getBalanceInfo = () => {
    let txs = transacoesParaMes(transacoes, currentMonth);

    // Aplica os mesmos filtros de ListaTransacoes
    if (searchTerm) {
      const termo = searchTerm.toLowerCase();
      txs = txs.filter(t => {
        const conta = contas.find(a => a.id === t.accountId);
        return (
          t.description.toLowerCase().includes(termo) ||
          (conta ? conta.name.toLowerCase().includes(termo) : false)
        );
      });
    }

    if (selectedAccount !== "all") {
      txs = txs.filter(t => t.accountId === selectedAccount);
    }

    if (selectedCategory !== "all") {
      txs = txs.filter(t => t.categoryId === selectedCategory);
    }

    const income   = txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const balance  = income - expenses;

    let label = "Saldo geral";
    if (selectedAccount !== "all") {
      const account = contas.find(a => a.id === selectedAccount);
      label = account ? account.name : "Conta não encontrada";
    }
    if (selectedCategory !== "all" || searchTerm) {
      label = "Resultado dos filtros";
    }

    return { income, expenses, balance, accountName: label };
  };

  const { income, expenses, balance, accountName } = getBalanceInfo();

  return (
    <Card className="p-4 mt-6">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{accountName} — Resumo do mês</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Receitas</p>
            <p className="font-bold text-lg text-green-600">{formatCurrency(income)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Despesas</p>
            <p className="font-bold text-lg text-red-600">{formatCurrency(expenses)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Saldo</p>
            <p className={`font-bold text-lg ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
