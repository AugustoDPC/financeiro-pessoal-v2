import { useToast } from "@/hooks/use-toast";

export type ToastFn = ReturnType<typeof useToast>["toast"];

export const criarNotificador = (toast: ToastFn) => {
  const sucesso = (acao: string, detalhe?: string) => {
    toast({ title: acao, description: detalhe });
  };

  const erro = (acao: string, detalhe?: string) => {
    toast({
      variant: "destructive",
      title: "Erro ao " + acao,
      description: detalhe ?? "Tente novamente.",
    });
  };

  return {
    sucesso,
    erro,

    // Contas
    contaAdicionada: () => sucesso("Conta adicionada", "A conta foi adicionada com sucesso."),
    contaAtualizada: () => sucesso("Conta atualizada", "A conta foi atualizada com sucesso."),
    contaRemovida: () => sucesso("Conta removida", "A conta foi removida com sucesso."),

    // Transações
    transacaoAdicionada: () => sucesso("Transação adicionada", "A transação foi adicionada com sucesso."),
    transacaoAtualizada: () => sucesso("Transação atualizada", "A transação foi atualizada com sucesso."),
    transacaoRemovida: () => sucesso("Transação removida", "A transação foi removida com sucesso."),

    // Receitas
    receitaAdicionada: () => sucesso("Receita adicionada", "A receita foi adicionada com sucesso."),
    receitaAtualizada: () => sucesso("Receita atualizada", "A receita foi atualizada com sucesso."),
    receitaRemovida: () => sucesso("Receita removida", "A receita foi removida com sucesso."),

    // Metas
    metaCriada: (nome: string) => sucesso("Meta criada", `"${nome}" foi adicionada.`),
    metaAtualizada: (nome: string) => sucesso("Meta atualizada", `"${nome}" foi atualizada.`),
    metaRemovida: () => sucesso("Meta removida", "A meta foi removida."),

    // Categorias
    categoriaAdicionada: (nome: string) => sucesso("Categoria criada", `"${nome}" foi adicionada.`),
    categoriaAtualizada: (nome: string) => sucesso("Categoria atualizada", `"${nome}" foi atualizada.`),
    categoriaRemovida: () => sucesso("Categoria removida", "A categoria foi removida."),

    // Erros predefinidos
    erroConta: () => erro("gerenciar a conta", "Não foi possível realizar a operação na conta."),
    erroTransacao: () => erro("gerenciar a transação", "Não foi possível realizar a operação na transação."),
    erroReceita: () => erro("gerenciar a receita", "Não foi possível realizar a operação na receita."),
    erroMeta: () => erro("gerenciar a meta", "Não foi possível realizar a operação na meta."),
    erroCategoria: () => erro("gerenciar a categoria", "Não foi possível realizar a operação na categoria."),
  };
};

export type Notificador = ReturnType<typeof criarNotificador>;
