// Re-exporta de cada serviço específico.
// Mantido para compatibilidade com imports existentes — prefira importar
// diretamente de contasService, transacoesService, receitasService, etc.

export { defaultCategories, getCategoryById } from "./categoriasService";
export { getAccounts, addAccount, updateAccount, deleteAccount } from "./contasService";
export {
  getTransactions,
  addTransaction,
  addInstallmentTransaction,
  updateTransaction,
  deleteTransaction,
} from "./transacoesService";
export {
  getMonthlyIncome,
  getTotalMonthlyIncome,
  getTotalMonthlyRecurringExpense,
  addMonthlyIncome,
  updateMonthlyIncome,
  deleteMonthlyIncome,
} from "./receitasService";
export { getFinancialSummary } from "./resumoService";
export { getMetas, addMeta, updateMeta, deleteMeta } from "./metasService";

// Expõe o repositório diretamente para quem precisar de acesso de baixo nível.
export { repositorio } from "../repositorio/localStorageRepositorio";
import { repositorio } from "../repositorio/localStorageRepositorio";
import { UserFinancialData } from "../types/finance";

export const getFinancialData = (userId?: string): UserFinancialData => {
  if (!userId) return { accounts: [], transactions: [], monthlyIncome: [], totalIncome: 0 };
  return repositorio.carregar(userId);
};

export const saveFinancialData = (data: UserFinancialData, userId?: string): void => {
  if (!userId) return;
  repositorio.salvar(data, userId);
};
