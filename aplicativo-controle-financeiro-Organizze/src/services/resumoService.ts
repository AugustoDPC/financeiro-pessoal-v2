import { CategoryType } from "../types/finance";
import { IRepositorio } from "../repositorio/IRepositorio";
import { repositorio as repo } from "../repositorio/localStorageRepositorio";
import { obterMesAno } from "@/utils/datas";
import { defaultCategories } from "./categoriasService";
import { getTotalMonthlyIncome, getTotalMonthlyRecurringExpense } from "./receitasService";

export const getFinancialSummary = (
  userId: string,
  r: IRepositorio = repo,
): {
  totalIncome: number;
  totalExpenses: number;
  availableBalance: number;
  expensesByCategory: { categoryId: CategoryType; categoryName: string; color: string; amount: number }[];
} => {
  const data = r.carregar(userId);
  const thisMonth = obterMesAno();
  const monthlyTransactions = data.transactions.filter((t) => t.date.startsWith(thisMonth));

  const transactionExpenses = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactionExpenses + getTotalMonthlyRecurringExpense(userId, r);

  const transactionIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = getTotalMonthlyIncome(userId, r) + transactionIncome;

  const availableBalance = data.accounts.reduce((sum, a) => sum + a.balance, 0);

  const expensesByCategory = defaultCategories
    .map((cat) => ({
      categoryId: cat.id as CategoryType,
      categoryName: cat.name,
      color: cat.color,
      amount: monthlyTransactions
        .filter((t) => t.type === "expense" && t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0),
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return { totalIncome, totalExpenses, availableBalance, expensesByCategory };
};
