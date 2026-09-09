import { describe, it, expect, beforeEach } from "vitest";
import { RepositorioMemoria } from "./repositorioMemoria";
import {
  addTransaction,
  deleteTransaction,
  addInstallmentTransaction,
  getTransactions,
} from "../services/transacoesService";
import { addAccount } from "../services/contasService";

const USER = "usuario_teste";

describe("transacoesService", () => {
  let repo: RepositorioMemoria;
  let accountId: string;

  beforeEach(() => {
    repo = new RepositorioMemoria();
    const conta = addAccount(
      { name: "Conta Teste", type: "checking", balance: 1000 },
      USER,
      repo,
    );
    accountId = conta.id;
  });

  it("addTransaction adiciona transacao e ajusta saldo da conta (despesa)", () => {
    addTransaction(
      {
        description: "Almoço",
        amount: 50,
        date: "2025-01-15",
        categoryId: "food",
        accountId,
        type: "expense",
      },
      USER,
      repo,
    );

    const contas = repo.carregar(USER).accounts;
    expect(contas[0].balance).toBe(950);
    expect(getTransactions(USER, repo)).toHaveLength(1);
  });

  it("addTransaction adiciona transacao e ajusta saldo da conta (receita)", () => {
    addTransaction(
      {
        description: "Salário",
        amount: 3000,
        date: "2025-01-05",
        categoryId: "other",
        accountId,
        type: "income",
      },
      USER,
      repo,
    );

    const contas = repo.carregar(USER).accounts;
    expect(contas[0].balance).toBe(4000);
  });

  it("deleteTransaction remove transacao e restaura saldo (despesa passada)", () => {
    const tx = addTransaction(
      {
        description: "Compra",
        amount: 100,
        date: "2020-01-01",
        categoryId: "food",
        accountId,
        type: "expense",
      },
      USER,
      repo,
    );

    deleteTransaction(tx.id, USER, repo);

    const contas = repo.carregar(USER).accounts;
    // saldo volta a 1000 pois a data é passada
    expect(contas[0].balance).toBe(1000);
    expect(getTransactions(USER, repo)).toHaveLength(0);
  });

  it("addInstallmentTransaction cria N transacoes com campos de parcela corretos", () => {
    const txs = addInstallmentTransaction(
      {
        description: "Notebook",
        totalAmount: 3000,
        installments: 3,
        startDate: "2025-01-01",
        categoryId: "other",
        accountId,
      },
      USER,
      repo,
    );

    expect(txs).toHaveLength(3);
    expect(txs[0].installments?.total).toBe(3);
    expect(txs[0].installments?.current).toBe(1);
    expect(txs[1].installments?.current).toBe(2);
    expect(txs[2].installments?.current).toBe(3);
    expect(txs[0].installments?.originalAmount).toBe(3000);

    // todas devem ter o mesmo installmentId
    const ids = txs.map((t) => t.installments?.installmentId);
    expect(ids[0]).toBe(ids[1]);
    expect(ids[1]).toBe(ids[2]);

    // valor de cada parcela
    expect(txs[0].amount).toBeCloseTo(1000, 1);
  });

  it("filtra transacoes por mes (apenas 2025-01)", () => {
    addTransaction(
      { description: "Jan", amount: 10, date: "2025-01-10", categoryId: "food", accountId, type: "expense" },
      USER,
      repo,
    );
    addTransaction(
      { description: "Fev", amount: 20, date: "2025-02-10", categoryId: "food", accountId, type: "expense" },
      USER,
      repo,
    );
    addTransaction(
      { description: "Dez", amount: 30, date: "2024-12-31", categoryId: "food", accountId, type: "expense" },
      USER,
      repo,
    );

    const jan = getTransactions(USER, repo).filter((t) => t.date.startsWith("2025-01"));
    expect(jan).toHaveLength(1);
    expect(jan[0].description).toBe("Jan");
  });
});
