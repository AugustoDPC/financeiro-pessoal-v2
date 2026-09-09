import { Categoria } from "../types/finance";
import { IRepositorio } from "../repositorio/IRepositorio";
import { repositorio as repo } from "../repositorio/localStorageRepositorio";

export const defaultCategories: Categoria[] = [
  { id: "education", name: "Educação", color: "#5C6BC0", icon: "GraduationCap" },
  { id: "food", name: "Alimentação", color: "#EF5350", icon: "Utensils" },
  { id: "health", name: "Saúde", color: "#42A5F5", icon: "Heart" },
  { id: "transport", name: "Transporte", color: "#7E57C2", icon: "Car" },
  { id: "leisure", name: "Lazer", color: "#FF7043", icon: "Music" },
  { id: "investment", name: "Investimentos", color: "#66BB6A", icon: "TrendingUp" },
  { id: "pets", name: "Pets", color: "#FFA726", icon: "DogIcon" },
  { id: "other", name: "Outros", color: "#78909C", icon: "Tag" },
];

export const iconesDisponiveis = [
  "Tag", "ShoppingCart", "Home", "Car", "Plane", "Coffee", "Heart",
  "Music", "BookOpen", "Briefcase", "DollarSign", "Gift", "Zap",
  "Smartphone", "Utensils", "GraduationCap", "TrendingUp", "Star",
  "Shirt", "Dumbbell", "Baby", "PawPrint", "Wrench", "Globe",
];

export const coresDiisponiveis = [
  "#EF5350", "#FF7043", "#FFA726", "#FFCA28",
  "#66BB6A", "#26A69A", "#42A5F5", "#5C6BC0",
  "#7E57C2", "#EC407A", "#78909C", "#8D6E63",
];

export const getCategorias = (userId: string, r: IRepositorio = repo): Categoria[] => {
  const data = r.carregar(userId);
  if (!data.categorias || data.categorias.length === 0) {
    data.categorias = defaultCategories.map((c) => ({ ...c }));
    r.salvar(data, userId);
  }
  return data.categorias;
};

export const getCategoryById = (categoryId: string, userId?: string, r: IRepositorio = repo): Categoria | undefined => {
  if (userId) return getCategorias(userId, r).find((c) => c.id === categoryId);
  return defaultCategories.find((c) => c.id === categoryId);
};

export const addCategoria = (
  categoria: Omit<Categoria, "id" | "custom">,
  userId: string,
  r: IRepositorio = repo,
): Categoria => {
  const data = r.carregar(userId);
  const nova: Categoria = { ...categoria, id: crypto.randomUUID(), custom: true };
  data.categorias = [...(data.categorias ?? []), nova];
  r.salvar(data, userId);
  return nova;
};

export const updateCategoria = (
  categoria: Categoria,
  userId: string,
  r: IRepositorio = repo,
): void => {
  const data = r.carregar(userId);
  const idx = (data.categorias ?? []).findIndex((c) => c.id === categoria.id);
  if (idx !== -1) {
    data.categorias![idx] = categoria;
    r.salvar(data, userId);
  }
};

export const deleteCategoria = (
  categoriaId: string,
  userId: string,
  r: IRepositorio = repo,
): void => {
  const data = r.carregar(userId);
  data.categorias = (data.categorias ?? []).filter((c) => c.id !== categoriaId);
  r.salvar(data, userId);
};
