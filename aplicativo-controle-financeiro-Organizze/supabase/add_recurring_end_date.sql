-- Adiciona coluna para marcar até qual mês uma transação recorrente deve aparecer.
-- Formato: "YYYY-MM" (texto). NULL = recorrente para sempre.
ALTER TABLE public.transacoes ADD COLUMN IF NOT EXISTS recurring_end_date text;
