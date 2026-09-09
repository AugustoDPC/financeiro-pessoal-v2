import { IRepositorio } from "../repositorio/IRepositorio";
import { UserFinancialData } from "../types/finance";

const dadosVazios = (): UserFinancialData => ({
  accounts: [],
  transactions: [],
  monthlyIncome: [],
  totalIncome: 0,
  categorias: [],
  metas: [],
});

export class RepositorioMemoria implements IRepositorio {
  private armazenamento: Record<string, UserFinancialData> = {};

  carregar(userId: string): UserFinancialData {
    if (!this.armazenamento[userId]) {
      this.armazenamento[userId] = dadosVazios();
    }
    return this.armazenamento[userId];
  }

  salvar(data: UserFinancialData, userId: string): void {
    this.armazenamento[userId] = data;
  }

  reset(): void {
    this.armazenamento = {};
  }
}

export const repositorioMemoria = new RepositorioMemoria();
