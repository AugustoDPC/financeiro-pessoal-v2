import { supabase } from "@/lib/supabase";

export interface PerfilData {
  name: string;
  avatar: string;
}

export const getPerfil = async (userId: string): Promise<PerfilData> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, avatar")
    .eq("id", userId)
    .single();

  // PGRST116 = linha não encontrada (perfil ainda não criado)
  if (error && error.code !== "PGRST116") throw error;

  return {
    name: data?.display_name ?? "",
    avatar: data?.avatar ?? "",
  };
};

export const savePerfil = async (
  userId: string,
  name: string,
  avatar: string
): Promise<void> => {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      display_name: name,
      avatar,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) throw error;
};
