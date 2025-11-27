import { db } from './db';
import { getSupabaseClient } from './supabase';
import type { Pesquisa } from './db';

export async function syncPendingSurveys() {
  // 1. Pega todas as pesquisas que estão com status 'pending'
  const pendingSurveys = await db.pesquisas.where({ sync_status: 'pending' }).toArray();

  if (pendingSurveys.length === 0) {
    // Se não há nada pendente, não faz nada
    return { successCount: 0, failCount: 0 };
  }

  console.log(`Sincronizando ${pendingSurveys.length} pesquisa(s) pendente(s)...`);

  const supabase = getSupabaseClient();
  let successCount = 0;
  let failCount = 0;

  // 2. Itera sobre cada pesquisa pendente
  for (const survey of pendingSurveys) {
    try {
      // Cria uma cópia dos dados da pesquisa para enviar
      const dataToSend: Omit<Pesquisa, 'local_id' | 'sync_status'> = { ...survey };
      
      // Remove campos que só existem localmente
      delete (dataToSend as Partial<Pesquisa>).local_id;
      delete (dataToSend as Partial<Pesquisa>).sync_status;
      // O 'id' (UUID) será gerado pelo Supabase se não existir, 
      // ou pode ser usado para um 'upsert' se já tiver sido definido.

      const { error } = await supabase.from('pesquisas_sinal').insert([dataToSend]);

      if (error) {
        // Se o Supabase retornar um erro, lança para o bloco catch
        throw new Error(error.message);
      }

      // 3. Se o envio for bem-sucedido, atualiza o status no Dexie para 'synced'
      await db.pesquisas.update(survey.local_id!, { sync_status: 'synced' });
      successCount++;
    } catch (error) {
      failCount++;
      // Em caso de falha, atualiza o status para 'failed' para podermos analisar o erro
      await db.pesquisas.update(survey.local_id!, { sync_status: 'failed' });
      console.error(`Falha ao sincronizar a pesquisa de ID local ${survey.local_id}:`, error);
    }
  }

  if (successCount > 0) {
    console.log(`${successCount} pesquisa(s) foram sincronizadas com sucesso.`);
  }
  if (failCount > 0) {
    console.error(`${failCount} pesquisa(s) falharam ao sincronizar.`);
  }

  return { successCount, failCount };
}
