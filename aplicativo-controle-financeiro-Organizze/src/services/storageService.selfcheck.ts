import { addAccount, addInstallmentTransaction, addTransaction, deleteTransaction, getAccounts, getTransactions, saveFinancialData, updateTransaction } from "./storageService";

export function executarAutoTesteStorageService(): string[] {
  const userId = "selfcheck_user";
  const resultados: string[] = [];
  saveFinancialData({ accounts: [], transactions: [], monthlyIncome: [], totalIncome: 0 }, userId);

  const conta = addAccount({ name: "Conta Teste", type: "checking", balance: 0 }, userId);
  if (!conta) throw new Error("Falha ao criar conta");

  const tx = addTransaction({ description: "Salário", amount: 1000, date: "2026-05-01", categoryId: "other", accountId: conta.id, type: "income" }, userId);
  resultados.push(getAccounts(userId)[0].balance === 1000 ? "saldo_ok" : "saldo_falhou");

  updateTransaction({ ...tx, amount: 1500 }, userId);
  resultados.push(getAccounts(userId)[0].balance === 1500 ? "edicao_ok" : "edicao_falhou");

  addInstallmentTransaction({ description: "Notebook", totalAmount: 1200, installments: 3, startDate: "2026-01-01", categoryId: "other", accountId: conta.id }, userId);
  const parcelas = getTransactions(userId).filter((t) => t.description === "Notebook");
  resultados.push(parcelas.length === 3 ? "parcelas_ok" : "parcelas_falhou");

  deleteTransaction(tx.id, userId);
  resultados.push(getTransactions(userId).some((t) => t.id === tx.id) ? "exclusao_falhou" : "exclusao_ok");

  return resultados;
}
