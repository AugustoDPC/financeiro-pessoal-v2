import { Transaction } from "@/types/finance";

/**
 * Retorna as transações que devem aparecer em `mesAlvo` (formato "YYYY-MM").
 *
 * Regras:
 * - Não-recorrentes: incluídas apenas se a data da transação pertencer ao mesAlvo.
 * - Recorrentes (isRecurring = true):
 *     • Incluídas se iniciaram em mesAlvo ou antes (mesTx <= mesAlvo).
 *     • Paradas se recurringEndDate < mesAlvo.
 *     • Cópias virtuais têm `date` projetada para o dia do mês alvo
 *       e `originalDate` preservando a data real do banco.
 *
 * Garante que não há duplicatas: cada transação aparece no máximo uma vez.
 */
export function transacoesParaMes(
  transacoes: Transaction[],
  mesAlvo: string,
): Transaction[] {
  const resultado: Transaction[] = [];

  for (const tx of transacoes) {
    const mesTx = tx.date.substring(0, 7); // "YYYY-MM"

    if (!tx.isRecurring) {
      // Não-recorrente: aparece somente no próprio mês.
      if (mesTx === mesAlvo) {
        resultado.push(tx);
      }
    } else {
      // Recorrente: aparece a partir do mês de criação até o fim da recorrência.
      if (mesTx <= mesAlvo) {
        const fimRecorrencia = tx.recurringEndDate ?? "9999-12";
        if (mesAlvo <= fimRecorrencia) {
          const dia = tx.date.substring(8, 10); // "DD"
          resultado.push({
            ...tx,
            date: `${mesAlvo}-${dia}`,
            // Preserva a data original para que o formulário de edição
            // salve o registro certo no banco.
            originalDate: tx.originalDate ?? tx.date,
          });
        }
      }
    }
  }

  return resultado;
}

/**
 * Calcula o mês anterior a `mes` (formato "YYYY-MM").
 * Exemplo: "2025-01" → "2024-12"
 */
export function mesAnterior(mes: string): string {
  const [year, month] = mes.split("-").map(Number);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
}
