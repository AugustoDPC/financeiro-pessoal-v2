
import { useFinancas } from "@/contexts/FinancasContext";
import { CategoryType } from "@/types/finance";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { CreditCard, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface FormularioAdicionarTransacaoProps {
  onClose: () => void;
}

const formSchema = z
  .object({
    description: z.string().min(1, { message: "Descrição é obrigatória" }),
    amount: z.coerce.number().min(0.01, { message: "Valor deve ser maior que zero" }),
    date: z.string().min(1, { message: "Data é obrigatória" }),
    categoryId: z.string().min(1, { message: "Categoria é obrigatória" }),
    accountId: z.string().min(1, { message: "Conta é obrigatória" }),
    type: z.enum(["income", "expense"]),
    isRecurring: z.boolean().default(false),
    isParcelada: z.boolean().default(false),
    installments: z.coerce.number().min(2).max(48).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isParcelada && (!data.installments || data.installments < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o número de parcelas (mínimo 2)",
        path: ["installments"],
      });
    }
  });

export const FormularioAdicionarTransacao = ({ onClose }: FormularioAdicionarTransacaoProps) => {
  const { addTransaction, addInstallmentTransaction, contas, categorias } = useFinancas();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: format(new Date(), "yyyy-MM-dd"),
      categoryId: "other",
      accountId: contas.length > 0 ? contas[0].id : "",
      type: "expense",
      isRecurring: false,
      isParcelada: false,
      installments: undefined,
    },
  });

  const transactionType = form.watch("type");
  const isParcelada = form.watch("isParcelada");
  const amount = form.watch("amount");
  const installments = form.watch("installments") ?? 0;
  const installmentAmount = installments >= 2 ? amount / installments : 0;

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (values.isParcelada && values.installments) {
      addInstallmentTransaction({
        description: values.description,
        totalAmount: values.amount,
        installments: values.installments,
        startDate: values.date,
        categoryId: values.categoryId as CategoryType,
        accountId: values.accountId,
      });
    } else {
      addTransaction({
        description: values.description,
        amount: values.amount,
        date: values.date,
        categoryId: values.categoryId as CategoryType,
        accountId: values.accountId,
        type: values.type,
        isRecurring: values.isRecurring,
      });
    }
    onClose();
  };

  if (contas.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="mb-4">Você precisa adicionar uma conta antes de registrar transações.</p>
        <Button onClick={onClose}>Fechar</Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Adicionar nova transação</h2>

      {/* Seletor de tipo — oculto quando for parcelada (sempre despesa) */}
      {!isParcelada && (
        <Tabs
          value={transactionType}
          onValueChange={(value) => form.setValue("type", value as "income" | "expense")}
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="expense">Despesa</TabsTrigger>
            <TabsTrigger value="income">Receita</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Supermercado" {...field} />
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
                <FormLabel>{isParcelada ? "Valor total" : "Valor"}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0,00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Checkbox parcelamento — logo abaixo do valor */}
          {transactionType === "expense" && (
            <FormField
              control={form.control}
              name="isParcelada"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 rounded-lg border p-3 bg-muted/40">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (!checked) form.setValue("installments", undefined);
                      }}
                    />
                  </FormControl>
                  <div className="flex items-center gap-2 leading-none">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <FormLabel className="cursor-pointer font-medium m-0">
                      Essa despesa é parcelada
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          )}

          {/* Campos de parcelamento */}
          {isParcelada && (
            <>
              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de parcelas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="2"
                        max="48"
                        placeholder="Ex: 12"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {installments >= 2 && amount > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Valor por parcela:</strong> {formatCurrency(installmentAmount)}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {installments}x de {formatCurrency(installmentAmount)}
                  </p>
                </div>
              )}
            </>
          )}

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isParcelada ? "Data da primeira parcela" : "Data"}</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="cursor-pointer"
                    onClick={(e) => { try { (e.target as HTMLInputElement).showPicker(); } catch {} }}
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

          {/* Categoria — para despesa simples ou parcelada */}
          {(transactionType === "expense" || isParcelada) && (
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          )}

          {/* Checkbox recorrente — só para transações simples */}
          {!isParcelada && (
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 rounded-lg border p-3 bg-muted/40">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
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

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {isParcelada ? "Adicionar parcelas" : "Adicionar"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
