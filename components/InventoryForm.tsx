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
};

export default function InventoryForm({ selectedWarehouse, onSuccess }: InventoryFormProps) {
  const { register, handleSubmit, reset } = useForm<FormData>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customTipologia, setCustomTipologia] = useState('')
  const [customTipologiaInput, setCustomTipologiaInput] = useState('')
  const [brands, setBrands] = useState<string[]>([])
  const [tipologias, setTipologias] = useState<string[]>([])
  const [racks, setRacks] = useState<string[]>([])
  const [warehouse, setWarehouse] = useState(selectedWarehouse)
  const { user, userRole } = useAuth()

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
        setBrands(fetchedBrands);
        setTipologias(fetchedTipologias);
        setRacks(fetchedRacks);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados. Por favor, recarregue a página.');
      }
    };
    loadData();
  }, [warehouse]);

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
      formData.append('campaign', data.campaign)
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Image Upload Section */}
      <div className="group relative">
        <Label htmlFor="image" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Imagem do Produto
        </Label>
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-colors p-8">
          <input
            id="image"
            type="file"
            {...register('image', { required: true })}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center">
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
          </div>
        </div>
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
            {...register('height', { required: true, min: 0 })}
            className="w-full rounded-lg border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
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
            {...register('width', { required: true, min: 0 })}
            className="w-full rounded-lg border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
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
            {...register('stock', { required: true, min: 0 })}
            className="w-full rounded-lg border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
          />
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="brand" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Marca
          </Label>
          <select
            id="brand"
            {...register('brand', { required: true })}
            className="w-full rounded-lg border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
          >
            <option value="">Marca</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="localidade" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Localidade
          </Label>
          <select
            id="localidade"
            {...register('localidade', { required: true })}
            className="w-full rounded-lg border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
          >
            <option value="">Localidade</option>
            {racks.map((rack) => (
              <option key={rack} value={rack}>{rack}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="campaign" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Campanha
          </Label>
          <Input
            id="campaign"
            type="text"
            {...register('campaign', { required: true })}
            className="w-full rounded-lg border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
            placeholder="Campanha"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipologia" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Tipologia
        </Label>
        <select
          id="tipologia"
          {...register('tipologia', { required: true })}
          className="w-full rounded-lg border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
          onChange={(e) => {
            const selectedValue = e.target.value;
            handleTipologiaChange(selectedValue);
          }}
        >
          <option value="">Tipologia</option>
          {tipologias.map((tipologia) => (
            <option key={tipologia} value={tipologia}>{tipologia}</option>
          ))}
          <option value="outro">Outra (com descrição)</option>
        </select>
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
        <select
          id="warehouse"
          value={warehouse}
          onChange={(e) => setWarehouse(e.target.value)}
          className="w-full rounded-lg border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
        >
          <option value="Warehouse 1">Armazém 1</option>
          <option value="Warehouse 2">Armazém 2</option>
        </select>
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

