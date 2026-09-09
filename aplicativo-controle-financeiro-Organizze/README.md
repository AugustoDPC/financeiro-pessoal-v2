# Controle Financeiro Pessoal


## 📝 Descrição do projeto

O **Controle Financeiro Pessoal** é um sistema web para ajudar no planejamento e no acompanhamento das finanças pessoais.

### Resumo
- **O que é:** uma aplicação para registrar contas, receitas e despesas, com visão clara do saldo e relatórios mensais.
- **Objetivo:** facilitar a organização financeira e apoiar decisões de consumo com base em dados reais do mês.
- **Assunto principal:** educação financeira prática, controle de gastos e construção de hábitos financeiros saudáveis.

## O que é este projeto?

O **Controle Financeiro Pessoal** é uma aplicação web para organização financeira do dia a dia. Ele ajuda o usuário a registrar movimentações, acompanhar o saldo e visualizar relatórios para entender melhor para onde o dinheiro está indo.

O projeto foi construído com foco em **clareza**, **facilidade de uso** e **evolução contínua**.

## Objetivo do projeto

O objetivo principal é permitir que qualquer pessoa consiga:

- organizar suas finanças em um único lugar;
- registrar receitas e despesas de forma simples;
- acompanhar saldo e movimentações em tempo real;
- analisar resultados mensais por categoria;
- criar uma rotina financeira mais saudável e consciente.

Além do uso prático, o projeto também serve como **base de aprendizado** para evolução técnica em frontend (React + TypeScript) e, futuramente, integração com banco de dados/autenticação.

## Assunto e proposta

Este projeto trata de **educação e organização financeira pessoal**, com foco em:

- controle de gastos;
- planejamento mensal;
- análise de comportamento financeiro;
- suporte a decisões melhores sobre consumo e economia.

## Funcionalidades atuais

- Cadastro e gerenciamento de **contas** (ex.: carteira, conta corrente, poupança).
- Registro de **transações** (receitas e despesas).
- Suporte a **despesas parceladas**, com controle das parcelas.
- Visualização de **resumo financeiro** (entradas, saídas e saldo).
- **Filtros e listagens** para facilitar busca de transações.
- Página de **relatórios** para análise mensal por categoria.
- Página de **perfil** com dados básicos salvos localmente.

## Público-alvo

- Pessoas que querem começar a controlar melhor suas finanças pessoais.
- Usuários que preferem uma interface simples e objetiva em português.
- Estudantes/desenvolvedores que querem aprender com um projeto real de gestão financeira.

## Tecnologias principais

- **React + TypeScript**
- **Vite**
- **Tailwind CSS**
- **shadcn/ui + Radix UI**
- **React Router**
- **React Query**

## Estrutura resumida

- `src/pages`: páginas principais da aplicação (início, relatórios, perfil etc.).
- `src/components/painel`: componentes visuais do painel financeiro.
- `src/components/formularios`: formulários de cadastro e edição.
- `src/components/transacoes`: componentes de apoio para filtros e resumo.
- `src/contexts/FinancasContext.tsx`: estado global e ações financeiras.
- `src/services`: regras de persistência e serviços de domínio.

## Como executar localmente

```bash
npm install
npm run dev
```

Para gerar build de produção:

```bash
npm run build
```
