-- Criação da tabela de pesquisas de sinal
CREATE TABLE IF NOT EXISTS pesquisas_sinal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_cidadao VARCHAR(255) NOT NULL,
  endereco TEXT NOT NULL,
  localidade VARCHAR(255) NOT NULL,
  tem_sinal BOOLEAN NOT NULL,
  operadoras TEXT[], -- Array de operadoras
  precisa_deslocar BOOLEAN NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  agente_email VARCHAR(255),
  agente_nome VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_pesquisas_localidade ON pesquisas_sinal(localidade);
CREATE INDEX IF NOT EXISTS idx_pesquisas_created_at ON pesquisas_sinal(created_at);
CREATE INDEX IF NOT EXISTS idx_pesquisas_tem_sinal ON pesquisas_sinal(tem_sinal);

-- Habilitar RLS (Row Level Security)
ALTER TABLE pesquisas_sinal ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção
CREATE POLICY "Permitir inserção de pesquisas" ON pesquisas_sinal
  FOR INSERT WITH CHECK (true);

-- Política para permitir leitura
CREATE POLICY "Permitir leitura de pesquisas" ON pesquisas_sinal
  FOR SELECT USING (true);
