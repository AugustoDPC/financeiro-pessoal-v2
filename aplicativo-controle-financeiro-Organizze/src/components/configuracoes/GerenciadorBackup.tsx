import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DownloadCloud, UploadCloud, AlertCircle, CheckCircle2 } from "lucide-react";
import { exportarBackup, importarBackup, DadosBackup } from "@/utils/backupService";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancas } from "@/contexts/FinancasContext";

export const GerenciadorBackup = () => {
  const { user } = useAuth();
  const { contas, transacoes, receitasMensais, categorias, metas, refreshData } = useFinancas();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ── Exportar ──────────────────────────────────────────────────────────────
  const handleExport = () => {
    const dados: DadosBackup = {
      version: 2,
      exportedAt: new Date().toISOString().substring(0, 10),
      contas,
      transacoes,
      receitasMensais,
      // Exporta apenas categorias customizadas para evitar duplicar as padrão no restore
      categorias: categorias.filter((c) => c.custom),
      metas: metas.map(({ valorAtual: _va, percentual: _p, status: _s, ...meta }) => meta),
    };
    exportarBackup(dados);
  };

  // ── Importar ──────────────────────────────────────────────────────────────
  const handleImportClick = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user?.id) {
      setErrorMessage("Usuário não autenticado.");
      return;
    }

    setIsImporting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await importarBackup(file, user.id);
      // Recarrega os dados do contexto sem precisar de reload da página
      await refreshData();
      setSuccessMessage("Backup importado com sucesso!");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erro ao importar backup.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Backup e restauração</CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Exporte seus dados ou restaure a partir de um arquivo de backup JSON.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700 dark:text-gray-200">Exportar dados</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Baixe um arquivo JSON com todos os seus dados financeiros
            ({contas.length} conta{contas.length !== 1 ? "s" : ""},{" "}
            {transacoes.length} transaç{transacoes.length !== 1 ? "ões" : "ão"}).
          </p>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <DownloadCloud className="w-4 h-4" />
            Exportar backup
          </Button>
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        {/* Import */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700 dark:text-gray-200">Importar backup</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Restaure seus dados a partir de um arquivo de backup JSON.
            Registros existentes com o mesmo ID serão atualizados.
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleImportClick}
              disabled={isImporting}
              className="flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              {isImporting ? "Importando..." : "Importar backup"}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFileChange}
          />

          {errorMessage && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mt-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm mt-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
            A importação adiciona ou atualiza registros — não apaga dados existentes
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
