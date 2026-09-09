import { supabase } from "@/lib/supabase";
import { MonthlyIncome } from "@/types/finance";

export const getReceitas = async (userId: string): Promise<MonthlyIncome[]> => {
  const { data, error } = await supabase
    .from("receitas_mensais")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    amount: row.amount,
    description: row.description,
    tipo: row.tipo as "income" | "expense",
    categoryId: row.category_id ?? undefined,
  }));
};

export const addReceita = async (
  r: Omit<MonthlyIncome, "id">,
  userId: string
): Promise<MonthlyIncome> => {
  const id = crypto.randomUUID();
  const { data, error } = await supabase
    .from("receitas_mensais")
    .insert({
      id,
      user_id: userId,
      amount: r.amount,
      description: r.description,
      tipo: r.tipo,
      category_id: r.categoryId ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    amount: data.amount,
    description: data.description,
    tipo: data.tipo as "income" | "expense",
    categoryId: data.category_id ?? undefined,
  };
};

export const updateReceita = async (
  r: MonthlyIncome,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from("receitas_mensais")
    .update({
      amount: r.amount,
      description: r.description,
      tipo: r.tipo,
      category_id: r.categoryId ?? null,
    })
    .eq("id", r.id)
    .eq("user_id", userId);

  if (error) throw error;
};

export const deleteReceita = async (id: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from("receitas_mensais")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
};
