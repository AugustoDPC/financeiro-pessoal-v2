import { useState } from "react";
import { useFinancas } from "@/contexts/FinancasContext";
import { Category } from "@/types/finance";
import { iconesDisponiveis, coresDiisponiveis } from "@/services/categoriasService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import * as Icons from "lucide-react";
import { Pencil, Trash2, Plus } from "lucide-react";

const IconeCategoria = ({ nome, cor }: { nome: string; cor: string }) => {
  const Icone = (Icons as Record<string, React.ElementType>)[nome] ?? Icons.Tag;
  return <Icone className="w-5 h-5" style={{ color: cor }} />;
};

interface FormState {
  name: string;
  color: string;
  icon: string;
}

const formPadrao: FormState = {
  name: "",
  color: coresDiisponiveis[0],
  icon: iconesDisponiveis[0],
};

export function GerenciadorCategorias() {
  const { categorias, transacoes, addCategoria, updateCategoria, deleteCategoria } = useFinancas();

  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<Category | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(formPadrao);

  const abrirNova = () => {
    setEditando(null);
    setForm(formPadrao);
    setDialogAberto(true);
  };

  const abrirEdicao = (cat: Category) => {
    setEditando(cat);
    setForm({ name: cat.name, color: cat.color, icon: cat.icon });
    setDialogAberto(true);
  };

  const salvar = () => {
    if (!form.name.trim()) return;
    if (editando) {
      updateCategoria({ ...editando, ...form });
    } else {
      addCategoria(form);
    }
    setDialogAberto(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Categorias</CardTitle>
        <Button size="sm" onClick={abrirNova}>
          <Plus className="w-4 h-4 mr-1" />
          Nova
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {categorias.map((cat) => (
            <li key={cat.id} className="flex items-center justify-between gap-3 py-1">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: cat.color + "22" }}
                >
                  <IconeCategoria nome={cat.icon} cor={cat.color} />
                </div>
                <span className="text-sm font-medium">{cat.name}</span>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => abrirEdicao(cat)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-500 hover:text-red-600"
                  onClick={() => setConfirmarExclusao(cat)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>

      {/* Dialog de criação / edição */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar categoria" : "Nova categoria"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Academia"
              />
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {coresDiisponiveis.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: cor,
                      borderColor: form.color === cor ? "#000" : "transparent",
                    }}
                    onClick={() => setForm((f) => ({ ...f, color: cor }))}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="flex flex-wrap gap-2">
                {iconesDisponiveis.map((icone) => {
                  const Icone = (Icons as Record<string, React.ElementType>)[icone] ?? Icons.Tag;
                  return (
                    <button
                      key={icone}
                      type="button"
                      className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors"
                      style={{
                        backgroundColor: form.icon === icone ? form.color + "33" : "transparent",
                        borderColor: form.icon === icone ? form.color : "#e5e7eb",
                      }}
                      onClick={() => setForm((f) => ({ ...f, icon: icone }))}
                    >
                      <Icone className="w-4 h-4" style={{ color: form.color }} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={salvar} disabled={!form.name.trim()} className="flex-1">
                {editando ? "Salvar" : "Criar"}
              </Button>
              <Button variant="outline" onClick={() => setDialogAberto(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog
        open={!!confirmarExclusao}
        onOpenChange={(open) => !open && setConfirmarExclusao(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              A categoria <strong>{confirmarExclusao?.name}</strong> será removida permanentemente.
              {confirmarExclusao && transacoes.some(t => t.categoryId === confirmarExclusao.id) && (
                <span className="block mt-1 text-orange-600 dark:text-orange-400">
                  Atenção: existem transações vinculadas a essa categoria.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (confirmarExclusao) deleteCategoria(confirmarExclusao.id);
                setConfirmarExclusao(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
