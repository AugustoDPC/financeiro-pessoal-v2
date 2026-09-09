import { describe, it, expect, beforeEach } from "vitest";
import { RepositorioMemoria } from "./repositorioMemoria";
import { getFinancialSummary } from "../services/resumoService";
import { addAccount } from "../services/contasService";
import { addTransaction } from "../services/transacoesService";
import { addMonthlyIncome } from "../services/receitasService";

const USER = "usuario_teste";

// Usa o mês atual para que as transações sejam consideradas pelo resumo
const mesAtual = new Date().toISOString().substring(0, 7); // "YYYY-MM"
const diaAtual = `${mesAtual}-10`;

describe("resumoService", () => {
  let repo: RepositorioMemoria;
  let accountId: string;

  beforeEach(() => {
    repo = new RepositorioMemoria();
    const conta = addAccount(
      { name: "Conta Principal", type: "checking", balance: 0 },
      USER,
      repo,
    );
    accountId = conta.id;
  });

  it("getFinancialSummary retorna totalIncome correto (receita mensal + receita em transacoes)", () => {
    // Receita mensal fixa
    addMonthlyIncome({ amount: 5000, description: "Salário", tipo: "income" }, USER, repo);

    // Receita via transacao no mês atual
    addTransaction(
      { description: "Freelance", amount: 1000, date: diaAtual, categoryId: "other", accountId, type: "income" },
      USER,
      repo,
    );

    const resumo = getFinancialSummary(USER, repo);
    expect(resumo.totalIncome).toBe(6000);
  });

  it("getFinancialSummary retorna totalExpenses correto (despesas de transacoes + despesas recorrentes)", () => {
    // Despesa recorrente
    addMonthlyIncome({ amount: 200, description: "Internet", tipo: "expense" }, USER, repo);

    // Despesa via transacao no mês atual
    addTransaction(
      { description: "Almoço", amount: 50, date: diaAtual, categoryId: "food", accountId, type: "expense" },
      USER,
      repo,
    );
    addTransaction(
      { description: "Transporte", amount: 30, date: diaAtual, categoryId: "transport", accountId, type: "expense" },
      USER,
      repo,
    );

    const resumo = getFinancialSummary(USER, repo);
    expect(resumo.totalExpenses).toBe(280); // 50 + 30 + 200
  });

  it("getFinancialSummary agrupa despesasPorCategoria corretamente", () => {
    addTransaction(
      { description: "Almoço", amount: 50, date: diaAtual, categoryId: "food", accountId, type: "expense" },
      USER,
      repo,
    );
    addTransaction(
      { description: "Jantar", amount: 70, date: diaAtual, categoryId: "food", accountId, type: "expense" },
      USER,
      repo,
    );
    addTransaction(
      { description: "Ônibus", amount: 30, date: diaAtual, categoryId: "transport", accountId, type: "expense" },
      USER,
      repo,
    );

    const resumo = getFinancialSummary(USER, repo);
    const porCategoria = resumo.expensesByCategory;

    const food = porCategoria.find((c) => c.categoryId === "food");
    const transport = porCategoria.find((c) => c.categoryId === "transport");

    expect(food).toBeDefined();
    expect(food!.amount).toBe(120);
    expect(transport).toBeDefined();
    expect(transport!.amount).toBe(30);

    // Categorias com valor 0 não aparecem
    expect(porCategoria.every((c) => c.amount > 0)).toBe(true);
  });

  it("getFinancialSummary nao considera transacoes de outros meses", () => {
    addTransaction(
      { description: "Passado", amount: 999, date: "2020-01-15", categoryId: "food", accountId, type: "expense" },
      USER,
      repo,
    );

    const resumo = getFinancialSummary(USER, repo);
    // despesas de transacoes = 0 (mes diferente), só recorrentes (nenhuma aqui)
    expect(resumo.totalExpenses).toBe(0);
  });
});
