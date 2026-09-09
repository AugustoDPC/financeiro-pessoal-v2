import { addMonths, format } from "date-fns";
import { Transaction, CategoryType } from "../types/finance";
import { IRepositorio } from "../repositorio/IRepositorio";
import { repositorio as repo } from "../repositorio/localStorageRepositorio";
import { dataEhPassadaOuAtual, dataParaIsoDia } from "@/utils/datas";

export const getTransactions = (userId: string, r: IRepositorio = repo): Transaction[] =>
  r.carregar(userId).transactions;

export const addTransaction = (
  transaction: Omit<Transaction, "id">,
  userId: string,
  r: IRepositorio = repo,
): Transaction => {
  const data = r.carregar(userId);
  const newTransaction: Transaction = { ...transaction, id: crypto.randomUUID() };
  data.transactions.push(newTransaction);

  const accountIndex = data.accounts.findIndex((a) => a.id === transaction.accountId);
  if (accountIndex !== -1) {
    if (transaction.type === "income") {
      data.accounts[accountIndex].balance += transaction.amount;
    } else {
      data.accounts[accountIndex].balance -= transaction.amount;
    }
  }

  r.salvar(data, userId);
  return newTransaction;
};

export const addInstallmentTransaction = (
  input: {
    description: string;
    totalAmount: number;
    installments: number;
    startDate: string;
    categoryId: CategoryType;
    accountId: string;
  },
  userId: string,
  r: IRepositorio = repo,
): Transaction[] => {
  const data = r.carregar(userId);
  const installmentAmount = Number((input.totalAmount / input.installments).toFixed(2));
  const installmentId = crypto.randomUUID();
  const created: Transaction[] = [];
  const now = new Date();

  for (let i = 0; i < input.installments; i++) {
    const date = format(addMonths(new Date(input.startDate), i), "yyyy-MM-dd");
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      description: input.description,
      amount: installmentAmount,
      date,
      categoryId: input.categoryId,
      accountId: input.accountId,
      type: "expense",
      installments: {
        total: input.installments,
        current: i + 1,
        originalAmount: input.totalAmount,
        installmentId,
      },
    };

    data.transactions.push(transaction);
    created.push(transaction);

    if (new Date(date) <= now) {
      const accountIndex = data.accounts.findIndex((a) => a.id === input.accountId);
      if (accountIndex !== -1) {
        data.accounts[accountIndex].balance -= installmentAmount;
      }
    }
  }

  r.salvar(data, userId);
  return created;
};

export const updateTransaction = (
  transaction: Transaction,
  userId: string,
  r: IRepositorio = repo,
): void => {
  const data = r.carregar(userId);
  const oldTransaction = data.transactions.find((t) => t.id === transaction.id);
  if (!oldTransaction) return;

  const now = new Date();

  if (oldTransaction.installments?.installmentId) {
    const installmentId = oldTransaction.installments.installmentId;
    const related = data.transactions.filter(
      (t) => t.installments?.installmentId === installmentId,
    );

    const baseDate = new Date(transaction.date);
    baseDate.setMonth(baseDate.getMonth() - (oldTransaction.installments.current - 1));

    related.forEach((rel) => {
      const index = data.transactions.findIndex((t) => t.id === rel.id);
      if (index === -1) return;

      const oldTx = data.transactions[index];

      if (dataEhPassadaOuAtual(oldTx.date, now)) {
        const oldAccIdx = data.accounts.findIndex((a) => a.id === oldTx.accountId);
        if (oldAccIdx !== -1) {
          data.accounts[oldAccIdx].balance +=
            oldTx.type === "income" ? -oldTx.amount : oldTx.amount;
        }
      }

      const newDate = dataParaIsoDia(
        new Date(
          baseDate.getFullYear(),
          baseDate.getMonth() + (rel.installments!.current - 1),
          baseDate.getDate(),
        ),
      );

      data.transactions[index] = {
        ...oldTx,
        description: transaction.description,
        amount: transaction.amount,
        categoryId: transaction.categoryId,
        accountId: transaction.accountId,
        date: newDate,
        installments: {
          ...oldTx.installments!,
          originalAmount: transaction.amount * oldTx.installments!.total,
        },
      };

      if (dataEhPassadaOuAtual(newDate, now)) {
        const newAccIdx = data.accounts.findIndex((a) => a.id === transaction.accountId);
        if (newAccIdx !== -1) {
          data.accounts[newAccIdx].balance +=
            transaction.type === "income" ? transaction.amount : -transaction.amount;
        }
      }
    });
  } else {
    const index = data.transactions.findIndex((t) => t.id === transaction.id);
    if (index === -1) return;

    if (dataEhPassadaOuAtual(oldTransaction.date, now)) {
      const oldAccIdx = data.accounts.findIndex((a) => a.id === oldTransaction.accountId);
      if (oldAccIdx !== -1) {
        data.accounts[oldAccIdx].balance +=
          oldTransaction.type === "income" ? -oldTransaction.amount : oldTransaction.amount;
      }
    }

    if (dataEhPassadaOuAtual(transaction.date, now)) {
      const newAccIdx = data.accounts.findIndex((a) => a.id === transaction.accountId);
      if (newAccIdx !== -1) {
        data.accounts[newAccIdx].balance +=
          transaction.type === "income" ? transaction.amount : -transaction.amount;
      }
    }

    data.transactions[index] = transaction;
  }

  r.salvar(data, userId);
};

export const deleteTransaction = (
  transactionId: string,
  userId: string,
  r: IRepositorio = repo,
): void => {
  const data = r.carregar(userId);
  const transaction = data.transactions.find((t) => t.id === transactionId);
  if (!transaction) return;

  const now = new Date();

  if (transaction.installments?.installmentId) {
    const installmentId = transaction.installments.installmentId;
    const related = data.transactions.filter(
      (t) => t.installments?.installmentId === installmentId,
    );

    related.forEach((rel) => {
      if (dataEhPassadaOuAtual(rel.date, now)) {
        const accIdx = data.accounts.findIndex((a) => a.id === rel.accountId);
        if (accIdx !== -1) {
          data.accounts[accIdx].balance +=
            rel.type === "income" ? -rel.amount : rel.amount;
        }
      }
    });

    data.transactions = data.transactions.filter(
      (t) => t.installments?.installmentId !== installmentId,
    );
  } else {
    if (dataEhPassadaOuAtual(transaction.date, now)) {
      const accIdx = data.accounts.findIndex((a) => a.id === transaction.accountId);
      if (accIdx !== -1) {
        data.accounts[accIdx].balance +=
          transaction.type === "income" ? -transaction.amount : transaction.amount;
      }
    }

    data.transactions = data.transactions.filter((t) => t.id !== transactionId);
  }

  r.salvar(data, userId);
};
