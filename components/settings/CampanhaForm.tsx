"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { fetchBrands } from '@/app/actions';

// Define proper type for campanha
interface Campanha {
  id: string;
  nome: string;
  marcaId: string;
  dataInicio?: string;
  dataFim?: string;
  descricao?: string;
  status: string;
}

type CampanhaFormProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (campanha: Campanha) => void;
  campanha?: Campanha | null;
};

type Status = 'Ativo' | 'Inativo' | 'Planejado';

export default function CampanhaForm({ isOpen, onOpenChange, onSuccess, campanha = null }: CampanhaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [marcas, setMarcas] = useState<{ value: string; label: string }[]>([]);
  
  const [novaCampanha, setNovaCampanha] = useState({
    nome: "",
    marcaId: "",
    dataInicio: "",
    dataFim: "",
    descricao: "",
    status: "Ativo",
  });

  useEffect(() => {
    async function carregarMarcas() {
      try {
        const result = await fetchBrands();
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
    
    if (isOpen) {
      carregarMarcas();
    }
  }, [isOpen, toast]);

  useEffect(() => {
    if (isOpen) {
      if (campanha) {
        setNovaCampanha({
          nome: campanha.nome,
          marcaId: campanha.marcaId,
          dataInicio: campanha.dataInicio || '',
          dataFim: campanha.dataFim || '',
          descricao: campanha.descricao || '',
          status: campanha.status || 'Ativo',
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, campanha]);

  const resetForm = () => {
    setNovaCampanha({
      nome: "",
      marcaId: "",
      dataInicio: "",
      dataFim: "",
      descricao: "",
      status: "Ativo",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaCampanha.nome || !novaCampanha.marcaId) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e marca são campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const campanhaData = {
        nome: novaCampanha.nome,
        marcaId: novaCampanha.marcaId,
        dataInicio: novaCampanha.dataInicio || undefined,
        dataFim: novaCampanha.dataFim || undefined,
        descricao: novaCampanha.descricao || undefined,
        status: novaCampanha.status as Status,
      };
      
      const isEditing = !!campanha;
      const url = isEditing ? `/api/campanhas?id=${campanha?.id}` : '/api/campanhas';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campanhaData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        const resultCampanha = isEditing 
          ? { ...campanha, ...campanhaData } 
          : data.campanha;
          
        toast({
          title: "Sucesso",
          description: isEditing 
            ? "Campanha atualizada com sucesso" 
            : "Campanha adicionada com sucesso",
        });
        
        onSuccess(resultCampanha);
        onOpenChange(false);
      } else {
        throw new Error(data.error || "Ocorreu um erro");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro",
        description: "Falha ao processar campanha",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {campanha ? 'Editar Campanha' : 'Nova Campanha'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="nome" className="text-sm font-medium">Nome*</label>
            <Input
              id="nome"
              value={novaCampanha.nome}
              onChange={(e) => setNovaCampanha({...novaCampanha, nome: e.target.value})}
              placeholder="Nome da campanha"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="marca" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Marca*
            </Label>
            <Combobox
              options={marcas}
              value={novaCampanha.marcaId}
              onChange={(value) => setNovaCampanha({...novaCampanha, marcaId: value})}
              placeholder="Selecione uma marca"
              searchPlaceholder="Procurar marca..."
              emptyMessage="Nenhuma marca encontrada."
              className="w-full"
              portal={false}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="dataInicio" className="text-sm font-medium">Data de Início</label>
              <Input
                id="dataInicio"
                type="date"
                value={novaCampanha.dataInicio || ""}
                onChange={(e) => setNovaCampanha({...novaCampanha, dataInicio: e.target.value})}
                className="w-full"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="dataFim" className="text-sm font-medium">Data de Término</label>
              <Input
                id="dataFim"
                type="date"
                value={novaCampanha.dataFim || ""}
                onChange={(e) => setNovaCampanha({...novaCampanha, dataFim: e.target.value})}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="descricao" className="text-sm font-medium">Descrição</label>
            <Textarea
              id="descricao"
              value={novaCampanha.descricao}
              onChange={(e) => setNovaCampanha({...novaCampanha, descricao: e.target.value})}
              placeholder="Descrição da campanha"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="status" className="text-sm font-medium">Status</label>
            <Select
              value={novaCampanha.status}
              onValueChange={(value) => setNovaCampanha({...novaCampanha, status: value as Status})}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
                <SelectItem value="Planejado">Planeado</SelectItem>
                <SelectItem value="Encerrado">Encerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {campanha ? 'Atualizando...' : 'Adicionando...'}
              </>
            ) : (
              campanha ? 'Atualizar' : 'Adicionar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 