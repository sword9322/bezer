'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { addProduct, fetchBrands, fetchTipologias, fetchRacksForWarehouse } from '@/app/actions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudUpload, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { Combobox } from '@/components/ui/combobox'
import Image from 'next/image'

type FormData = {
  image: FileList
  height: number
  width: number
  brand: string
  campaign: string
  stock: number
  localidade: string
  tipologia: string
  notes: string
}

type InventoryFormProps = {
  selectedWarehouse: string;
  onSuccess: () => void;
  editingProduct?: {
    brand: string;
    campaign?: string;
    height?: number;
    width?: number;
    stock?: number;
    localidade?: string;
    tipologia?: string;
    notes?: string;
  } | null;
};

interface Campaign {
  id: string;
  nome: string;
  status: string;
}

export default function InventoryForm({ selectedWarehouse, onSuccess, editingProduct = null }: InventoryFormProps) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      height: editingProduct?.height || undefined,
      width: editingProduct?.width || undefined,
      stock: editingProduct?.stock || undefined,
      brand: editingProduct?.brand || '',
      campaign: editingProduct?.campaign || '',
      localidade: editingProduct?.localidade || '',
      tipologia: editingProduct?.tipologia || '',
      notes: editingProduct?.notes || ''
    }
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customTipologia, setCustomTipologia] = useState('')
  const [customTipologiaInput, setCustomTipologiaInput] = useState('')
  const [brands, setBrands] = useState<string[]>([])
  const [tipologias, setTipologias] = useState<string[]>([])
  const [racks, setRacks] = useState<string[]>([])
  const [warehouse, setWarehouse] = useState(selectedWarehouse)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const { user, userRole } = useAuth()
  const [campanhaNomes, setCampanhaNomes] = useState<Record<string, string>>({})
  const [selectedBrand, setSelectedBrand] = useState(editingProduct?.brand || '')
  const [brandCampaigns, setBrandCampaigns] = useState<{ value: string; label: string }[]>([])
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false)

  // Watch for file changes
  const imageFile = watch('image')

  useEffect(() => {
    if (imageFile?.[0]) {
      const file = imageFile[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [imageFile])

  useEffect(() => {
    setWarehouse(selectedWarehouse)
  }, [selectedWarehouse])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedBrands, fetchedTipologias, fetchedRacks] = await Promise.all([
          fetchBrands(),
          fetchTipologias(),
          fetchRacksForWarehouse(warehouse)
        ]);
        
        const updatedBrands = [...fetchedBrands];
        
        if (editingProduct?.brand && !updatedBrands.includes(editingProduct.brand)) {
          updatedBrands.push(editingProduct.brand);
        }
        
        setBrands(updatedBrands);
        setTipologias(fetchedTipologias);
        setRacks(fetchedRacks);

        if (editingProduct) {
          const formValues = {
            height: editingProduct.height || 0,
            width: editingProduct.width || 0,
            stock: editingProduct.stock || 0,
            brand: editingProduct.brand || '',
            campaign: editingProduct.campaign || '',
            localidade: editingProduct.localidade || '',
            tipologia: editingProduct.tipologia || '',
            notes: editingProduct.notes || ''
          };

          Object.entries(formValues).forEach(([key, value]) => {
            setValue(key as keyof FormData, value);
          });

          setSelectedBrand(editingProduct.brand || '');
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados. Por favor, recarregue a página.');
      }
    };
    loadData();
  }, [warehouse, editingProduct, setValue]);

  useEffect(() => {
    async function loadCampaignsForBrand(brand: string): Promise<{ value: string; label: string }[]> {
      if (!brand) {
        setBrandCampaigns([]);
        return [];
      }
      
      setIsLoadingCampaigns(true)
      try {
        const response = await fetch(`/api/campanhas?marcaId=${brand}`)
        const data = await response.json()
        
        if (data.campanhas) {
          const campaigns = data.campanhas
            .filter((campanha: Campaign) => campanha.status === "Ativo")
            .map((campanha: Campaign) => ({
              value: campanha.id,
              label: campanha.nome
            }));
          
          // Armazenar objetos completos, não só os valores
          setBrandCampaigns(campaigns);
          
          // Atualizar o mapeamento de IDs para nomes
          const namesMap = campaigns.reduce((acc: Record<string, string>, campaign: { value: string; label: string }) => {
            acc[campaign.value] = campaign.label;
            return acc;
          }, {} as Record<string, string>);
          
          setCampanhaNomes(namesMap);
          
          return campaigns;
        }
        setBrandCampaigns([]);
        return []
      } catch (error) {
        console.error("Error loading campaigns:", error)
        setBrandCampaigns([]);
        return []
      } finally {
        setIsLoadingCampaigns(false)
      }
    }
    
    loadCampaignsForBrand(selectedBrand)
  }, [selectedBrand])

  useEffect(() => {
    if (editingProduct) {
      // Set all form values from the editing product
      Object.entries(editingProduct).forEach(([key, value]) => {
        if (value !== undefined && key in editingProduct) {
          setValue(key as keyof FormData, value);
        }
      });
      
      // Make sure selectedBrand is correctly set
      if (editingProduct.brand) {
        setSelectedBrand(editingProduct.brand);
      }
    }
  }, [editingProduct, setValue]);

  const handleTipologiaChange = useCallback((value: string) => {
    if (value === 'outro') {
      setCustomTipologia('outro');
      setCustomTipologiaInput('');
    } else {
      setCustomTipologia(value);
      setCustomTipologiaInput('');
    }
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('image', data.image[0])
      formData.append('height', data.height.toString())
      formData.append('width', data.width.toString())
      formData.append('brand', data.brand)
      formData.append('campaign', campanhaNomes[data.campaign] || data.campaign)
      formData.append('date', new Date().toISOString().split('T')[0])
      formData.append('stock', data.stock.toString())
      formData.append('localidade', data.localidade)
      formData.append('tipologia', data.tipologia === 'outro' ? customTipologiaInput : data.tipologia)
      formData.append('notes', data.notes)

      if (!user) {
        throw new Error('User not authenticated')
      }

      const result = await addProduct(formData, warehouse, {
        id: user.uid,
        name: user.displayName || user.email || 'Unknown User',
        email: user.email || 'No Email',
        role: userRole || 'user'
      })

      if (result.success) {
        reset()
        setCustomTipologia('')
        setCustomTipologiaInput('')
        toast.success('Produto adicionado com sucesso')
        onSuccess()
      } else {
        toast.error(result.error || 'Erro ao adicionar produto')
      }
    } catch (error) {
      console.error('Erro ao adicionar produto:', error)
      if (error instanceof Error && error.message === 'User not authenticated') {
        toast.error('Por favor, faça login novamente para adicionar produtos.')
      } else {
        toast.error('Erro ao adicionar produto. Por favor, tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Transform arrays to Combobox options format
  const updatedBrands = brands.map(brand => ({ value: brand, label: brand }))
  const tipologiaOptions = tipologias.map(tipologia => ({ value: tipologia, label: tipologia }))
  const rackOptions = racks.map(rack => ({ value: rack, label: rack }))
  const warehouseOptions = [
    { value: 'Warehouse 1', label: 'Armazém 1' },
    { value: 'Warehouse 2', label: 'Armazém 2' },
    { value: 'Warehouse 3', label: 'Armazém Norte' },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Se a marca for alterada, atualize selectedBrand
    if (name === 'brand') {
      setSelectedBrand(value)
      // Reset da campanha quando a marca muda
      setValue('campaign', '')
      setValue(name as keyof FormData, value)
    } else {
      setValue(name as keyof FormData, value)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Image Upload Section */}
      <div className="group relative">
        <Label htmlFor="image" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Imagem do Produto
        </Label>
        <div className={`border-2 border-dashed rounded-xl p-8 transition-colors ${
          errors.image ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400'
        }`}>
          <input
            id="image"
            type="file"
            accept="image/*"
            {...register('image', { required: 'Imagem é obrigatória' })}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center">
            {previewImage ? (
              <div className="relative">
                <Image 
                  src={previewImage} 
                  alt="Preview" 
                  width={200}
                  height={200}
                  className="mx-auto max-h-48 rounded-lg shadow-lg"
                />
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  Imagem carregada com sucesso!
                </p>
              </div>
            ) : (
              <>
                <FontAwesomeIcon 
                  icon={faCloudUpload} 
                  className="text-3xl text-slate-400 dark:text-slate-500 mb-3 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" 
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Arraste e solte uma imagem aqui, ou clique para selecionar
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                  Formatos suportados: JPG, PNG, GIF
                </p>
              </>
            )}
          </div>
        </div>
        {errors.image && (
          <p className="mt-1 text-sm text-red-500">{errors.image.message}</p>
        )}
      </div>

      {/* Dimensions and Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="height" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Altura (cm)
          </Label>
          <Input
            id="height"
            type="number"
            {...register('height', { required: 'Altura é obrigatória', min: 0 })}
            className={`w-full rounded-lg focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200 ${
              errors.height ? 'border-red-500 dark:border-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:border-blue-500'
            }`}
            placeholder="Altura (cm)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="width" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Largura (cm)
          </Label>
          <Input
            id="width"
            type="number"
            {...register('width', { required: 'Largura é obrigatória', min: 0 })}
            className={`w-full rounded-lg focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200 ${
              errors.width ? 'border-red-500 dark:border-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:border-blue-500'
            }`}
            placeholder="Largura (cm)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Stock
          </Label>
          <Input
            id="stock"
            type="number"
            {...register('stock', { required: 'Stock é obrigatório', min: 0 })}
            className={`w-full rounded-lg focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200 ${
              errors.stock ? 'border-red-500 dark:border-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:border-blue-500'
            }`}
          />
        </div>
      </div>

      {/* Product Details with Combobox */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="brand" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Marca
          </Label>
          <Combobox
            options={updatedBrands}
            value={watch('brand')}
            onChange={(value) => {
              setSelectedBrand(value);
              setValue('campaign', '');
              setValue('brand', value);
            }}
            placeholder="Marca"
            searchPlaceholder="Procurar marca..."
            emptyMessage="Nenhuma marca encontrada."
            className="w-full"
            key={brands.join()}
          />
          {errors.brand && (
            <p className="mt-1 text-sm text-red-500">{errors.brand.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="localidade" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Localidade
          </Label>
          <Combobox
            options={rackOptions}
            value={watch('localidade')}
            onChange={(value) => setValue('localidade', value)}
            placeholder="Localidade"
            searchPlaceholder="Procurar localidade..."
            emptyMessage="Nenhuma localidade encontrada."
            className="w-full"
          />
          {errors.localidade && (
            <p className="mt-1 text-sm text-red-500">{errors.localidade.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Campanha
          </Label>
          <div className="relative">
            <select
              id="campaign"
              name="campaign"
              value={watch('campaign')}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:text-gray-300"
              disabled={!watch('brand') || isLoadingCampaigns}
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
          {watch('brand') && !watch('campaign') && (
            <p className="mt-1 text-sm text-gray-500">
              Selecione uma campanha para esta marca
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipologia" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Tipologia
        </Label>
        <Combobox
          options={[...tipologiaOptions, { value: 'outro', label: 'Outra (com descrição)' }]}
          value={watch('tipologia')}
          onChange={(value) => {
            setValue('tipologia', value)
            handleTipologiaChange(value)
          }}
          placeholder="Tipologia"
          searchPlaceholder="Procurar tipologia..."
          emptyMessage="Nenhuma tipologia encontrada."
          className="w-full"
        />
        {customTipologia === 'outro' && (
          <Input
            type="text"
            placeholder="Digite a descrição da tipologia"
            value={customTipologiaInput}
            onChange={(e) => setCustomTipologiaInput(e.target.value)}
            className="mt-2 w-full rounded-lg border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="warehouse" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Armazém
        </Label>
        <Combobox
          options={warehouseOptions}
          value={warehouse}
          onChange={setWarehouse}
          placeholder="Selecione um armazém"
          searchPlaceholder="Procurar armazém..."
          emptyMessage="Nenhum armazém encontrado."
          className="w-full"
        />
      </div>

      {/* Notes Section */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Notas
        </Label>
        <textarea
          id="notes"
          {...register('notes')}
          className="w-full min-h-[120px] rounded-lg border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200 resize-y"
          placeholder="Adicione quaisquer notas adicionais aqui..."
        />
        <div className="flex justify-end">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            0/250 caracteres
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-6">
        <Button
          type="button"
          onClick={onSuccess}
          className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02]"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              A adicionar...
            </div>
          ) : (
            'Adicionar Produto'
          )}
        </Button>
      </div>
    </form>
  )
}

