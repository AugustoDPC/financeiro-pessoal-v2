import { useState, useRef, useEffect } from "react";
import { Transaction } from "@/types/finance";
import { formatCurrency } from "@/utils/formatters";
import { useFinancas } from "@/contexts/FinancasContext";
import { useIsMobile } from "@/hooks/use-mobile";
import * as Icons from "lucide-react";
import { CreditCard, Edit3, Trash2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DialogTitle } from "@/components/ui/dialog";
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
import { FormularioEditarTransacao } from "../formularios/FormularioEditarTransacao";

interface ItemTransacaoDeslizavelProps {
  transaction: Transaction;
  nomeConta: string;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (transaction: Transaction | null) => void;
}

export const ItemTransacaoDeslizavel = ({
  transaction,
  nomeConta,
  onEdit,
  onDelete,
  editingTransaction,
  setEditingTransaction
}: ItemTransacaoDeslizavelProps) => {
  const isMobile = useIsMobile();
  const { categorias, deleteInstallmentGroup } = useFinancas();
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);

  const isInstallment = !!transaction.installments;

  const deleteConfirmTitle = isInstallment
    ? "Excluir todas as parcelas?"
    : "Excluir transação?";

  const deleteConfirmDescription = isInstallment
    ? `Essa ação vai excluir todas as ${transaction.installments!.total} parcelas de "${transaction.description}" (não apenas esta). Deseja continuar?`
    : `Tem certeza que deseja excluir "${transaction.description}"? Esta ação não pode ser desfeita.`;

  const getCategoryIcon = (iconName?: string) => {
    const Icone = (Icons as Record<string, React.ElementType>)[iconName ?? "Tag"] ?? Icons.Tag;
    return <Icone className="w-5 h-5" />;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getDate().toString().padStart(2, '0');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isDragging) return;

    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;

    if (deltaX < 0) {
      setSwipeOffset(Math.max(deltaX, -120));
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    setIsDragging(false);

    if (swipeOffset < -60) {
      setSwipeOffset(-120);
      setShowActionButtons(true);
    } else {
      setSwipeOffset(0);
      setShowActionButtons(false);
    }
  };

  const executeDelete = () => {
    if (isInstallment) {
      deleteInstallmentGroup(transaction.installments!.installmentId);
    } else {
      onDelete(transaction.id);
    }
    setSwipeOffset(0);
    setShowActionButtons(false);
  };

  const handleDeleteRequest = () => {
    setShowDeleteConfirm(true);
    setSwipeOffset(0);
    setShowActionButtons(false);
  };

  const handleEdit = () => {
    setEditingTransaction(transaction);
    setSwipeOffset(0);
    setShowActionButtons(false);
  };

  const resetSwipe = () => {
    setSwipeOffset(0);
    setShowActionButtons(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        resetSwipe();
      }
    };

    if (showActionButtons && isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActionButtons, isMobile]);

  const category = categorias.find(c => c.id === transaction.categoryId);

  const confirmDeleteDialog = (
    <AlertDialog open={showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{deleteConfirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{deleteConfirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={executeDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (isMobile) {
    return (
      <>
        <div className="relative overflow-hidden mx-4 rounded-lg" ref={containerRef}>
          {showActionButtons && (
            <div className="absolute inset-0 bg-gradient-to-l from-red-500 to-blue-500 flex items-center justify-end pr-4 gap-2 rounded-lg">
              <Button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white z-20 h-10 w-10 p-0 rounded-full"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleDeleteRequest}
                className="bg-red-600 hover:bg-red-700 text-white z-20 h-10 w-10 p-0 rounded-full"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div
            className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 flex items-center justify-between transition-transform duration-200 ease-out relative z-10 w-full"
            style={{
              transform: `translateX(${swipeOffset}px)`,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="text-gray-400 dark:text-gray-500 text-lg font-mono w-8 text-center flex-shrink-0">
                {formatDate(transaction.date)}
              </div>

              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: category ? category.color : '#e2e8f0',
                  color: 'white'
                }}
              >
                {getCategoryIcon(category?.icon)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium truncate">{transaction.description}</span>
                  {transaction.isRecurring && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0 gap-1">
                      <RefreshCw className="w-2.5 h-2.5" />
                      Fixo
                    </Badge>
                  )}
                  {transaction.installments && (
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      <CreditCard className="w-3 h-3 mr-1" />
                      {transaction.installments.current}/{transaction.installments.total}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></span>
                  <span className="truncate">{nomeConta}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`font-medium text-right ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                <div className="whitespace-nowrap">
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  ✓
                </div>
              </div>
            </div>
          </div>

          <Dialog open={editingTransaction?.id === transaction.id} onOpenChange={(open) => !open && setEditingTransaction(null)}>
            <DialogContent className="max-w-md">
              <DialogTitle>Editar Transação</DialogTitle>
              {editingTransaction && (
                <FormularioEditarTransacao
                  transaction={editingTransaction}
                  onClose={() => setEditingTransaction(null)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        {confirmDeleteDialog}
      </>
    );
  }

  // Desktop version
  return (
    <>
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 flex items-center justify-between mx-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="text-gray-400 text-lg font-mono w-8 text-center flex-shrink-0">
            {formatDate(transaction.date)}
          </div>

          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: category ? category.color : '#e2e8f0',
              color: 'white'
            }}
          >
            {getCategoryIcon(category?.icon)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium truncate">{transaction.description}</span>
              {transaction.isRecurring && (
                <Badge variant="secondary" className="text-xs flex-shrink-0 gap-1">
                  <RefreshCw className="w-2.5 h-2.5" />
                  Fixo
                </Badge>
              )}
              {transaction.installments && (
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  <CreditCard className="w-3 h-3 mr-1" />
                  {transaction.installments.current}/{transaction.installments.total}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></span>
              <span className="truncate">{nomeConta}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`font-medium text-right ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
            <div className="whitespace-nowrap">
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              ✓
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <Dialog open={editingTransaction?.id === transaction.id} onOpenChange={(open) => !open && setEditingTransaction(null)}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-blue-600"
                  onClick={() => setEditingTransaction(transaction)}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogTitle>Editar Transação</DialogTitle>
                {editingTransaction && (
                  <FormularioEditarTransacao
                    transaction={editingTransaction}
                    onClose={() => setEditingTransaction(null)}
                  />
                )}
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-red-600"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {confirmDeleteDialog}
    </>
  );
};
