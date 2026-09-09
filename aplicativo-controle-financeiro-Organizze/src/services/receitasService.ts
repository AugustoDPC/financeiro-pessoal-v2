import { MonthlyIncome } from "../types/finance";
import { IRepositorio } from "../repositorio/IRepositorio";
import { repositorio as repo } from "../repositorio/localStorageRepositorio";

export const getMonthlyIncome = (userId: string, r: IRepositorio = repo): MonthlyIncome[] =>
  r.carregar(userId).monthlyIncome;

export const getTotalMonthlyIncome = (userId: string, r: IRepositorio = repo): number =>
  getMonthlyIncome(userId, r)
    .filter((i) => !i.tipo || i.tipo === "income")
    .reduce((sum, i) => sum + i.amount, 0);

export const getTotalMonthlyRecurringExpense = (userId: string, r: IRepositorio = repo): number =>
  getMonthlyIncome(userId, r)
    .filter((i) => i.tipo === "expense")
    .reduce((sum, i) => sum + i.amount, 0);

export const addMonthlyIncome = (
  income: Omit<MonthlyIncome, "id">,
  userId: string,
  r: IRepositorio = repo,
): MonthlyIncome => {
  const data = r.carregar(userId);
  const newIncome: MonthlyIncome = { ...income, id: crypto.randomUUID() };
  data.monthlyIncome.push(newIncome);
  data.totalIncome = data.monthlyIncome.filter((i) => !i.tipo || i.tipo === "income").reduce((sum, i) => sum + i.amount, 0);
  r.salvar(data, userId);
  return newIncome;
};

export const updateMonthlyIncome = (
  income: MonthlyIncome,
  userId: string,
  r: IRepositorio = repo,
): void => {
  const data = r.carregar(userId);
  const index = data.monthlyIncome.findIndex((i) => i.id === income.id);
  if (index !== -1) {
    data.monthlyIncome[index] = income;
    data.totalIncome = data.monthlyIncome.filter((i) => !i.tipo || i.tipo === "income").reduce((sum, i) => sum + i.amount, 0);
    r.salvar(data, userId);
  }
};

export const deleteMonthlyIncome = (
  incomeId: string,
  userId: string,
  r: IRepositorio = repo,
): void => {
  const data = r.carregar(userId);
  data.monthlyIncome = data.monthlyIncome.filter((i) => i.id !== incomeId);
  data.totalIncome = data.monthlyIncome.filter((i) => !i.tipo || i.tipo === "income").reduce((sum, i) => sum + i.amount, 0);
  r.salvar(data, userId);
};
