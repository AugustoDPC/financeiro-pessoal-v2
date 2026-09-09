import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinancas } from "@/contexts/FinancasContext";
import { Transaction, CategoryType } from "@/types/finance";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RefreshCw } from "lucide-react";
import { mesAnterior } from "@/utils/recorrentes";

interface FormularioEditarTransacaoProps {
  transaction: Transaction;
  onClose: () => void;
}

const formSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.number().positive("Valor deve ser positivo"),
  date: z.string(),
  categoryId: z.string(),
  accountId: z.string(),
  isRecurring: z.boolean().default(false),
});

export const FormularioEditarTransacao = ({ transaction, onClose }: FormularioEditarTransacaoProps) => {
  const { contas, updateTransaction, addTransaction, updateInstallmentGroup, reordenarParcelamento, categorias } = useFinancas();
  const { toast } = useToast();

  const isInstallment = !!transaction.installments;
  const dateParaSalvar = transaction.originalDate ?? transaction.date;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: transaction.description,
      amount: transaction.amount,
      date: dateParaSalvar,
      categoryId: transaction.categoryId,
      accountId: transaction.accountId,
      isRecurring: transaction.isRecurring ?? false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isInstallment && transaction.installments?.installmentId) {
        await updateInstallmentGroup(transaction.installments.installmentId, {
          description: values.description,
          amount: values.amount,
          categoryId: values.categoryId,
          accountId: values.accountId,
        });

        if (values.date !== dateParaSalvar) {
          await reordenarParcelamento(
            transaction.installments.installmentId,
            transaction.installments.current,
            values.date,
          );
        }
      } else {
        const wasRecurring = transaction.isRecurring === true;
        const willBeRecurring = values.isRecurring;
        const mesVisualizado = transaction.date.substring(0, 7);
        const mesOriginal = dateParaSalvar.substring(0, 7);

        let isRecurringFinal = willBeRecurring;
        let recurringEndDate: string | undefined = transaction.recurringEndDate;

        if (wasRecurring && !willBeRecurring) {
          if (mesVisualizado === mesOriginal) {
            isRecurringFinal = false;
            recurringEndDate = undefined;
          } else {
            isRecurringFinal = true;
            recurringEndDate = mesAnterior(mesVisualizado);
          }

          const updatedTransaction: Transaction = {
            ...transaction,
            description: values.description,
            amount: values.amount,
            date: mesVisualizado === mesOriginal ? values.date : dateParaSalvar,
            categoryId: values.categoryId as CategoryType,
            accountId: values.accountId,
            isRecurring: isRecurringFinal,
            recurringEndDate,
            originalDate: undefined,
          };
          await updateTransaction(updatedTransaction);
        } else if (wasRecurring && willBeRecurring && mesVisualizado !== mesOriginal) {
          // Split: stop old tx at previous month, create new one from current month forward
          const stopOld: Transaction = {
            ...transaction,
            date: dateParaSalvar,
            isRecurring: true,
            recurringEndDate: mesAnterior(mesVisualizado),
            originalDate: undefined,
          };
          await updateTransaction(stopOld);

          const diaOriginal = dateParaSalvar.substring(8, 10);
          await addTransaction({
            description: values.description,
            amount: values.amount,
            date: `${mesVisualizado}-${diaOriginal}`,
            categoryId: values.categoryId as CategoryType,
            accountId: values.accountId,
            type: transaction.type,
            isRecurring: true,
          });
        } else {
          const updatedTransaction: Transaction = {
            ...transaction,
            description: values.description,
            amount: values.amount,
            date: values.date,
            categoryId: values.categoryId as CategoryType,
            accountId: values.accountId,
            isRecurring: isRecurringFinal,
            recurringEndDate: wasRecurring && willBeRecurring ? undefined : recurringEndDate,
            originalDate: undefined,
          };
          await updateTransaction(updatedTransaction);
        }
      }

      onClose();
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao atualizar transação", variant: "destructive" });
    }
  };

  if (contas.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-4">Você precisa criar uma conta primeiro.</p>
        <Button onClick={onClose}>Fechar</Button>
      </div>
    );
  }

  const openDatePicker = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
      (e.target as HTMLInputElement).showPicker();
    } catch {}
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Editar Transação</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input placeholder="Digite a descrição" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor {isInstallment ? "(por parcela)" : ""}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isInstallment ? "Data da parcela (reorganiza grupo)" : "Data"}</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="cursor-pointer"
                    onClick={openDatePicker}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conta</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma conta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {contas.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {transaction.type === "expense" && (
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categorias.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {isInstallment && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Parcela:</strong> {transaction.installments!.current}/{transaction.installments!.total}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Descrição, valor, conta e categoria serão atualizados em todas as parcelas.
                Alterar a data reorganiza todas as datas do grupo.
              </p>
            </div>
          )}

          {!isInstallment && (
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 rounded-lg border p-3 bg-muted/40">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="flex items-center gap-2 leading-none">
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    <FormLabel className="cursor-pointer font-medium m-0">
                      Conta fixa (recorrente todo mês)
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
