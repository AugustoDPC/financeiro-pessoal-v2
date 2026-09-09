
import { useFinancas } from "@/contexts/FinancasContext";
import { MonthlyIncome } from "@/types/finance";
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

interface FormularioAdicionarReceitaProps {
  onClose: () => void;
  initialValues?: MonthlyIncome;
}

const formSchema = z.object({
  tipo: z.enum(["income", "expense"]),
  description: z.string().min(1, { message: "Descrição é obrigatória" }),
  amount: z.coerce.number().min(0.01, { message: "Valor deve ser maior que zero" }),
  categoryId: z.string().optional(),
});

export const FormularioAdicionarReceita = ({
  onClose,
  initialValues,
}: FormularioAdicionarReceitaProps) => {
  const { addMonthlyIncome, updateMonthlyIncome, categorias } = useFinancas();
  const isEditing = !!initialValues;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: initialValues?.tipo ?? "income",
      description: initialValues?.description ?? "",
      amount: initialValues?.amount ?? 0,
      categoryId: initialValues?.categoryId ?? "",
    },
  });

  const tipo = form.watch("tipo");

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload = {
      description: values.description,
      amount: values.amount,
      tipo: values.tipo,
      ...(values.tipo === "expense" && values.categoryId ? { categoryId: values.categoryId } : { categoryId: undefined }),
    };

    if (isEditing) {
      updateMonthlyIncome({ ...payload, id: initialValues.id });
    } else {
      addMonthlyIncome(payload);
    }
    onClose();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        {isEditing
          ? "Editar transação recorrente"
          : tipo === "income"
          ? "Adicionar receita recorrente"
          : "Adicionar despesa recorrente"}
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input
                    placeholder={tipo === "income" ? "Ex: Salário" : "Ex: Aluguel"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {tipo === "expense" && (
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0,00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{isEditing ? "Salvar" : "Adicionar"}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
