
import { useFinancas } from "@/contexts/FinancasContext";
import { formatCurrency } from "@/utils/formatters";
import { CreditCard, CalendarClock } from "lucide-react";

interface GrupoParcelamento {
  installmentId: string;
  description: string;
  amountPerInstallment: number;
  total: number;
  paid: number;
  remaining: number;
  nextDate: string;
  endDate: string;
}

export const ResumoParcelamentos = () => {
  const { transacoes } = useFinancas();
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Agrupa todas as transações parceladas por installmentId.
  const grupos = new Map<string, GrupoParcelamento>();

  transacoes.forEach((t) => {
    if (!t.installments) return;
    const { installmentId, total, current, originalAmount } = t.installments;

    if (!grupos.has(installmentId)) {
      grupos.set(installmentId, {
        installmentId,
        description: t.description,
        amountPerInstallment: t.amount,
        total,
        paid: 0,
        remaining: 0,
        nextDate: "",
        endDate: "",
      });
    }

    const g = grupos.get(installmentId)!;
    const txDate = new Date(t.date + "T00:00:00");

    if (txDate <= hoje) {
      g.paid = Math.max(g.paid, current);
    }

    if (!g.endDate || t.date > g.endDate) g.endDate = t.date;
    if (txDate > hoje && (!g.nextDate || t.date < g.nextDate)) g.nextDate = t.date;
  });

  // Filtra apenas parcelamentos ainda em andamento.
  const ativos = Array.from(grupos.values())
    .map((g) => ({ ...g, remaining: g.total - g.paid }))
    .filter((g) => g.remaining > 0)
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate));

  if (ativos.length === 0) return null;

  const formatDate = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { month: "short", year: "numeric" });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <CalendarClock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <h2 className="font-semibold dark:text-gray-100">Parcelamentos ativos</h2>
        <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5">
          {ativos.length}
        </span>
      </div>

      <div className="space-y-3">
        {ativos.map((g) => (
          <div key={g.installmentId} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CreditCard className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate dark:text-gray-200">{g.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {g.paid}/{g.total} pagas · término {formatDate(g.endDate)}
              </p>
              <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-400"
                  style={{ width: `${Math.round((g.paid / g.total) * 100)}%` }}
                />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-red-500">
                -{formatCurrency(g.amountPerInstallment)}
              </p>
              <p className="text-xs text-gray-400">
                {g.remaining}x restantes
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
