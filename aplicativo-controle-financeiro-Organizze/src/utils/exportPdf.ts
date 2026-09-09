export function exportarRelatorioComoHTML(
  mes: string, // "YYYY-MM"
  totalReceitas: number,
  totalDespesas: number,
  saldoDisponivel: number,
  despesasPorCategoria: { categoryName: string; amount: number }[],
  transacoes: { description: string; date: string; amount: number; type: "income" | "expense" }[],
): void {
  const [ano, mesNum] = mes.split("-");
  const dataRef = new Date(Number(ano), Number(mesNum) - 1, 1);
  const mesAno = dataRef.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const titulo = `Relatório Financeiro - ${mesAno.charAt(0).toUpperCase()}${mesAno.slice(1)}`;

  const formatBRL = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const categoriaRows = despesasPorCategoria
    .map(
      (cat) => `<tr>
        <td>${cat.categoryName}</td>
        <td class="amount">${formatBRL(cat.amount)}</td>
      </tr>`,
    )
    .join("");

  const transacaoRows = transacoes
    .map((t) => {
      const data = new Date(t.date).toLocaleDateString("pt-BR");
      const tipoClass = t.type === "income" ? "income" : "expense";
      const sinal = t.type === "income" ? "+" : "-";
      return `<tr>
        <td>${t.description}</td>
        <td>${data}</td>
        <td class="amount ${tipoClass}">${sinal} ${formatBRL(t.amount)}</td>
      </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${titulo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; padding: 32px; }
    h1 { font-size: 20px; margin-bottom: 24px; color: #1e293b; }
    h2 { font-size: 15px; margin: 20px 0 8px; color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #f1f5f9; }
    th { background: #f8fafc; font-weight: 600; color: #475569; }
    .amount { text-align: right; font-variant-numeric: tabular-nums; }
    .income { color: #16a34a; }
    .expense { color: #dc2626; }
    .summary-table td:first-child { font-weight: 600; width: 60%; }
    .positive { color: #16a34a; }
    .negative { color: #dc2626; }
    @media print {
      body { padding: 16px; }
    }
  </style>
</head>
<body>
  <h1>${titulo}</h1>

  <h2>Resumo</h2>
  <table class="summary-table">
    <tr><td>Total de Receitas</td><td class="amount income">${formatBRL(totalReceitas)}</td></tr>
    <tr><td>Total de Despesas</td><td class="amount expense">${formatBRL(totalDespesas)}</td></tr>
    <tr><td>Saldo Disponível</td><td class="amount ${saldoDisponivel >= 0 ? "positive" : "negative"}">${formatBRL(saldoDisponivel)}</td></tr>
  </table>

  ${
    despesasPorCategoria.length > 0
      ? `<h2>Despesas por Categoria</h2>
  <table>
    <thead><tr><th>Categoria</th><th class="amount">Valor</th></tr></thead>
    <tbody>${categoriaRows}</tbody>
  </table>`
      : ""
  }

  ${
    transacoes.length > 0
      ? `<h2>Transações</h2>
  <table>
    <thead><tr><th>Descrição</th><th>Data</th><th class="amount">Valor</th></tr></thead>
    <tbody>${transacaoRows}</tbody>
  </table>`
      : ""
  }
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(html);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.print();
  }, 500);
}
