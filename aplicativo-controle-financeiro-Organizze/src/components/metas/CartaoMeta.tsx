import { MetaComProgresso } from "@/contexts/FinancasContext";
import { formatCurrency } from "@/utils/formatters";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Target, TrendingUp } from "lucide-react";

interface CartaoMetaProps {
  meta: MetaComProgresso;
  onEditar: (meta: MetaComProgresso) => void;
  onExcluir: (id: string) => void;
}

const corBarra: Record<MetaComProgresso["status"], string> = {
  ok: "bg-green-500",
  atencao: "bg-yellow-500",
  critico: "bg-red-500",
};

const labelStatus: Record<MetaComProgresso["status"], string> = {
  ok: "No caminho certo",
  atencao: "Atenção",
  critico: "Limite crítico",
};

export function CartaoMeta({ meta, onEditar, onExcluir }: CartaoMetaProps) {
  const percentualExibido = Math.min(meta.percentual, 100);

  const textoProgresso =
    meta.tipo === "limite_categoria"
      ? `${formatCurrency(meta.valorAtual)} de ${formatCurrency(meta.valorAlvo)} gastos`
      : `${formatCurrency(meta.valorAtual)} de ${formatCurrency(meta.valorAlvo)} economizados`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: meta.tipo === "economia" ? "#00c06b22" : "#ef535022" }}
          >
            {meta.tipo === "economia" ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <Target className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{meta.nome}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {meta.tipo === "limite_categoria" ? "Limite de categoria" : "Meta de economia"}
            </p>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onEditar(meta)}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-red-500 hover:text-red-600"
            onClick={() => onExcluir(meta.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 dark:text-gray-400">{textoProgresso}</span>
          <span
            className={`font-semibold ${
              meta.status === "critico"
                ? "text-red-500"
                : meta.status === "atencao"
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {meta.percentual}%
          </span>
        </div>

        <div className="relative h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${corBarra[meta.status]}`}
            style={{ width: `${percentualExibido}%` }}
          />
        </div>

        <p
          className={`text-xs font-medium ${
            meta.status === "critico"
              ? "text-red-500"
              : meta.status === "atencao"
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-green-600 dark:text-green-400"
          }`}
        >
          {labelStatus[meta.status]}
          {meta.tipo === "limite_categoria" && meta.valorAtual > meta.valorAlvo && " — limite ultrapassado!"}
        </p>
      </div>
    </div>
  );
}
