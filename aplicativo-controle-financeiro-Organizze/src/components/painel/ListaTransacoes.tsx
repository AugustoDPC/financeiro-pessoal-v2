
import { useFinancas } from "@/contexts/FinancasContext";
import { Transaction } from "@/types/finance";
import { useState } from "react";
import { ItemTransacaoDeslizavel } from "./ItemTransacaoDeslizavel";
import { transacoesParaMes } from "@/utils/recorrentes";

interface ListaTransacoesProps {
  searchTerm?: string;
  selectedAccount?: string;
  selectedCategory?: string;
  currentMonth?: string;
}

export const ListaTransacoes = ({
  searchTerm = "",
  selectedAccount = "all",
  selectedCategory = "all",
  currentMonth
}: ListaTransacoesProps) => {
  const { transacoes, contas, deleteTransaction } = useFinancas();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Filtra transações.
  // Quando há mês selecionado usa transacoesParaMes para incluir recorrentes.
  let transacoesFiltradas = currentMonth
    ? transacoesParaMes(transacoes, currentMonth)
    : transacoes;

  // Filtra por busca (descrição ou nome da conta).
  if (searchTerm) {
    transacoesFiltradas = transacoesFiltradas.filter(t => {
      const account = contas.find(a => a.id === t.accountId);
      const nomeConta = account ? account.name.toLowerCase() : '';
      return t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
             nomeConta.includes(searchTerm.toLowerCase());
    });
  }

  // Filtra por conta.
  if (selectedAccount !== "all") {
    transacoesFiltradas = transacoesFiltradas.filter(t =>
      t.accountId === selectedAccount
    );
  }

  // Filtra por categoria.
  if (selectedCategory !== "all") {
    transacoesFiltradas = transacoesFiltradas.filter(t =>
      t.categoryId === selectedCategory
    );
  }
  
  // Ordena por data (mais recentes primeiro).
  const transacoesOrdenadas = transacoesFiltradas.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const obterNomeConta = (accountId: string) => {
    const account = contas.find(a => a.id === accountId);
    return account ? account.name : 'Conta não encontrada';
  };

  if (transacoesOrdenadas.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8 max-h-96 overflow-y-auto">
        <p>Nenhum lançamento encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto -mx-4">
      {transacoesOrdenadas.map((transaction) => {
        const nomeConta = obterNomeConta(transaction.accountId);
        
        return (
          <ItemTransacaoDeslizavel
            key={transaction.id}
            transaction={transaction}
            nomeConta={nomeConta}
            onEdit={setEditingTransaction}
            onDelete={deleteTransaction}
            editingTransaction={editingTransaction}
            setEditingTransaction={setEditingTransaction}
          />
        );
      })}
    </div>
  );
};
