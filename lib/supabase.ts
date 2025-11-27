import { createBrowserClient } from "@supabase/ssr"

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance

  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return supabaseInstance
}

// Tipos para a tabela de pesquisas
export interface PesquisaSinal {
  id?: string
  nome_cidadao: string
  endereco: string
  localidade: string
  tem_sinal: boolean
  operadoras: string[]
  precisa_deslocar: boolean
  latitude: number | null
  longitude: number | null
  agente_nome: string | null
  created_at?: string
  // Campos adicionados
  possui_outro_terreno?: boolean | null
  terreno_no_municipio?: boolean | null
  sinal_no_outro_terreno?: boolean | null
}
