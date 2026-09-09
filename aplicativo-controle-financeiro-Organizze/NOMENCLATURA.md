# Nomenclatura do Projeto — Controle Financeiro Pessoal

Este documento descreve as convenções de nomenclatura adotadas no projeto.

---

## Arquivos

| Tipo | Convenção | Exemplos |
|------|-----------|---------|
| Componentes React | PascalCase PT (`.tsx`) | `CartaoSaldo.tsx`, `ListaContas.tsx`, `PainelMetas.tsx` |
| Utilitários / Serviços / Hooks | camelCase (`.ts`) | `datas.ts`, `contasService.ts`, `use-toast.ts` |
| Testes | mesmo nome do arquivo testado + `.test.ts` | `contasService.test.ts`, `metasService.test.ts` |

---

## Componentes React

- **Convenção**: PascalCase em português.
- **Exemplos**: `CartaoSaldo`, `ListaContas`, `PainelMetas`, `FormularioTransacao`, `GraficoResumo`.

---

## Hooks

- **Convenção**: prefixo `use` (padrão React) ou `usar` (PT), seguido de nome descritivo.
- **Exemplos**: `useFinancas`, `useTheme`, `useIsMobile`, `usarDadosFinanceiros`.

---

## Serviços

- **Arquivos**: sufixo `Service` em PT, camelCase.
  - `contasService.ts`, `transacoesService.ts`, `receitasService.ts`, `metasService.ts`, `resumoService.ts`
- **Funções exportadas**: verbos em PT.
  - `adicionarConta`, `obterContas`, `atualizarTransacao`, `removerMeta`

---

## Context

- **Convenção**: prefixo PT para o contexto e o provider.
- **Exemplos**: `FinancasContext`, `FinancasProvider`, `useFinancas`.
- Aliases em inglês para compatibilidade retroativa: `FinanceProvider`, `useFinance`.

---

## Tipos e Interfaces

- **Convenção**: PascalCase em português.
- **Exemplos**: `Conta`, `Transacao`, `ReceitaMensal`, `Meta`, `Categoria`, `DadosFinanceirosUsuario`.
- **Aliases em inglês** para compatibilidade retroativa: `Account`, `Transaction`, `MonthlyIncome`, `UserFinancialData`.

---

## Estado no Contexto

- **Convenção**: substantivos em PT, camelCase.
- **Exemplos**: `contas`, `transacoes`, `receitasMensais`, `metas`, `categorias`, `totalReceitaMensal`.

---

## Funções no Contexto

- **Convenção**: verbos em PT, camelCase.
- **Exemplos**: `adicionarConta`, `atualizarConta`, `removerConta`, `adicionarTransacao`, `atualizarTransacao`, `removerMeta`.

---

## Constantes

- **Convenção**: SCREAMING_SNAKE_CASE em PT quando aplicável.
- **Exemplos**: `LIMITE_TOAST`, `ATRASO_REMOCAO`, `CATEGORIAS_PADRAO`.

---

## Resumo Rápido

```
src/
├── components/
│   ├── CartaoSaldo.tsx        # PascalCase PT
│   ├── ListaContas.tsx
│   └── PainelMetas.tsx
├── services/
│   ├── contasService.ts       # camelCase + sufixo Service
│   └── transacoesService.ts
├── hooks/
│   ├── useFinancas.ts         # prefixo use/usar
│   └── useIsMobile.ts
├── contexts/
│   └── FinancasContext.tsx    # PascalCase PT
├── types/
│   └── finance.ts             # tipos em PT, aliases em inglês
├── utils/
│   ├── datas.ts               # camelCase
│   └── notificacoes.ts
└── test/
    ├── contasService.test.ts  # mesmo nome + .test.ts
    └── metasService.test.ts
```
