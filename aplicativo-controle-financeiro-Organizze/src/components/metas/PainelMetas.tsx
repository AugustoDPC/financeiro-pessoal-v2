import { useState } from "react";
import { useFinancas, MetaComProgresso } from "@/contexts/FinancasContext";
import { Meta } from "@/types/finance";
import { CartaoMeta } from "./CartaoMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Target, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { transacoesParaMes, mesAnterior } from "@/utils/recorrentes";

type TipoMeta = "limite_categoria" | "economia";

interface FormState {
  nome: string;
  tipo: TipoMeta;
  categoryId: string;
  valorAlvo: string;
}

const formPadrao: FormState = { nome: "", tipo: "limite_categoria", categoryId: "", valorAlvo: "" };

function mesProximo(mes: string): string {
  const [year, month] = mes.split("-").map(Number);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
}

export function PainelMetas() {
  const { metas, categorias, transacoes, addMeta, updateMeta, deleteMeta } = useFinancas();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<MetaComProgresso | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(formPadrao);

  const mesAtualStr = new Date().toISOString().substring(0, 7);
  const [mesLimites, setMesLimites] = useState(mesAtualStr);

  const mesLimitesLabel = new Date(mesLimites + "-15").toLocaleDateString("pt-BR", {
    month: "long", year: "numeric",
  });

  const navegarMesLimite = (dir: "prev" | "next") => {
    setMesLimites(dir === "prev" ? mesAnterior(mesLimites) : mesProximo(mesLimites));
  };

  // Recomputa progresso de limite para o mês selecionado
  const computarLimite = (meta: Meta): MetaComProgresso => {
    const txMes = transacoesParaMes(transacoes, mesLimites);
    const valorAtual = txMes
      .filter(t => t.type === "expense" && t.categoryId === meta.categoryId)
      .reduce((s, t) => s + t.amount, 0);
    const percentual = meta.valorAlvo > 0
      ? Math.min(Math.round((valorAtual / meta.valorAlvo) * 100), 999)
      : 0;
    const status: "ok" | "atencao" | "critico" =
      percentual >= 90 ? "critico" : percentual >= 70 ? "atencao" : "ok";
    return { ...meta, valorAtual, percentual, status };
  };

  const limites  = metas.filter(m => m.tipo === "limite_categoria");
  const economias = metas.filter(m => m.tipo === "economia");

  const abrirNova = (tipo?: TipoMeta) => {
    setEditando(null);
    setForm({ ...formPadrao, tipo: tipo ?? "limite_categoria" });
    setDialogAberto(true);
  };

  const abrirEdicao = (meta: MetaComProgresso) => {
    setEditando(meta);
    setForm({ nome: meta.nome, tipo: meta.tipo, categoryId: meta.categoryId ?? "", valorAlvo: String(meta.valorAlvo) });
    setDialogAberto(true);
  };

  const salvar = () => {
    const valorAlvo = parseFloat(form.valorAlvo);
    if (!form.nome.trim() || isNaN(valorAlvo) || valorAlvo <= 0 || !form.categoryId) return;

    const payload: Omit<Meta, "id"> = {
      nome: form.nome.trim(),
      tipo: form.tipo,
      valorAlvo,
      categoryId: form.categoryId,
    };

    if (editando) {
      updateMeta({ ...payload, id: editando.id });
    } else {
      addMeta(payload);
    }
    setDialogAberto(false);
  };

  const formularioValido =
    !!form.nome.trim() && parseFloat(form.valorAlvo) > 0 && !!form.categoryId;

  const EmptyState = ({ tipo, onNova }: { tipo: TipoMeta; onNova: () => void }) => (
    <div className="flex flex-col items-center justify-center py-10 text-center rounded-lg border border-dashed dark:border-gray-700">
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
        {tipo === "limite_categoria"
          ? <Target className="w-6 h-6 text-gray-400" />
          : <TrendingUp className="w-6 h-6 text-gray-400" />}
      </div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {tipo === "limite_categoria" ? "Nenhum limite criado" : "Nenhuma meta criada"}
      </p>
      <Button variant="outline" size="sm" className="mt-3" onClick={onNova}>
        <Plus className="w-4 h-4 mr-1" />
        {tipo === "limite_categoria" ? "Novo limite" : "Nova meta"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* ── Seção 1: Limites mensais ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-red-500" />
              Limites mensais
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Controle de gastos por categoria no mês
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navegarMesLimite("prev")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium capitalize min-w-28 text-center">{mesLimitesLabel}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navegarMesLimite("next")}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="ml-2" onClick={() => abrirNova("limite_categoria")}>
              <Plus className="w-4 h-4 mr-1" />
              Novo limite
            </Button>
          </div>
        </div>

        {limites.length === 0 ? (
          <EmptyState tipo="limite_categoria" onNova={() => abrirNova("limite_categoria")} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {limites.map(meta => (
              <CartaoMeta
                key={meta.id}
                meta={computarLimite(meta)}
                onEditar={abrirEdicao}
                onExcluir={id => setConfirmarExclusao(id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Seção 2: Metas de economia ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Metas de economia
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Acompanhe acúmulo por categoria ao longo do tempo
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => abrirNova("economia")}>
            <Plus className="w-4 h-4 mr-1" />
            Nova meta
          </Button>
        </div>

        {economias.length === 0 ? (
          <EmptyState tipo="economia" onNova={() => abrirNova("economia")} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {economias.map(meta => (
              <CartaoMeta
                key={meta.id}
                meta={meta}
                onEditar={abrirEdicao}
                onExcluir={id => setConfirmarExclusao(id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Dialog criar / editar ── */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar" : (form.tipo === "limite_categoria" ? "Novo limite" : "Nova meta")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                placeholder={form.tipo === "limite_categoria" ? "Ex: Limite alimentação" : "Ex: Meta viagem"}
              />
            </div>

            <div className="space-y-1">
              <Label>Categoria</Label>
              <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>{form.tipo === "limite_categoria" ? "Limite mensal (R$)" : "Valor alvo (R$)"}</Label>
              <Input
                type="number" min="0.01" step="0.01"
                value={form.valorAlvo}
                onChange={e => setForm(f => ({ ...f, valorAlvo: e.target.value }))}
                placeholder="0,00"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button onClick={salvar} disabled={!formularioValido} className="flex-1">
                {editando ? "Salvar" : "Criar"}
              </Button>
              <Button variant="outline" onClick={() => setDialogAberto(false)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Confirmação exclusão ── */}
      <AlertDialog open={!!confirmarExclusao} onOpenChange={open => !open && setConfirmarExclusao(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir?</AlertDialogTitle>
            <AlertDialogDescription>Esta meta será removida permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => { if (confirmarExclusao) deleteMeta(confirmarExclusao); setConfirmarExclusao(null); }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
