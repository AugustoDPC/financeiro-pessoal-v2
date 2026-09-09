
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Account,
  Transaction,
  MonthlyIncome,
  Category,
  CategoryType,
  Meta,
} from "../types/finance";
import { defaultCategories } from "../services/categoriasService";
import { getContas, addConta, updateConta, deleteConta } from "../services/supabase/contasSupabase";
import { getCategorias, addCategoria as addCategoriaSupabase, updateCategoria as updateCategoriaSupabase, deleteCategoria as deleteCategoriaSupabase } from "../services/supabase/categoriasSupabase";
import { getTransacoes, addTransacao, addTransacaoParcelada, updateTransacao, deleteTransacao, deleteTransacaoParceladaGroup, updateTransacaoParceladaGroup, updateTransacaoDate } from "../services/supabase/transacoesSupabase";
import { getReceitas, addReceita, updateReceita, deleteReceita } from "../services/supabase/receitasSupabase";
import { getMetas as getMetasSupabase, addMeta as addMetaSupabase, updateMeta as updateMetaSupabase, deleteMeta as deleteMetaSupabase } from "../services/supabase/metasSupabase";
import { obterMesAno } from "@/utils/datas";
import { transacoesParaMes } from "@/utils/recorrentes";
import { useToast } from "@/hooks/use-toast";
import { criarNotificador } from "@/utils/notificacoes";
import { useAuth } from "./AuthContext";

export interface MetaComProgresso extends Meta {
  valorAtual: number;
  percentual: number;
  status: 'ok' | 'atencao' | 'critico';
}

interface FinancasContextType {
  contas: Account[];
  transacoes: Transaction[];
  receitasMensais: MonthlyIncome[];
  categorias: Category[];
  totalReceitaMensal: number;
  totalDespesaRecorrente: number;
  metas: MetaComProgresso[];
  isLoading: boolean;
  resumo: {
    totalReceitas: number;
    totalDespesas: number;
    saldoDisponivel: number;
    despesasPorCategoria: {
      categoryId: CategoryType;
      categoryName: string;
      color: string;
      amount: number;
    }[];
    expensesByCategory: {
      categoryId: CategoryType;
      categoryName: string;
      color: string;
      amount: number;
    }[];
  };
  addAccount: (account: Omit<Account, "id">) => Promise<void>;
  updateAccount: (account: Account) => Promise<void>;
  deleteAccount: (accountId: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  addInstallmentTransaction: (data: {
    description: string;
    totalAmount: number;
    installments: number;
    startDate: string;
    categoryId: CategoryType;
    accountId: string;
  }) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  deleteInstallmentGroup: (installmentId: string) => Promise<void>;
  updateInstallmentGroup: (installmentId: string, data: {
    description?: string;
    amount?: number;
    categoryId?: string;
    accountId?: string;
  }) => Promise<void>;
  reordenarParcelamento: (installmentId: string, installmentCurrent: number, newDate: string) => Promise<void>;
  addMonthlyIncome: (income: Omit<MonthlyIncome, "id">) => Promise<void>;
  updateMonthlyIncome: (income: MonthlyIncome) => Promise<void>;
  deleteMonthlyIncome: (incomeId: string) => Promise<void>;
  addCategoria: (categoria: Omit<Category, "id" | "custom">) => Promise<void>;
  updateCategoria: (categoria: Category) => Promise<void>;
  deleteCategoria: (categoriaId: string) => Promise<void>;
  addMeta: (meta: Omit<Meta, "id">) => Promise<void>;
  updateMeta: (meta: Meta) => Promise<void>;
  deleteMeta: (metaId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const FinancasContext = createContext<FinancasContextType | undefined>(undefined);

// Soma N meses a uma data "YYYY-MM-DD", respeitando o último dia do mês destino.
function somarMeses(dateStr: string, meses: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const totalMeses = (m - 1) + meses;
  const novoAno = y + Math.floor(totalMeses / 12);
  const novoMes = ((totalMeses % 12) + 12) % 12; // 0-based
  const ultimoDia = new Date(novoAno, novoMes + 1, 0).getDate();
  const novoDia = Math.min(d, ultimoDia);
  return `${novoAno}-${String(novoMes + 1).padStart(2, "0")}-${String(novoDia).padStart(2, "0")}`;
}

export const FinancasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [contas, setContas] = useState<Account[]>([]);
  const [transacoes, setTransacoes] = useState<Transaction[]>([]);
  const [receitasMensais, setReceitasMensais] = useState<MonthlyIncome[]>([]);
  const [totalReceitaMensal, setTotalReceitaMensal] = useState<number>(0);
  const [totalDespesaRecorrente, setTotalDespesaRecorrente] = useState<number>(0);
  const [categorias, setCategorias] = useState<Category[]>(defaultCategories);
  const [metas, setMetas] = useState<MetaComProgresso[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resumo, setResumo] = useState({
    totalReceitas: 0,
    totalDespesas: 0,
    saldoDisponivel: 0,
    despesasPorCategoria: [] as {
      categoryId: CategoryType;
      categoryName: string;
      color: string;
      amount: number;
    }[],
    expensesByCategory: [] as {
      categoryId: CategoryType;
      categoryName: string;
      color: string;
      amount: number;
    }[],
  });

  const { toast } = useToast();
  const notif = criarNotificador(toast);

  const calcularProgresso = (
    metasRaw: Meta[],
    txAtuais: Transaction[],
    totalIncome: number,
    totalExpenses: number,
  ): MetaComProgresso[] => {
    const mesAtual = obterMesAno();
    const txMes = transacoesParaMes(txAtuais, mesAtual);

    return metasRaw.map((meta) => {
      let valorAtual = 0;

      if (meta.tipo === "limite_categoria") {
        valorAtual = txMes
          .filter((t) => t.type === "expense" && t.categoryId === meta.categoryId)
          .reduce((s, t) => s + t.amount, 0);
      } else {
        // Meta de economia: soma o valor absoluto de todas as transações
        // da categoria vinculada, ao longo de todos os meses.
        if (meta.categoryId) {
          valorAtual = txAtuais
            .filter(t => t.categoryId === meta.categoryId)
            .reduce((s, t) => s + t.amount, 0);
        } else {
          valorAtual = Math.max(0, totalIncome - totalExpenses);
        }
      }

      const percentual = meta.valorAlvo > 0
        ? Math.min(Math.round((valorAtual / meta.valorAlvo) * 100), 999)
        : 0;

      const status =
        meta.tipo === "limite_categoria"
          ? percentual >= 90 ? "critico" : percentual >= 70 ? "atencao" : "ok"
          : percentual >= 100 ? "ok" : percentual >= 70 ? "atencao" : "critico";

      return { ...meta, valorAtual, percentual, status };
    });
  };

  const calcularResumo = (
    txAtuais: Transaction[],
    receitasAtuais: MonthlyIncome[],
    contasAtuais: Account[],
  ) => {
    const mesAtual = obterMesAno();
    const txMes = transacoesParaMes(txAtuais, mesAtual);

    const txIncome = txMes
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);

    const txExpenses = txMes
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

    const recIncome = receitasAtuais
      .filter((r) => r.tipo === "income")
      .reduce((s, r) => s + r.amount, 0);

    const recExpenses = receitasAtuais
      .filter((r) => r.tipo === "expense")
      .reduce((s, r) => s + r.amount, 0);

    const totalReceitas = recIncome + txIncome;
    const totalDespesas = recExpenses + txExpenses;
    const saldoDisponivel = contasAtuais.reduce((s, a) => s + a.balance, 0);

    const despesasPorCategoria = defaultCategories
      .map((cat) => ({
        categoryId: cat.id as CategoryType,
        categoryName: cat.name,
        color: cat.color,
        amount: txMes
          .filter((t) => t.type === "expense" && t.categoryId === cat.id)
          .reduce((s, t) => s + t.amount, 0),
      }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return { totalReceitas, totalDespesas, saldoDisponivel, despesasPorCategoria, expensesByCategory: despesasPorCategoria };
  };

  const calcularSaldosDinamicos = (contasData: Account[], txData: Transaction[]): Account[] => {
    const mesAtual = new Date().toISOString().substring(0, 7);

    return contasData.map((conta) => {
      let delta = 0;

      for (const tx of txData) {
        if (tx.accountId !== conta.id) continue;
        const sign = tx.type === "income" ? 1 : -1;

        if (tx.isRecurring) {
          const startMonth = tx.date.substring(0, 7);
          const endMonth = tx.recurringEndDate ?? mesAtual;
          const effectiveEnd = endMonth < mesAtual ? endMonth : mesAtual;

          if (startMonth <= mesAtual) {
            const [sy, sm] = startMonth.split("-").map(Number);
            const [ey, em] = effectiveEnd.split("-").map(Number);
            const months = (ey - sy) * 12 + (em - sm) + 1;
            delta += sign * tx.amount * Math.max(0, months);
          }
        } else {
          const txMonth = tx.date.substring(0, 7);
          if (txMonth <= mesAtual) {
            delta += sign * tx.amount;
          }
        }
      }

      return { ...conta, balance: conta.balance + delta };
    });
  };

  const atualizarDados = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const [txAtuais, receitasAtuais, contasAtuais, categoriasAtuais, metasRaw] = await Promise.all([
        getTransacoes(user.id),
        getReceitas(user.id),
        getContas(user.id),
        getCategorias(user.id),
        getMetasSupabase(user.id),
      ]);

      const recIncome = receitasAtuais
        .filter((r) => r.tipo === "income")
        .reduce((s, r) => s + r.amount, 0);

      const recExpenses = receitasAtuais
        .filter((r) => r.tipo === "expense")
        .reduce((s, r) => s + r.amount, 0);

      const contasComSaldo = calcularSaldosDinamicos(contasAtuais, txAtuais);
      const resumoAtual = calcularResumo(txAtuais, receitasAtuais, contasComSaldo);

      setContas(contasComSaldo);
      setTransacoes(txAtuais);
      setReceitasMensais(receitasAtuais);
      setTotalReceitaMensal(recIncome);
      setTotalDespesaRecorrente(recExpenses);
      setCategorias(categoriasAtuais);
      setResumo(resumoAtual);
      setMetas(calcularProgresso(metasRaw, txAtuais, resumoAtual.totalReceitas, resumoAtual.totalDespesas));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      atualizarDados();
    } else {
      // Clear data when user logs out
      setContas([]);
      setTransacoes([]);
      setReceitasMensais([]);
      setTotalReceitaMensal(0);
      setTotalDespesaRecorrente(0);
      setCategorias(defaultCategories);
      setMetas([]);
      setResumo({ totalReceitas: 0, totalDespesas: 0, saldoDisponivel: 0, despesasPorCategoria: [], expensesByCategory: [] });
    }
  }, [user?.id]);

  const adicionarConta = async (account: Omit<Account, "id">) => {
    if (!user?.id) return;
    try {
      await addConta(account, user.id);
      await atualizarDados();
      notif.contaAdicionada();
    } catch (error) {
      notif.erroConta();
    }
  };

  const atualizarConta = async (account: Account) => {
    if (!user?.id) return;
    try {
      await updateConta(account, user.id);
      await atualizarDados();
      notif.contaAtualizada();
    } catch (error) {
      notif.erroConta();
    }
  };

  const removerConta = async (accountId: string) => {
    if (!user?.id) return;
    try {
      await deleteConta(accountId, user.id);
      await atualizarDados();
      notif.contaRemovida();
    } catch (error) {
      notif.erroConta();
    }
  };

  const adicionarTransacao = async (transaction: Omit<Transaction, "id">) => {
    if (!user?.id) return;
    try {
      await addTransacao(transaction, user.id);
      await atualizarDados();
      notif.transacaoAdicionada();
    } catch (error) {
      notif.erroTransacao();
    }
  };

  const adicionarTransacaoParcelada = async (data: {
    description: string;
    totalAmount: number;
    installments: number;
    startDate: string;
    categoryId: CategoryType;
    accountId: string;
  }) => {
    if (!user?.id) return;
    try {
      await addTransacaoParcelada(data, user.id);
      await atualizarDados();
      notif.sucesso(
        "Despesa parcelada adicionada",
        `${data.installments} parcelas de ${formatCurrency(data.totalAmount / data.installments)} foram criadas.`,
      );
    } catch (error) {
      notif.erroTransacao();
    }
  };

  const atualizarTransacao = async (transaction: Transaction) => {
    if (!user?.id) return;
    try {
      await updateTransacao(transaction, user.id);
      await atualizarDados();
      notif.transacaoAtualizada();
    } catch (error) {
      notif.erroTransacao();
    }
  };

  const removerTransacao = async (transactionId: string) => {
    if (!user?.id) return;
    try {
      await deleteTransacao(transactionId, user.id);
      await atualizarDados();
      notif.transacaoRemovida();
    } catch (error) {
      notif.erroTransacao();
    }
  };

  const removerGrupoParcelas = async (installmentId: string) => {
    if (!user?.id) return;
    try {
      await deleteTransacaoParceladaGroup(installmentId, user.id);
      await atualizarDados();
      notif.sucesso("Parcelas removidas", "Todas as parcelas foram removidas com sucesso.");
    } catch (error) {
      notif.erroTransacao();
    }
  };

  const atualizarGrupoParcelas = async (
    installmentId: string,
    data: { description?: string; amount?: number; categoryId?: string; accountId?: string },
  ) => {
    if (!user?.id) return;
    try {
      const fields: Record<string, unknown> = {};
      if (data.description !== undefined) fields.description = data.description;
      if (data.amount !== undefined) fields.amount = data.amount;
      if (data.categoryId !== undefined) fields.category_id = data.categoryId;
      if (data.accountId !== undefined) fields.account_id = data.accountId;
      await updateTransacaoParceladaGroup(installmentId, fields as Parameters<typeof updateTransacaoParceladaGroup>[1], user.id);
      await atualizarDados();
      notif.transacaoAtualizada();
    } catch (error) {
      notif.erroTransacao();
    }
  };

  const reordenarParcelamento = async (
    installmentId: string,
    installmentCurrent: number,
    newDate: string,
  ) => {
    if (!user?.id) return;
    try {
      const parcelas = transacoes.filter(t => t.installments?.installmentId === installmentId);
      for (const parcela of parcelas) {
        const offset = parcela.installments!.current - installmentCurrent;
        const novaData = somarMeses(newDate, offset);
        await updateTransacaoDate(parcela.id, novaData, user.id);
      }
      await atualizarDados();
      notif.transacaoAtualizada();
    } catch (error) {
      notif.erroTransacao();
    }
  };

  const adicionarReceitaMensal = async (income: Omit<MonthlyIncome, "id">) => {
    if (!user?.id) return;
    try {
      await addReceita(income, user.id);
      await atualizarDados();
      notif.receitaAdicionada();
    } catch (error) {
      notif.erroReceita();
    }
  };

  const atualizarReceitaMensal = async (income: MonthlyIncome) => {
    if (!user?.id) return;
    try {
      await updateReceita(income, user.id);
      await atualizarDados();
      notif.receitaAtualizada();
    } catch (error) {
      notif.erroReceita();
    }
  };

  const removerReceitaMensal = async (incomeId: string) => {
    if (!user?.id) return;
    try {
      await deleteReceita(incomeId, user.id);
      await atualizarDados();
      notif.receitaRemovida();
    } catch (error) {
      notif.erroReceita();
    }
  };

  const adicionarCategoria = async (categoria: Omit<Category, "id" | "custom">) => {
    if (!user?.id) return;
    try {
      await addCategoriaSupabase(categoria, user.id);
      await atualizarDados();
      notif.categoriaAdicionada(categoria.name);
    } catch {
      notif.erroCategoria();
    }
  };

  const editarCategoria = async (categoria: Category) => {
    if (!user?.id) return;
    try {
      await updateCategoriaSupabase(categoria, user.id);
      await atualizarDados();
      notif.categoriaAtualizada(categoria.name);
    } catch {
      notif.erroCategoria();
    }
  };

  const removerCategoria = async (categoriaId: string) => {
    if (!user?.id) return;
    try {
      await deleteCategoriaSupabase(categoriaId, user.id);
      await atualizarDados();
      notif.categoriaRemovida();
    } catch {
      notif.erroCategoria();
    }
  };

  const adicionarMeta = async (meta: Omit<Meta, "id">) => {
    if (!user?.id) return;
    try {
      await addMetaSupabase(meta, user.id);
      await atualizarDados();
      notif.metaCriada(meta.nome);
    } catch {
      notif.erroMeta();
    }
  };

  const editarMeta = async (meta: Meta) => {
    if (!user?.id) return;
    try {
      await updateMetaSupabase(meta, user.id);
      await atualizarDados();
      notif.metaAtualizada(meta.nome);
    } catch {
      notif.erroMeta();
    }
  };

  const removerMeta = async (metaId: string) => {
    if (!user?.id) return;
    // Optimistic update: remove from UI immediately
    setMetas((prev) => prev.filter((m) => m.id !== metaId));
    try {
      await deleteMetaSupabase(metaId, user.id);
      await atualizarDados();
      notif.metaRemovida();
    } catch {
      // Revert optimistic update on failure
      await atualizarDados();
      notif.erroMeta();
    }
  };

  return (
    <FinancasContext.Provider
      value={{
        contas,
        transacoes,
        receitasMensais,
        categorias,
        totalReceitaMensal,
        totalDespesaRecorrente,
        resumo,
        isLoading,
        addAccount: adicionarConta,
        updateAccount: atualizarConta,
        deleteAccount: removerConta,
        addTransaction: adicionarTransacao,
        addInstallmentTransaction: adicionarTransacaoParcelada,
        updateTransaction: atualizarTransacao,
        deleteTransaction: removerTransacao,
        deleteInstallmentGroup: removerGrupoParcelas,
        updateInstallmentGroup: atualizarGrupoParcelas,
        reordenarParcelamento: reordenarParcelamento,
        addMonthlyIncome: adicionarReceitaMensal,
        updateMonthlyIncome: atualizarReceitaMensal,
        deleteMonthlyIncome: removerReceitaMensal,
        addCategoria: adicionarCategoria,
        updateCategoria: editarCategoria,
        deleteCategoria: removerCategoria,
        metas,
        addMeta: adicionarMeta,
        updateMeta: editarMeta,
        deleteMeta: removerMeta,
        refreshData: atualizarDados,
      }}
    >
      {children}
    </FinancasContext.Provider>
  );
};

export const useFinancas = () => {
  const context = useContext(FinancasContext);
  if (context === undefined) {
    throw new Error("useFinancas deve ser usado dentro de FinancasProvider");
  }
  return context;
};

// Alias para compatibilidade retroativa durante a migração.
export const FinanceProvider = FinancasProvider;
export const useFinance = useFinancas;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}
