import { supabase } from "@/lib/supabase";
import { Category } from "@/types/finance";
import { defaultCategories } from "../categoriasService";

export const getCategorias = async (userId: string): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;

  if (!data || data.length === 0) {
    // Semear categorias padrão
    const rows = defaultCategories.map((c) => ({
      id: c.id,
      user_id: userId,
      name: c.name,
      color: c.color,
      icon: c.icon,
      custom: false,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("categorias")
      .insert(rows)
      .select();

    if (insertError) throw insertError;

    return (inserted ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      color: row.color,
      icon: row.icon,
      custom: row.custom,
    }));
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    custom: row.custom,
  }));
};

export const addCategoria = async (
  cat: Omit<Category, "id" | "custom">,
  userId: string
): Promise<Category> => {
  const id = crypto.randomUUID();
  const { data, error } = await supabase
    .from("categorias")
    .insert({
      id,
      user_id: userId,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      custom: true,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    color: data.color,
    icon: data.icon,
    custom: data.custom,
  };
};

export const updateCategoria = async (
  cat: Category,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from("categorias")
    .update({
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      custom: cat.custom ?? false,
    })
    .eq("id", cat.id)
    .eq("user_id", userId);

  if (error) throw error;
};

export const deleteCategoria = async (id: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from("categorias")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
};
