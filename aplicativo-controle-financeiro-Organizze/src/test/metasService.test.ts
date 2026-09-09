import { describe, it, expect, beforeEach } from "vitest";
import { RepositorioMemoria } from "./repositorioMemoria";
import { addMeta, getMetas, updateMeta, deleteMeta } from "../services/metasService";

const USER = "usuario_teste";

describe("metasService", () => {
  let repo: RepositorioMemoria;

  beforeEach(() => {
    repo = new RepositorioMemoria();
  });

  it("addMeta cria meta com id", () => {
    const meta = addMeta(
      { tipo: "economia", nome: "Reserva de Emergência", valorAlvo: 10000 },
      USER,
      repo,
    );
    expect(meta.id).toBeDefined();
    expect(meta.nome).toBe("Reserva de Emergência");
    expect(getMetas(USER, repo)).toHaveLength(1);
  });

  it("updateMeta modifica meta existente", () => {
    const meta = addMeta(
      { tipo: "economia", nome: "Viagem", valorAlvo: 5000 },
      USER,
      repo,
    );
    updateMeta({ ...meta, nome: "Viagem Europa", valorAlvo: 8000 }, USER, repo);

    const metas = getMetas(USER, repo);
    expect(metas[0].nome).toBe("Viagem Europa");
    expect(metas[0].valorAlvo).toBe(8000);
  });

  it("deleteMeta remove a meta", () => {
    const meta = addMeta(
      { tipo: "limite_categoria", nome: "Limite Alimentação", categoryId: "food", valorAlvo: 500 },
      USER,
      repo,
    );
    deleteMeta(meta.id, USER, repo);
    expect(getMetas(USER, repo)).toHaveLength(0);
  });
});
