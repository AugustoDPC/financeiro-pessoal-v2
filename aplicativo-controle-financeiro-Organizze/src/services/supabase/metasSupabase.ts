import { supabase } from "@/lib/supabase";
import { Meta } from "@/types/finance";

export const getMetas = async (userId: string): Promise<Meta[]> => {
  const { data, error } = await supabase
    .from("metas")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    nome: row.nome,
    tipo: row.tipo as "limite_categoria" | "economia",
    valorAlvo: row.valor_alvo,
    categoryId: row.category_id ?? undefined,
  }));
};

export const addMeta = async (
  m: Omit<Meta, "id">,
  userId: string
): Promise<Meta> => {
  const id = crypto.randomUUID();
  const { data, error } = await supabase
    .from("metas")
    .insert({
      id,
      user_id: userId,
      nome: m.nome,
      tipo: m.tipo,
      valor_alvo: m.valorAlvo,
      category_id: m.categoryId ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    nome: data.nome,
    tipo: data.tipo as "limite_categoria" | "economia",
    valorAlvo: data.valor_alvo,
    categoryId: data.category_id ?? undefined,
  };
};

export const updateMeta = async (m: Meta, userId: string): Promise<void> => {
  const { error } = await supabase
    .from("metas")
    .update({
      nome: m.nome,
      tipo: m.tipo,
      valor_alvo: m.valorAlvo,
      category_id: m.categoryId ?? null,
    })
    .eq("id", m.id)
    .eq("user_id", userId);

  if (error) throw error;
};

export const deleteMeta = async (id: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from("metas")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
};
