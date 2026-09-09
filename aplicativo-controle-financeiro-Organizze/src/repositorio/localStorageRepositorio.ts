import { UserFinancialData } from "../types/finance";
import { IRepositorio } from "./IRepositorio";

const dadosPadrao: UserFinancialData = {
  accounts: [],
  transactions: [],
  monthlyIncome: [],
  totalIncome: 0,
};

export class LocalStorageRepositorio implements IRepositorio {
  private chave(userId: string) {
    return `finance_app_data_${userId}`;
  }

  carregar(userId: string): UserFinancialData {
    const raw = localStorage.getItem(this.chave(userId));
    return raw ? JSON.parse(raw) : { ...dadosPadrao };
  }

  salvar(data: UserFinancialData, userId: string): void {
    localStorage.setItem(this.chave(userId), JSON.stringify(data));
  }
}

export const repositorio = new LocalStorageRepositorio();
