import { describe, it, expect, beforeEach } from "vitest";
import { RepositorioMemoria } from "./repositorioMemoria";
import {
  addMonthlyIncome,
  getMonthlyIncome,
  getTotalMonthlyIncome,
  getTotalMonthlyRecurringExpense,
} from "../services/receitasService";

const USER = "usuario_teste";

describe("receitasService", () => {
  let repo: RepositorioMemoria;

  beforeEach(() => {
    repo = new RepositorioMemoria();
  });

  it("addMonthlyIncome adiciona item do tipo income", () => {
    const item = addMonthlyIncome(
      { amount: 5000, description: "Salário", tipo: "income" },
      USER,
      repo,
    );
    expect(item.id).toBeDefined();
    expect(item.tipo).toBe("income");
    expect(getMonthlyIncome(USER, repo)).toHaveLength(1);
  });

  it("getTotalMonthlyIncome soma apenas itens tipo=income", () => {
    addMonthlyIncome({ amount: 5000, description: "Salário", tipo: "income" }, USER, repo);
    addMonthlyIncome({ amount: 1000, description: "Freelance", tipo: "income" }, USER, repo);
    addMonthlyIncome({ amount: 200, description: "Internet", tipo: "expense" }, USER, repo);

    const total = getTotalMonthlyIncome(USER, repo);
    expect(total).toBe(6000);
  });

  it("getTotalMonthlyRecurringExpense soma apenas itens tipo=expense", () => {
    addMonthlyIncome({ amount: 5000, description: "Salário", tipo: "income" }, USER, repo);
    addMonthlyIncome({ amount: 200, description: "Internet", tipo: "expense" }, USER, repo);
    addMonthlyIncome({ amount: 100, description: "Streaming", tipo: "expense" }, USER, repo);

    const total = getTotalMonthlyRecurringExpense(USER, repo);
    expect(total).toBe(300);
  });

  it("getTotalMonthlyIncome nao inclui itens tipo=expense", () => {
    addMonthlyIncome({ amount: 400, description: "Aluguel", tipo: "expense" }, USER, repo);

    const total = getTotalMonthlyIncome(USER, repo);
    expect(total).toBe(0);
  });
});
