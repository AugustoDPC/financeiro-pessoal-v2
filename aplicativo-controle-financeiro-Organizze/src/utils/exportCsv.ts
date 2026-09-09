import { Transaction, Account, Category } from "@/types/finance";

export function exportarTransacoesCSV(
  transacoes: Transaction[],
  contas: Account[],
  categorias: Category[],
  nomeArquivo = "lancamentos.csv",
) {
  const contaMap = new Map(contas.map((c) => [c.id, c.name]));
  const catMap = new Map(categorias.map((c) => [c.id, c.name]));

  const cabecalho = ["Data", "Descrição", "Tipo", "Categoria", "Conta", "Valor (R$)"];

  const linhas = transacoes.map((t) => [
    t.date,
    `"${t.description.replace(/"/g, '""')}"`,
    t.type === "income" ? "Receita" : "Despesa",
    catMap.get(t.categoryId) ?? t.categoryId,
    contaMap.get(t.accountId) ?? t.accountId,
    t.type === "expense" ? `-${t.amount.toFixed(2)}` : t.amount.toFixed(2),
  ]);

  const csv = [cabecalho, ...linhas].map((r) => r.join(";")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}
