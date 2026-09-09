
import { useFinancas } from "@/contexts/FinancasContext";
import { CategoryType } from "@/types/finance";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { CreditCard } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface FormularioAdicionarTransacaoParceladaProps {
  onClose: () => void;
}

const formSchema = z.object({
  description: z.string().min(1, { message: "Descrição é obrigatória" }),
  totalAmount: z.coerce.number().min(0.01, { message: "Valor deve ser maior que zero" }),
  installments: z.coerce.number().min(1).max(48, { message: "Parcelas devem ser entre 1 e 48" }),
  startDate: z.string().min(1, { message: "Data é obrigatória" }),
  categoryId: z.string().min(1, { message: "Categoria é obrigatória" }),
  accountId: z.string().min(1, { message: "Conta é obrigatória" }),
});

export const FormularioAdicionarTransacaoParcelada = ({ onClose }: FormularioAdicionarTransacaoParceladaProps) => {
  const { addInstallmentTransaction, contas, categorias } = useFinancas();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      totalAmount: 0,
      installments: 1,
      startDate: format(new Date(), "yyyy-MM-dd"),
      categoryId: "other",
      accountId: contas.length > 0 ? contas[0].id : "",
    },
  });

  const totalAmount = form.watch("totalAmount");
  const installments = form.watch("installments");
  const installmentAmount = installments > 0 ? totalAmount / installments : 0;

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const installmentData = {
      description: values.description,
      totalAmount: values.totalAmount,
      installments: values.installments,
      startDate: values.startDate,
      categoryId: values.categoryId as CategoryType,
      accountId: values.accountId,
    };
    
    addInstallmentTransaction(installmentData);
    onClose();
  };

  if (contas.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="mb-4">
          Você precisa adicionar uma conta antes de registrar transações parceladas.
        </p>
        <Button onClick={onClose}>Fechar</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Adicionar despesa parcelada</h2>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Notebook" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor total</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="installments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parcelas</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="48"
                      placeholder="1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {installments > 1 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Valor por parcela:</strong> {formatCurrency(installmentAmount)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {installments} parcelas de {formatCurrency(installmentAmount)}
              </p>
            </div>
          )}

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data da primeira parcela</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta" />
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

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
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

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar parcelas</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
