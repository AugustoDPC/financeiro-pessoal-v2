import { supabase } from "@/lib/supabase";
import { Account } from "@/types/finance";

export const getContas = async (userId: string): Promise<Account[]> => {
  const { data, error } = await supabase
    .from("contas")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type as Account["type"],
    balance: row.balance,
    color: row.color ?? undefined,
  }));
};

export const addConta = async (
  conta: Omit<Account, "id">,
  userId: string
): Promise<Account> => {
  const id = crypto.randomUUID();
  const { data, error } = await supabase
    .from("contas")
    .insert({
      id,
      user_id: userId,
      name: conta.name,
      type: conta.type,
      balance: conta.balance,
      color: conta.color ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    type: data.type as Account["type"],
    balance: data.balance,
    color: data.color ?? undefined,
  };
};

export const updateConta = async (
  conta: Account,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from("contas")
    .update({
      name: conta.name,
      type: conta.type,
      balance: conta.balance,
      color: conta.color ?? null,
    })
    .eq("id", conta.id)
    .eq("user_id", userId);

  if (error) throw error;
};

export const atualizarSaldoConta = async (
  accountId: string,
  userId: string,
  delta: number,
): Promise<void> => {
  const { data, error: readError } = await supabase
    .from("contas")
    .select("balance")
    .eq("id", accountId)
    .eq("user_id", userId)
    .single();

  if (readError) throw readError;

  const { error } = await supabase
    .from("contas")
    .update({ balance: (data.balance ?? 0) + delta })
    .eq("id", accountId)
    .eq("user_id", userId);

  if (error) throw error;
};

export const deleteConta = async (id: string, userId: string): Promise<void> => {
  // Delete all transactions linked to this account first
  const { error: txError } = await supabase
    .from("transacoes")
    .delete()
    .eq("account_id", id)
    .eq("user_id", userId);

  if (txError) throw txError;

  const { error } = await supabase
    .from("contas")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
};
