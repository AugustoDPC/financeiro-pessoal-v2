import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CartaoSaldo } from "@/components/painel/CartaoSaldo";
import { ListaContas } from "@/components/painel/ListaContas";
import { DespesasPorCategoria } from "@/components/painel/DespesasPorCategoria";
import { TransacoesRecentes } from "@/components/painel/TransacoesRecentes";
import { ListaTransacoes } from "@/components/painel/ListaTransacoes";
import { FiltroTransacoes } from "@/components/transacoes/FiltroTransacoes";
import { ResumoSaldo } from "@/components/transacoes/ResumoSaldo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FormularioAdicionarTransacao } from "@/components/formularios/FormularioAdicionarTransacao";
import { PlusCircle, Plus, ChevronLeft, ChevronRight, List, BarChart3, Target, Download } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFinancas } from "@/contexts/FinancasContext";
import { ResumoParcelamentos } from "@/components/painel/ResumoParcelamentos";
import { exportarTransacoesCSV } from "@/utils/exportCsv";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Relatorios from "./Relatorios";
import { PainelMetas } from "@/components/metas/PainelMetas";
import { transacoesParaMes } from "@/utils/recorrentes";

const Index = () => {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");
  const [showBalance, setShowBalance] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentDate, setCurrentDate] = useState(new Date());
  const isMobile = useIsMobile();
  const { metas, transacoes, contas, categorias } = useFinancas();
  const metasCriticas = metas.filter((m) => m.status === "critico").length;

  const currentMonth = currentDate.toISOString().substring(0, 7);
  const monthYear = currentDate.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  return (
    <DashboardLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-6 gap-2">
          <TabsList className="grid w-full sm:w-auto grid-cols-4">
            <TabsTrigger value="inicio" className="flex items-center gap-1 px-2 sm:gap-2 sm:px-3">
              <PlusCircle className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline text-xs sm:text-sm">Início</span>
            </TabsTrigger>
            <TabsTrigger value="transacoes" className="flex items-center gap-1 px-2 sm:gap-2 sm:px-3">
              <List className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline text-xs sm:text-sm">Lançamentos</span>
            </TabsTrigger>
            <TabsTrigger value="metas" className="flex items-center gap-1 px-2 sm:gap-2 sm:px-3 relative">
              <Target className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline text-xs sm:text-sm">Metas</span>
              {metasCriticas > 0 && (
                <span className="bg-red-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none flex-shrink-0">
                  {metasCriticas}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center gap-1 px-2 sm:gap-2 sm:px-3">
              <BarChart3 className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline text-xs sm:text-sm">Relatórios</span>
            </TabsTrigger>
          </TabsList>

          {!isMobile && activeTab === "inicio" && (
            <Button onClick={() => setIsAddTransactionOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova transação
            </Button>
          )}
        </div>

        <TabsContent value="inicio">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <CartaoSaldo showBalance={showBalance} onToggle={() => setShowBalance((v) => !v)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-4">
              <ListaContas showBalance={showBalance} />
              <ResumoParcelamentos />
            </div>
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 gap-4">
                <DespesasPorCategoria />
                <TransacoesRecentes onViewAll={() => setActiveTab("transacoes")} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transacoes">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-2">Lançamentos</h1>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium capitalize min-w-28 sm:min-w-32 text-center text-sm sm:text-base">{monthYear}</span>
                <Button variant="ghost" size="icon" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="self-start sm:self-auto"
              onClick={() => {
                const filtradas = transacoesParaMes(transacoes, currentMonth);
                exportarTransacoesCSV(filtradas, contas, categorias, `lancamentos-${currentMonth}.csv`);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Exportar CSV</span>
              <span className="sm:hidden">CSV</span>
            </Button>
          </div>

          <FiltroTransacoes
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedAccount={selectedAccount}
            onAccountChange={setSelectedAccount}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          <ListaTransacoes
            searchTerm={searchTerm}
            selectedAccount={selectedAccount}
            selectedCategory={selectedCategory}
            currentMonth={currentMonth}
          />

          <ResumoSaldo
            selectedAccount={selectedAccount}
            currentMonth={currentMonth}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
          />
        </TabsContent>

        <TabsContent value="metas">
          <PainelMetas />
        </TabsContent>

        <TabsContent value="relatorios">
          <Relatorios />
        </TabsContent>
      </Tabs>

      {/* Botão flutuante mobile — único, abre o modal unificado */}
      {isMobile && activeTab === "inicio" && (
        <Button
          onClick={() => setIsAddTransactionOpen(true)}
          size="icon"
          className="fixed bottom-24 right-5 h-14 w-14 rounded-full shadow-lg"
        >
          <PlusCircle className="h-8 w-8" />
        </Button>
      )}

      <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
        <DialogContent>
          <DialogTitle>Adicionar Transação</DialogTitle>
          <FormularioAdicionarTransacao onClose={() => setIsAddTransactionOpen(false)} />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Index;
