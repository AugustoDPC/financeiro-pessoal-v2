import { Account } from "../types/finance";
import { IRepositorio } from "../repositorio/IRepositorio";
import { repositorio as repo } from "../repositorio/localStorageRepositorio";

export const getAccounts = (userId: string, r: IRepositorio = repo): Account[] =>
  r.carregar(userId).accounts;

export const addAccount = (
  account: Omit<Account, "id">,
  userId: string,
  r: IRepositorio = repo,
): Account => {
  const data = r.carregar(userId);
  const newAccount: Account = { ...account, id: crypto.randomUUID() };
  data.accounts.push(newAccount);
  r.salvar(data, userId);
  return newAccount;
};

export const updateAccount = (
  account: Account,
  userId: string,
  r: IRepositorio = repo,
): void => {
  const data = r.carregar(userId);
  const index = data.accounts.findIndex((a) => a.id === account.id);
  if (index !== -1) {
    data.accounts[index] = account;
    r.salvar(data, userId);
  }
};

export const deleteAccount = (
  accountId: string,
  userId: string,
  r: IRepositorio = repo,
): void => {
  const data = r.carregar(userId);
  data.accounts = data.accounts.filter((a) => a.id !== accountId);
  data.transactions = data.transactions.filter((t) => t.accountId !== accountId);
  r.salvar(data, userId);
};
