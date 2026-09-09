
import { useFinancas } from "@/contexts/FinancasContext";
import { CategoryType } from "@/types/finance";
import { formatCurrency } from "@/utils/formatters";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

export const DespesasPorCategoria = () => {
  const { resumo } = useFinancas();

  const data = (resumo.expensesByCategory ?? []).filter(cat => cat.amount > 0);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
        <h2 className="font-semibold mb-4 dark:text-gray-100">Maiores gastos por categoria</h2>
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <PieChartIcon className="w-7 h-7 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-700 dark:text-gray-300">Sem despesas no período</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Nenhuma despesa registrada neste mês</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <h2 className="font-semibold mb-4 dark:text-gray-100">Maiores gastos por categoria</h2>

      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
              nameKey="categoryName"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "var(--tooltip-bg, #fff)",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                color: "inherit",
              }}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: "var(--legend-color, #374151)", fontSize: "12px" }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2">
        {data.slice(0, 4).map((category, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm dark:text-gray-300">{category.categoryName}</span>
            </div>
            <span className="text-sm font-medium dark:text-gray-200">
              {formatCurrency(category.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
