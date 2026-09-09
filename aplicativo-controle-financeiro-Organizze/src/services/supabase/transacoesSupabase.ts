import { addMonths, format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Transaction, CategoryType } from "@/types/finance";

type TransacaoRow = {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  date: string;
  category_id: string;
  account_id: string;
  type: string;
  is_recurring: boolean | null;
  recurring_end_date: string | null;
  installment_total: number | null;
  installment_current: number | null;
  installment_original_amount: number | null;
  installment_id: string | null;
};

const rowToTransaction = (row: TransacaoRow): Transaction => ({
  id: row.id,
  description: row.description,
  amount: row.amount,
  date: row.date,
  categoryId: row.category_id,
  accountId: row.account_id,
  type: row.type as "income" | "expense",
  isRecurring: row.is_recurring ?? undefined,
  recurringEndDate: row.recurring_end_date ?? undefined,
  installments:
    row.installment_id != null
      ? {
          total: row.installment_total!,
          current: row.installment_current!,
          originalAmount: row.installment_original_amount!,
          installmentId: row.installment_id,
        }
      : undefined,
});

export const getTransacoes = async (userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from("transacoes")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []).map(rowToTransaction);
};

export const addTransacao = async (
  tx: Omit<Transaction, "id">,
  userId: string
): Promise<Transaction> => {
  const id = crypto.randomUUID();
  const { data, error } = await supabase
    .from("transacoes")
    .insert({
      id,
      user_id: userId,
      description: tx.description,
      amount: tx.amount,
      date: tx.date,
      category_id: tx.categoryId,
      account_id: tx.accountId,
      type: tx.type,
      is_recurring: tx.isRecurring ?? null,
      recurring_end_date: tx.recurringEndDate ?? null,
      installment_total: tx.installments?.total ?? null,
      installment_current: tx.installments?.current ?? null,
      installment_original_amount: tx.installments?.originalAmount ?? null,
      installment_id: tx.installments?.installmentId ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToTransaction(data);
};

export const addTransacaoParcelada = async (
  input: {
    description: string;
    totalAmount: number;
    installments: number;
    startDate: string;
    categoryId: CategoryType;
    accountId: string;
  },
  userId: string
): Promise<Transaction[]> => {
  const installmentAmount = Number(
    (input.totalAmount / input.installments).toFixed(2)
  );
  const installmentId = crypto.randomUUID();
  const rows = [];

  for (let i = 0; i < input.installments; i++) {
    const date = format(addMonths(new Date(input.startDate), i), "yyyy-MM-dd");
    rows.push({
      id: crypto.randomUUID(),
      user_id: userId,
      description: input.description,
      amount: installmentAmount,
      date,
      category_id: input.categoryId,
      account_id: input.accountId,
      type: "expense",
      is_recurring: null,
      installment_total: input.installments,
      installment_current: i + 1,
      installment_original_amount: input.totalAmount,
      installment_id: installmentId,
    });
  }

  const { data, error } = await supabase
    .from("transacoes")
    .insert(rows)
    .select();

  if (error) throw error;
  return (data ?? []).map(rowToTransaction);
};

export const updateTransacao = async (
  tx: Transaction,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from("transacoes")
    .update({
      description: tx.description,
      amount: tx.amount,
      date: tx.date,
      category_id: tx.categoryId,
      account_id: tx.accountId,
      type: tx.type,
      is_recurring: tx.isRecurring ?? null,
      recurring_end_date: tx.recurringEndDate ?? null,
      installment_total: tx.installments?.total ?? null,
      installment_current: tx.installments?.current ?? null,
      installment_original_amount: tx.installments?.originalAmount ?? null,
      installment_id: tx.installments?.installmentId ?? null,
    })
    .eq("id", tx.id)
    .eq("user_id", userId);

  if (error) throw error;
};

export const deleteTransacao = async (id: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from("transacoes")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
};

export const deleteTransacaoParceladaGroup = async (installmentId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from("transacoes")
    .delete()
    .eq("installment_id", installmentId)
    .eq("user_id", userId);

  if (error) throw error;
};

export const updateTransacaoDate = async (id: string, date: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from("transacoes")
    .update({ date })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
};

export const updateTransacaoParceladaGroup = async (
  installmentId: string,
  fields: { description?: string; category_id?: string; account_id?: string; amount?: number },
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from("transacoes")
    .update(fields)
    .eq("installment_id", installmentId)
    .eq("user_id", userId);

  if (error) throw error;
};
