
import { useFinancas } from "@/contexts/FinancasContext";
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

interface FormularioAdicionarContaProps {
  onClose: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Nome da conta é obrigatório" }),
  type: z.enum(["checking", "savings", "credit", "investment", "other"], {
    required_error: "Selecione um tipo de conta",
  }),
});

export const FormularioAdicionarConta = ({ onClose }: FormularioAdicionarContaProps) => {
  const { addAccount } = useFinancas();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "checking",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Explicitly cast the values to ensure all required fields are present
    const accountData = {
      name: values.name,
      type: values.type,
      balance: 0, // Always start with 0 balance
    };
    
    addAccount(accountData);
    onClose();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Adicionar nova conta</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da conta</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Nubank" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de conta</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de conta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="checking">Conta Corrente</SelectItem>
                    <SelectItem value="savings">Conta Poupança</SelectItem>
                    <SelectItem value="credit">Cartão de Crédito</SelectItem>
                    <SelectItem value="investment">Investimento</SelectItem>
                    <SelectItem value="other">Outra</SelectItem>
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
            <Button type="submit">Adicionar</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
