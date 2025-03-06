"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Loader2, Plus, Trash, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { initializeApp, getApps } from 'firebase/app';
import firebaseConfig from '@/lib/firebase';
import { fetchBrands } from '@/app/actions';
import CampanhaForm from './CampanhaForm';

// Define proper interface instead of any
interface Campanha {
  id: string;
  nome: string;
  marcaId: string;
  dataInicio?: string;
  dataFim?: string;
  descricao?: string;
  status: string;
}

export default function CampanhasTab() {
  const { toast } = useToast(); 
  const [isLoading, setIsLoading] = useState(true);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [marcas, setMarcas] = useState<{ value: string; label: string }[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [marcaFiltro, setMarcaFiltro] = useState("all");
  
  // Adicionar estado para controlar loading durante remoção
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingCampanha, setEditingCampanha] = useState<Campanha | null>(null);

  // No início do componente, adicione:
  useEffect(() => {
    // Inicializa o Firebase se ainda não estiver inicializado
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
    
    async function carregarMarcas() {
      try {
        // Usar o mesmo método que funciona no InventoryForm
        const result = await fetchBrands();
        
        // Converter para o formato esperado pelo Combobox
        setMarcas(result.map((marca: string) => ({
          value: marca,
          label: marca
        })));
      } catch (error) {
        console.error("Erro ao carregar marcas:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar marcas.",
          variant: "destructive",
        });
      }
    }
    
    carregarMarcas();
  }, [toast]);
  
  // Carregar campanhas
  useEffect(() => {
    async function carregarCampanhas() {
      setIsLoading(true);
      try {
        // Se marcaFiltro for "all", não envie o parâmetro marcaId
        const url = marcaFiltro === "all" 
          ? "/api/campanhas" 
          : `/api/campanhas?marcaId=${marcaFiltro}`;
          
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.campanhas) {
          setCampanhas(data.campanhas);
        }
      } catch (error) {
        console.error("Erro ao carregar campanhas:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar campanhas.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    carregarCampanhas();
  }, [marcaFiltro, toast]);
  
  // Função para adicionar a nova campanha ao estado
  const handleCampanhaAdded = (campanha: Campanha) => {
    setCampanhas([...campanhas, campanha]);
  };

  // Função para deletar campanha
  const handleDeleteCampanha = async (id: string, nome: string) => {
    // Confirmação antes de deletar
    if (!confirm(`Tem certeza que deseja excluir a campanha "${nome}"?`)) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/campanhas?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Atualizar estado local removendo a campanha
        setCampanhas(campanhas.filter(campanha => campanha.id !== id));
        toast({
          title: "Sucesso",
          description: "Campanha removida com sucesso.",
        });
      } else {
        throw new Error(data.error || "Erro ao remover campanha");
      }
    } catch (error) {
      console.error("Erro ao remover campanha:", error);
      toast({
        title: "Erro",
        description: "Falha ao remover campanha.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Função para iniciar a edição de uma campanha
  const handleEditCampanha = (campanha: Campanha) => {
    setEditingCampanha(campanha);
    setIsDialogOpen(true);
  };

  // Função para atualizar campanha editada no estado local
  const handleCampanhaUpdated = (updatedCampanha: Campanha) => {
    setCampanhas(
      campanhas.map((campanha) => 
        campanha.id === updatedCampanha.id ? updatedCampanha : campanha
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Layout responsivo - flex-col em mobile, flex-row em desktop */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <h2 className="text-2xl font-bold">Campanhas</h2>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="w-full sm:w-64">
            <Combobox
              options={[
                { value: "all", label: "Todas as marcas" },
                ...marcas
              ]}
              value={marcaFiltro}
              onChange={(value) => {
                console.log("Marca selecionada para filtro:", value);
                setMarcaFiltro(value);
              }}
              placeholder="Filtrar por marca"
            />
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nova Campanha
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-md shadow">
          {campanhas.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Nenhuma campanha encontrada.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Nome</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Marca</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Início</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Fim</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {campanhas.map((campanha) => {
                    const marca = marcas.find(m => m.value === campanha.marcaId)?.label || "—";
                    
                    return (
                      <tr key={campanha.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-sm">{campanha.nome}</td>
                        <td className="px-4 py-3 text-sm">{marca}</td>
                        <td className="px-4 py-3 text-sm">{campanha.dataInicio || "—"}</td>
                        <td className="px-4 py-3 text-sm">{campanha.dataFim || "—"}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campanha.status === "Ativo" 
                              ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400" 
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400"
                          }`}>
                            {campanha.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditCampanha(campanha)}
                              disabled={isDeleting}
                            >
                              <Pencil className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleDeleteCampanha(campanha.id, campanha.nome)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? 
                                <Loader2 className="h-4 w-4 animate-spin" /> : 
                                <Trash className="h-4 w-4 text-red-500" />
                              }
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Passar campanha para edição e handler de atualização */}
      <CampanhaForm 
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingCampanha(null);
        }}
        onSuccess={editingCampanha ? handleCampanhaUpdated : handleCampanhaAdded}
        campanha={editingCampanha}
      />
    </div>
  );
} 