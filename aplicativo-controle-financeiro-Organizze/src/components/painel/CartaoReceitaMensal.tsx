
import { useFinancas } from "@/contexts/FinancasContext";
import { formatCurrency } from "@/utils/formatters";
import { Plus, TrendingUp, TrendingDown, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
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
import { FormularioAdicionarReceita } from "../formularios/FormularioAdicionarReceita";
import { MonthlyIncome } from "@/types/finance";

export const CartaoReceitaMensal = () => {
  const { receitasMensais, totalReceitaMensal, totalDespesaRecorrente, deleteMonthlyIncome } =
    useFinancas();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editando, setEditando] = useState<MonthlyIncome | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<string | null>(null);

  const receitas = receitasMensais.filter((i) => !i.tipo || i.tipo === "income");
  const despesas = receitasMensais.filter((i) => i.tipo === "expense");
  const saldo = totalReceitaMensal - totalDespesaRecorrente;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold dark:text-gray-100">Transações recorrentes</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Nova transação recorrente</DialogTitle>
            <DialogDescription>
              Adicione receitas ou despesas mensais fixas
            </DialogDescription>
            <FormularioAdicionarReceita onClose={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Receitas</p>
          <p className="text-lg font-bold text-green-500">{formatCurrency(totalReceitaMensal)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Despesas</p>
          <p className="text-lg font-bold text-red-500">{formatCurrency(totalDespesaRecorrente)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Saldo</p>
          <p className={`text-lg font-bold ${saldo >= 0 ? "text-green-500" : "text-red-500"}`}>
            {formatCurrency(saldo)}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {receitasMensais.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            <p>Nenhuma transação recorrente cadastrada</p>
            <Button onClick={() => setIsAddOpen(true)} className="mt-3" variant="outline" size="sm">
              Adicionar
            </Button>
          </div>
        ) : (
          <>
            {receitas.map((item) => (
              <RecorrenteItem
                key={item.id}
                item={item}
                onEditar={() => setEditando(item)}
                onExcluir={() => setConfirmarExclusao(item.id)}
              />
            ))}
            {despesas.map((item) => (
              <RecorrenteItem
                key={item.id}
                item={item}
                onEditar={() => setEditando(item)}
                onExcluir={() => setConfirmarExclusao(item.id)}
              />
            ))}
          </>
        )}
      </div>

      {/* Dialog de edição */}
      <Dialog open={!!editando} onOpenChange={(open) => !open && setEditando(null)}>
        <DialogContent>
          <DialogTitle>Editar transação recorrente</DialogTitle>
          <DialogDescription>Altere os dados da transação recorrente</DialogDescription>
          {editando && (
            <FormularioAdicionarReceita
              initialValues={editando}
              onClose={() => setEditando(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog
        open={!!confirmarExclusao}
        onOpenChange={(open) => !open && setConfirmarExclusao(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover transação recorrente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta transação recorrente será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (confirmarExclusao) deleteMonthlyIncome(confirmarExclusao);
                setConfirmarExclusao(null);
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

function RecorrenteItem({
  item,
  onEditar,
  onExcluir,
}: {
  item: MonthlyIncome;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const isExpense = item.tipo === "expense";
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isExpense ? "bg-red-100 dark:bg-red-900/30" : "bg-green-100 dark:bg-green-900/30"
          }`}
        >
          {isExpense ? (
            <TrendingDown className="w-4 h-4 text-red-500" />
          ) : (
            <TrendingUp className="w-4 h-4 text-green-500" />
          )}
        </div>
        <p className="font-medium text-sm dark:text-gray-200">{item.description}</p>
      </div>
      <div className="flex items-center gap-1">
        <span className={`font-medium text-sm ${isExpense ? "text-red-500" : "text-green-500"}`}>
          {isExpense ? "-" : "+"}
          {formatCurrency(item.amount)}
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onEditar}
        >
          <Pencil className="w-3 h-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
          onClick={onExcluir}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
