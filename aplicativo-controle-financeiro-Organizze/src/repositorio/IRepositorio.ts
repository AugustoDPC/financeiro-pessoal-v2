import { UserFinancialData } from "../types/finance";

export interface IRepositorio {
  carregar(userId: string): UserFinancialData;
  salvar(data: UserFinancialData, userId: string): void;
}
