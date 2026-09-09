import { supabase } from "@/lib/supabase";
import {
  Account,
  Transaction,
  MonthlyIncome,
  Category,
  Meta,
} from "@/types/finance";

/** Estrutura do arquivo de backup JSON (versão 2 — dados do Supabase). */
export interface DadosBackup {
  version: 2;
  exportedAt: string;
  contas: Account[];
  transacoes: Transaction[];
  receitasMensais: MonthlyIncome[];
  categorias: Category[];
  metas: Meta[];
}

// ─── Exportação ────────────────────────────────────────────────────────────────

/**
 * Gera e faz download de um arquivo JSON com todos os dados financeiros
 * recebidos diretamente do contexto (não lê mais do localStorage).
 */
export function exportarBackup(dados: DadosBackup): void {
  const json = JSON.stringify(dados, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const hoje = new Date().toISOString().substring(0, 10);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `backup-financas-${hoje}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

// ─── Importação ────────────────────────────────────────────────────────────────

/**
 * Lê o arquivo JSON e insere (upsert) os dados no Supabase do usuário logado.
 * Não apaga registros existentes — apenas adiciona ou atualiza pelo ID.
 */
export function importarBackup(
  file: File,
  userId: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text) as Partial<DadosBackup>;

        // Validação mínima
        if (
          !parsed ||
          typeof parsed !== "object" ||
          !Array.isArray(parsed.contas) ||
          !Array.isArray(parsed.transacoes)
        ) {
          reject(new Error("Arquivo de backup inválido ou corrompido."));
          return;
        }

        // Upsert em paralelo para cada tabela
        await Promise.all([
          upsertContas(parsed.contas ?? [], userId),
          upsertTransacoes(parsed.transacoes ?? [], userId),
          upsertReceitas(parsed.receitasMensais ?? [], userId),
          upsertCategorias(parsed.categorias ?? [], userId),
          upsertMetas(parsed.metas ?? [], userId),
        ]);

        resolve();
      } catch (err) {
        reject(
          err instanceof Error
            ? err
            : new Error("Erro ao processar o arquivo de backup.")
        );
      }
    };

    reader.onerror = () =>
      reject(new Error("Não foi possível ler o arquivo."));

    reader.readAsText(file);
  });
}

// ─── Helpers de upsert ─────────────────────────────────────────────────────────

async function upsertContas(contas: Account[], userId: string) {
  if (contas.length === 0) return;
  const rows = contas.map((c) => ({
    id: c.id,
    user_id: userId,
    name: c.name,
    type: c.type,
    balance: c.balance,
    color: c.color ?? null,
  }));
  const { error } = await supabase.from("contas").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`Erro ao importar contas: ${error.message}`);
}

async function upsertTransacoes(transacoes: Transaction[], userId: string) {
  if (transacoes.length === 0) return;
  const rows = transacoes.map((t) => ({
    id: t.id,
    user_id: userId,
    description: t.description,
    amount: t.amount,
    date: t.date,
    category_id: t.categoryId,
    account_id: t.accountId,
    type: t.type,
    is_recurring: t.isRecurring ?? null,
    recurring_end_date: t.recurringEndDate ?? null,
    installment_total: t.installments?.total ?? null,
    installment_current: t.installments?.current ?? null,
    installment_original_amount: t.installments?.originalAmount ?? null,
    installment_id: t.installments?.installmentId ?? null,
  }));
  const { error } = await supabase.from("transacoes").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`Erro ao importar transações: ${error.message}`);
}

async function upsertReceitas(receitas: MonthlyIncome[], userId: string) {
  if (receitas.length === 0) return;
  const rows = receitas.map((r) => ({
    id: r.id,
    user_id: userId,
    amount: r.amount,
    description: r.description,
    tipo: r.tipo,
    category_id: r.categoryId ?? null,
  }));
  const { error } = await supabase.from("receitas_mensais").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`Erro ao importar receitas: ${error.message}`);
}

async function upsertCategorias(categorias: Category[], userId: string) {
  if (categorias.length === 0) return;
  const rows = categorias.map((c) => ({
    id: c.id,
    user_id: userId,
    name: c.name,
    color: c.color,
    icon: c.icon,
    custom: c.custom ?? false,
  }));
  const { error } = await supabase.from("categorias").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`Erro ao importar categorias: ${error.message}`);
}

async function upsertMetas(metas: Meta[], userId: string) {
  if (metas.length === 0) return;
  const rows = metas.map((m) => ({
    id: m.id,
    user_id: userId,
    nome: m.nome,
    tipo: m.tipo,
    valor_alvo: m.valorAlvo,
    category_id: m.categoryId ?? null,
  }));
  const { error } = await supabase.from("metas").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`Erro ao importar metas: ${error.message}`);
}
