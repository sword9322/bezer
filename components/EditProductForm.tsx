'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Product } from './InventoryTable'
import { fetchBrands, fetchTipologias, fetchRacksForWarehouse } from '@/app/actions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBox, faRuler, faBoxes } from '@fortawesome/free-solid-svg-icons'

interface EditProductFormProps {
  product: Product;
  onUpdate: (product: Product) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Define types instead of using any
interface CampaignData {
  id: string;
  nome: string;
  marcaId: string;
  status: string;
}

export default function EditProductForm({ product, onUpdate, onCancel, isLoading = false }: EditProductFormProps) {
  const { register, handleSubmit, watch, setValue, reset } = useForm<Product>({
    defaultValues: {
      ...product,
      tipologia: product.tipologia || '',
      brand: product.brand || '',
      localidade: product.localidade || ''
    }
  })
  const [brands, setBrands] = useState<string[]>([])
  const [tipologias, setTipologias] = useState<string[]>([])
  const [racks, setRacks] = useState<string[]>([])
  const [customTipologiaInput, setCustomTipologiaInput] = useState('')
  const [selectedBrand, setSelectedBrand] = useState(product.brand || '')
  const [brandCampaigns, setBrandCampaigns] = useState<{ value: string; label: string }[]>([])
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false)

  const selectedWarehouse = watch('warehouse')

  useEffect(() => {
    const loadData = async () => {
      const [fetchedBrands, fetchedTipologias, fetchedRacks] = await Promise.all([
        fetchBrands(),
        fetchTipologias(),
        fetchRacksForWarehouse(selectedWarehouse)
      ]);

      // Garantir que os valores atuais estão nas opções
      const updatedBrands = fetchedBrands.includes(product.brand) 
        ? fetchedBrands 
        : [...fetchedBrands, product.brand];
      
      const updatedTipologias = fetchedTipologias.includes(product.tipologia)
        ? fetchedTipologias
        : [...fetchedTipologias, product.tipologia];

      const updatedRacks = fetchedRacks.includes(product.localidade)
        ? fetchedRacks
        : [...fetchedRacks, product.localidade];

      setBrands(updatedBrands);
      setTipologias(updatedTipologias);
      setRacks(updatedRacks);

      // Atualizar valores do formulário após carregar os dados
      setValue('brand', product.brand);
      setValue('localidade', product.localidade);
      setValue('tipologia', product.tipologia);
    };
    
    loadData();
  }, [selectedWarehouse, product.brand, product.tipologia, product.localidade, setValue]);

  useEffect(() => {
    if (product) {
      reset({
        ...product,
        tipologia: product.tipologia || '',
        brand: product.brand || '',
        localidade: product.localidade || ''
      });
      setSelectedBrand(product.brand || '');
    }
  }, [product, reset]);

  const loadCampaigns = async (brand: string) => {
    try {
      const response = await fetch(`/api/campanhas?marcaId=${brand}`)
      const data = await response.json()
      
      if (data.campanhas) {
        return data.campanhas
          .filter((campanha: CampaignData) => campanha.status === "Ativo")
          .map((campanha: CampaignData) => ({
            value: campanha.id,
            label: campanha.nome
          }))
      }
      return []
    } catch (error) {
      console.error("Error loading campaigns:", error)
      return []
    }
  }

  useEffect(() => {
    async function loadCampaignsForBrand() {
      if (!selectedBrand) {
        setBrandCampaigns([]);
        return;
      }
      
      setIsLoadingCampaigns(true);
      try {
        const campaigns = await loadCampaigns(selectedBrand);
        
        // Armazenar os objetos completos, não só os IDs
        setBrandCampaigns(campaigns);
      } catch (error) {
        console.error('Erro ao carregar campanhas:', error);
      } finally {
        setIsLoadingCampaigns(false);
      }
    }
    
    loadCampaignsForBrand();
  }, [selectedBrand]);

  const onSubmit = (data: Product) => {
    if (data.tipologia === 'outro') {
      data.tipologia = customTipologiaInput;
    }
    onUpdate(data);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // If the brand is changed, update selectedBrand
    if (name === 'brand') {
      setSelectedBrand(value)
      // If the brand changes, reset the campaign
      setValue('campaign', '')
      setValue(name as keyof Product, value)
    } else {
      setValue(name as keyof Product, value)
    }
  }

  return (
    <div className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-4 rounded-2xl">
      {/* Header Section */}
      <div className="text-center mb-5">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600">
          Editar Produto
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Product Info Section */}
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 space-y-2 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FontAwesomeIcon icon={faBox} className="text-blue-500" />
            Informações do Produto
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="ref" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Referência
              </Label>
              <div className="relative">
                <Input
                  id="ref"
                  {...register('ref', { required: 'Referência é obrigatória' })}
                  className="w-full rounded-xl border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
                  placeholder="REF-0000"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="brand" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Marca
              </Label>
              <select
                id="brand"
                {...register('brand', { required: 'Marca é obrigatória' })}
                className="w-full rounded-xl border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
                value={watch('brand')}
              >
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Campaign dropdown dependent on selected brand */}
          <div className="mb-4">
            <label htmlFor="campaign" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Campanha
            </label>
            <div className="relative">
              <select
                id="campaign"
                name="campaign"
                value={watch('campaign')}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:text-gray-300"
                disabled={!selectedBrand || isLoadingCampaigns}
              >
                <option value="">Selecione uma campanha</option>
                {brandCampaigns.map((campaign) => (
                  <option key={campaign.value} value={campaign.value}>
                    {campaign.label}
                  </option>
                ))}
              </select>
              {isLoadingCampaigns && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            {!selectedBrand && (
              <p className="mt-1 text-sm text-gray-500">
                Selecione uma marca primeiro para ver as campanhas disponíveis
              </p>
            )}
          </div>
        </div>

        {/* Dimensions Section */}
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 space-y-2 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FontAwesomeIcon icon={faRuler} className="text-blue-500" />
            Dimensões
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="altura" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Altura (cm)
              </Label>
              <Input
                id="altura"
                type="number"
                {...register('altura', { required: 'Altura é obrigatória' })}
                className="w-full rounded-xl border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="largura" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Largura (cm)
              </Label>
              <Input
                id="largura"
                type="number"
                {...register('largura', { required: 'Largura é obrigatória' })}
                className="w-full rounded-xl border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Stock & Location Section */}
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 space-y-2 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FontAwesomeIcon icon={faBoxes} className="text-blue-500" />
            Stock e Localização
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="stock" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                {...register('stock', { required: 'Stock é obrigatório' })}
                className="w-full rounded-xl border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="warehouse" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Armazém
              </Label>
              <select
                id="warehouse"
                {...register('warehouse', { required: 'Armazém é obrigatório' })}
                className="w-full rounded-xl border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
              >
                <option value="Warehouse 1">Armazém 1</option>
                <option value="Warehouse 2">Armazém 2</option>
                <option value="Warehouse 3">Armazém Norte</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="localidade" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Localidade
              </Label>
              <select
                id="localidade"
                {...register('localidade', { required: 'Localidade é obrigatória' })}
                className="w-full rounded-xl border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
                value={watch('localidade')}
              >
                {racks.map((rack) => (
                  <option key={rack} value={rack}>{rack}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="tipologia" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tipologia
              </Label>
              <select
                id="tipologia"
                {...register('tipologia', { required: 'Tipologia é obrigatória' })}
                className="w-full rounded-xl border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
                value={watch('tipologia')}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value === 'outro') {
                    setCustomTipologiaInput('');
                  }
                }}
              >
                {tipologias.map((tipologia) => (
                  <option key={tipologia} value={tipologia}>{tipologia}</option>
                ))}
                <option value="outro">Outro (com descrição)</option>
              </select>
              
              {watch('tipologia') === 'outro' && (
                <Input
                  type="text"
                  placeholder="Descreva a tipologia"
                  value={customTipologiaInput}
                  onChange={(e) => setCustomTipologiaInput(e.target.value)}
                  className="mt-2 w-full rounded-xl border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
                />
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-colors duration-200"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Atualizando...</span>
              </>
            ) : (
              <span>Atualizar</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
