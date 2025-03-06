import React, { useState } from 'react';
import { Combobox } from '@/components/ui/combobox';
import { ComboboxDependent } from '@/components/ui/combobox-dependent';

// Define proper types instead of any
interface Campanha {
  id: string;
  nome: string;
  status: string;
}

const ProductForm: React.FC = () => {
  // Fix unused setCampanhas
  const [campanhas] = useState<{ value: string; label: string }[]>([]);
  const [formData, setFormData] = useState({
    marcaId: '',
    campanhaId: '',
  });

  const fetchCampanhasByMarca = async (marcaId: string) => {
    try {
      const response = await fetch(`/api/campanhas?marcaId=${marcaId}`);
      const data = await response.json();
      
      if (data.campanhas) {
        return data.campanhas
          .filter((campanha: Campanha) => campanha.status === "Ativo")
          .map((campanha: Campanha) => ({
            value: campanha.id,
            label: campanha.nome
          }));
      }
      return [];
    } catch (error) {
      console.error("Erro ao carregar campanhas:", error);
      return [];
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <label htmlFor="marca" className="text-sm font-medium">
          Marca
        </label>
        <Combobox
          options={[]}
          value={formData.marcaId}
          onChange={(value) => setFormData({ ...formData, marcaId: value })}
          placeholder="Selecione uma marca"
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="campanha" className="text-sm font-medium">
          Campanha
        </label>
        <ComboboxDependent
          options={campanhas}
          value={formData.campanhaId || ""}
          onChange={(value) => setFormData({ ...formData, campanhaId: value })}
          placeholder="Selecione uma campanha"
          emptyMessage="Nenhuma campanha encontrada"
          dependentId={formData.marcaId || ""}
          fetchOptions={fetchCampanhasByMarca}
          disabled={!formData.marcaId}
        />
      </div>
    </div>
  );
};

export default ProductForm; 