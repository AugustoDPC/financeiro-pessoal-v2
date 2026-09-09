import { describe, it, expect, beforeEach } from "vitest";
import { RepositorioMemoria } from "./repositorioMemoria";
import {
  addAccount,
  getAccounts,
  updateAccount,
  deleteAccount,
} from "../services/contasService";
import { addTransaction } from "../services/transacoesService";

const USER = "usuario_teste";

describe("contasService", () => {
  let repo: RepositorioMemoria;

  beforeEach(() => {
    repo = new RepositorioMemoria();
  });

  it("addAccount cria conta com id", () => {
    const conta = addAccount(
      { name: "Nubank", type: "checking", balance: 1000, color: "#8A05BE" },
      USER,
      repo,
    );
    expect(conta.id).toBeDefined();
    expect(conta.name).toBe("Nubank");
    expect(conta.balance).toBe(1000);
  });

  it("getAccounts retorna lista de contas", () => {
    addAccount({ name: "Conta 1", type: "checking", balance: 500 }, USER, repo);
    addAccount({ name: "Conta 2", type: "savings", balance: 2000 }, USER, repo);
    const contas = getAccounts(USER, repo);
    expect(contas).toHaveLength(2);
  });

  it("updateAccount modifica conta existente", () => {
    const conta = addAccount(
      { name: "Antiga", type: "checking", balance: 100 },
      USER,
      repo,
    );
    updateAccount({ ...conta, name: "Nova", balance: 200 }, USER, repo);
    const contas = getAccounts(USER, repo);
    expect(contas[0].name).toBe("Nova");
    expect(contas[0].balance).toBe(200);
  });

  it("deleteAccount remove a conta e suas transacoes", () => {
    const conta = addAccount(
      { name: "Para remover", type: "checking", balance: 500 },
      USER,
      repo,
    );
    addTransaction(
      {
        description: "Compra",
        amount: 50,
        date: "2025-01-10",
        categoryId: "food",
        accountId: conta.id,
        type: "expense",
      },
      USER,
      repo,
    );

    deleteAccount(conta.id, USER, repo);

    const contas = getAccounts(USER, repo);
    expect(contas).toHaveLength(0);

    const data = repo.carregar(USER);
    expect(data.transactions).toHaveLength(0);
  });
});
