"use client"

import { useEffect } from 'react';
import { syncPendingSurveys } from '@/lib/sync';
import { useToast } from '@/hooks/use-toast';

export function SyncProvider() {
  const { toast } = useToast();

  useEffect(() => {
    // Função para executar a sincronização
    const handleSync = async () => {
      // Verifica se o navegador está online
      if (navigator.onLine) {
        const { successCount, failCount } = await syncPendingSurveys();
        
        // Se alguma pesquisa foi sincronizada com sucesso, notifica o usuário
        if (successCount > 0) {
          toast({
            title: 'Sincronização Concluída',
            description: `${successCount} pesquisa(s) que estavam pendentes foram enviadas.`,
          });
        }
        // Se alguma falhou (opcional, para depuração)
        if (failCount > 0) {
           toast({
            variant: "destructive",
            title: 'Falha na Sincronização',
            description: `${failCount} pesquisa(s) não puderam ser enviadas.`,
          });
        }
      }
    };

    // 1. Tenta sincronizar assim que o app carrega
    handleSync();

    // 2. Adiciona um listener para o evento 'online'
    //    Isso dispara a sincronização quando o dispositivo volta a ter conexão
    window.addEventListener('online', handleSync);

    // Remove o listener quando o componente é desmontado para evitar memory leaks
    return () => {
      window.removeEventListener('online', handleSync);
    };
  }, [toast]); // O array de dependências garante que a lógica não rode a cada renderização

  // Este componente não renderiza nenhum HTML
  return null;
}
