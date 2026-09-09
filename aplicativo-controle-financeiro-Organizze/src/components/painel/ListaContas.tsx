
import { useFinancas } from "@/contexts/FinancasContext";
import { Account } from "@/types/finance";
import { formatCurrency } from "@/utils/formatters";
import {
  CreditCard,
  PiggyBank,
  Briefcase,
  Building,
  Building2,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormularioAdicionarConta } from "../formularios/FormularioAdicionarConta";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ListaContasProps {
  showBalance: boolean;
}

export const ListaContas = ({ showBalance }: ListaContasProps) => {
  const { contas, deleteAccount } = useFinancas();
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  const getAccountIcon = (type: Account["type"]) => {
    switch (type) {
      case "checking":
        return <Building className="w-5 h-5 text-blue-500" />;
      case "savings":
        return <PiggyBank className="w-5 h-5 text-green-500" />;
      case "credit":
        return <CreditCard className="w-5 h-5 text-purple-500" />;
      case "investment":
        return <Briefcase className="w-5 h-5 text-amber-500" />;
      default:
        return <Building className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Minhas contas</h2>
        <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Adicionar Nova Conta</DialogTitle>
            <DialogDescription>Crie uma nova conta para gerenciar suas finanças</DialogDescription>
            <FormularioAdicionarConta onClose={() => setIsAddAccountOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {contas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-700 dark:text-gray-300">Nenhuma conta cadastrada</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Adicione uma conta para começar</p>
            </div>
            <Button onClick={() => setIsAddAccountOpen(true)} className="mt-1">
              Adicionar conta
            </Button>
          </div>
        ) : (
          contas.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {getAccountIcon(account.type)}
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {account.type === "checking"
                      ? "Conta Corrente"
                      : account.type === "savings"
                      ? "Conta Poupança"
                      : account.type === "credit"
                      ? "Cartão de crédito"
                      : account.type === "investment"
                      ? "Investimento"
                      : "Outra"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-medium">
                  {showBalance ? formatCurrency(account.balance) : "••••"}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir conta</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir a conta "{account.name}"? 
                        Todas as transações relacionadas a esta conta também serão removidas. 
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteAccount(account.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
};
