
export interface Conta {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'other';
  balance: number;
  color?: string;
}

export type TipoCategoria = string;

export interface Categoria {
  id: string;
  name: string;
  color: string;
  icon: string;
  custom?: boolean;
}

export interface Transacao {
  id: string;
  description: string;
  amount: number;
  date: string;
  categoryId: TipoCategoria;
  accountId: string;
  type: 'income' | 'expense';
  isRecurring?: boolean;
  /** Último mês (YYYY-MM) em que a recorrência deve aparecer. Null = para sempre. */
  recurringEndDate?: string;
  /**
   * Apenas em cópias virtuais geradas por transacoesParaMes().
   * Guarda a data real do banco para que o formulário de edição salve
   * o registro correto, sem sobrescrever a data original com a data projetada.
   */
  originalDate?: string;
  installments?: {
    total: number;
    current: number;
    originalAmount: number;
    installmentId: string;
  };
}

export interface ReceitaMensal {
  id: string;
  amount: number;
  description: string;
  tipo: 'income' | 'expense';
  categoryId?: string;
}

export interface Meta {
  id: string;
  tipo: 'limite_categoria' | 'economia';
  nome: string;
  categoryId?: string;
  valorAlvo: number;
}

export interface DadosFinanceirosUsuario {
  accounts: Conta[];
  transactions: Transacao[];
  monthlyIncome: ReceitaMensal[];
  totalIncome: number;
  categorias?: Categoria[];
  metas?: Meta[];
}

// Aliases temporários para migração gradual no restante do código.
export type Account = Conta;
export type CategoryType = TipoCategoria;
export type Category = Categoria;
export type Transaction = Transacao;
export type MonthlyIncome = ReceitaMensal;
export type UserFinancialData = DadosFinanceirosUsuario;
