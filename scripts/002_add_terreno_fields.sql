-- Adiciona as novas colunas para informações de terreno na tabela de pesquisas
ALTER TABLE public.pesquisas_sinal
ADD COLUMN IF NOT EXISTS possui_outro_terreno BOOLEAN,
ADD COLUMN IF NOT EXISTS terreno_no_municipio BOOLEAN,
ADD COLUMN IF NOT EXISTS sinal_no_outro_terreno BOOLEAN;
