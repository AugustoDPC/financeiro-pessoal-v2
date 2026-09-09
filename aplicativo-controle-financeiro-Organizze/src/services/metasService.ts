import { Meta } from "../types/finance";
import { IRepositorio } from "../repositorio/IRepositorio";
import { repositorio as repo } from "../repositorio/localStorageRepositorio";

export const getMetas = (userId: string, r: IRepositorio = repo): Meta[] =>
  r.carregar(userId).metas ?? [];

export const addMeta = (
  meta: Omit<Meta, "id">,
  userId: string,
  r: IRepositorio = repo,
): Meta => {
  const data = r.carregar(userId);
  const nova: Meta = { ...meta, id: crypto.randomUUID() };
  data.metas = [...(data.metas ?? []), nova];
  r.salvar(data, userId);
  return nova;
};

export const updateMeta = (
  meta: Meta,
  userId: string,
  r: IRepositorio = repo,
): void => {
  const data = r.carregar(userId);
  const idx = (data.metas ?? []).findIndex((m) => m.id === meta.id);
  if (idx !== -1) {
    data.metas![idx] = meta;
    r.salvar(data, userId);
  }
};

export const deleteMeta = (
  metaId: string,
  userId: string,
  r: IRepositorio = repo,
): void => {
  const data = r.carregar(userId);
  data.metas = (data.metas ?? []).filter((m) => m.id !== metaId);
  r.salvar(data, userId);
};
