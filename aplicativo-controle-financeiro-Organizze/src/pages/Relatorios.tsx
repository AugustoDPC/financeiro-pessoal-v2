
import { useState } from "react";
import { useFinancas } from "@/contexts/FinancasContext";
import { formatCurrency } from "@/utils/formatters";
import { transacoesParaMes } from "@/utils/recorrentes";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportarRelatorioComoHTML } from "@/utils/exportPdf";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";

const Relatorios = () => {
  const { transacoes, resumo, categorias } = useFinancas();
  const [dataAtual, setDataAtual] = useState(new Date());

  const mesAtual = dataAtual.toISOString().substring(0, 7);
  const mesAno = dataAtual.toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  const navegarMes = (direcao: 'prev' | 'next') => {
    const novaData = new Date(dataAtual);
    if (direcao === 'prev') {
      novaData.setMonth(novaData.getMonth() - 1);
    } else {
      novaData.setMonth(novaData.getMonth() + 1);
    }
    setDataAtual(novaData);
  };

  // Filtra transações pelo mês atual, incluindo recorrentes projetadas.
  const transacoesDoMes = transacoesParaMes(transacoes, mesAtual);

  // Calcula despesas por categoria no mês atual.
  const despesasPorCategoria = transacoesDoMes
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const existing = acc.find(item => item.categoryId === transaction.categoryId);
      if (existing) {
        existing.amount += transaction.amount;
      } else {
        const cat = categorias.find(c => c.id === transaction.categoryId);
        acc.push({
          categoryId: transaction.categoryId,
          categoryName: cat ? cat.name : 'Outros',
          color: cat ? cat.color : '#94a3b8',
          amount: transaction.amount,
        });
      }
      return acc;
    }, [] as { categoryId: string; categoryName: string; color: string; amount: number }[])
    .sort((a, b) => b.amount - a.amount);

  // Calcula receitas por categoria no mês atual.
  const receitasPorCategoria = transacoesDoMes
    .filter(t => t.type === 'income')
    .reduce((acc, transaction) => {
      acc.push({
        categoryName: transaction.description,
        amount: transaction.amount,
        color: '#10b981'
      });
      return acc;
    }, [] as { categoryName: string; amount: number; color: string }[]);

  const totalDespesas = despesasPorCategoria.reduce((sum, cat) => sum + cat.amount, 0);
  const totalReceitas = receitasPorCategoria.reduce((sum, cat) => sum + cat.amount, 0);
  const saldoDisponivel = totalReceitas - totalDespesas;

  const handleExportarPDF = () => {
    exportarRelatorioComoHTML(
      mesAtual,
      totalReceitas,
      totalDespesas,
      saldoDisponivel,
      despesasPorCategoria.map((c) => ({ categoryName: c.categoryName, amount: c.amount })),
      transacoesDoMes.map((t) => ({
        description: t.description,
        date: t.date,
        amount: t.amount,
        type: t.type,
      })),
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Relatórios</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportarPDF}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => navegarMes('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium capitalize min-w-28 sm:min-w-32 text-center text-sm sm:text-base">{mesAno}</span>
            <Button variant="ghost" size="icon" onClick={() => navegarMes('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seção de despesas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Despesas</h2>
          
          <div className="space-y-3 mb-6">
            {despesasPorCategoria.map((category) => (
              <div key={category.categoryId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm font-medium">{category.categoryName}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(category.amount)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {totalDespesas > 0 ? ((category.amount / totalDespesas) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {despesasPorCategoria.length > 0 && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={despesasPorCategoria}
                    dataKey="amount"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                  >
                    {despesasPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <div className="flex justify-between items-center font-semibold">
              <span>Total</span>
              <span>R$ {formatCurrency(totalDespesas)}</span>
            </div>
          </div>
        </div>

        {/* Seção de receitas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Receitas</h2>
          
          <div className="space-y-3 mb-6">
            {receitasPorCategoria.map((income, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: income.color }}
                  />
                  <span className="text-sm font-medium">{income.categoryName}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(income.amount)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {totalReceitas > 0 ? ((income.amount / totalReceitas) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {receitasPorCategoria.length > 0 && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={receitasPorCategoria}
                    dataKey="amount"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                  >
                    {receitasPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <div className="flex justify-between items-center font-semibold">
              <span>Total</span>
              <span>R$ {formatCurrency(totalReceitas)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
