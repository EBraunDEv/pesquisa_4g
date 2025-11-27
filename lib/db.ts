import Dexie, { Table } from "dexie";

export interface Pesquisa {
  id?: string; // UUID from Supabase, optional for local-only entries
  local_id?: number; // Auto-incremented primary key for local DB
  nome_cidadao: string;
  endereco: string;
  localidade: string;
  tem_sinal: boolean;
  operadoras: string[];
  precisa_deslocar: boolean;
  latitude?: number;
  longitude?: number;
  agente_nome?: string | null;
  created_at?: Date;

  // New fields
  possui_outro_terreno: boolean;
  terreno_no_municipio?: boolean | null;
  sinal_no_outro_terreno?: boolean | null;
  endereco_da_localidade?: string | null;

  // Sync status
  sync_status: "synced" | "pending" | "failed";
}

export class LocalDatabase extends Dexie {
  pesquisas!: Table<Pesquisa>;

  constructor() {
    super("LocalSurveyDatabase");
    this.version(1).stores({
      // ++local_id for auto-incrementing primary key
      // &id makes the Supabase UUID unique and indexed
      // The other fields are indexed for faster queries
      pesquisas:
        "++local_id, &id, nome_cidadao, localidade, tem_sinal, sync_status",
    });
  }
}

export const db = new LocalDatabase();
