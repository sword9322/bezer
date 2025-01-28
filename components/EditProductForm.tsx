'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Product } from './InventoryTable'
import { fetchBrands, fetchTipologias, fetchRacksForWarehouse } from '@/app/actions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faBox, faRuler, faBoxes } from '@fortawesome/free-solid-svg-icons'

export default function EditProductForm({ product, onUpdate, onCancel }: { 
  product: Product
  onUpdate: (product: Product) => void
  onCancel: () => void 
}) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Product>({
    defaultValues: product
  })
  const [brands, setBrands] = useState<string[]>([])
  const [tipologias, setTipologias] = useState<string[]>([])
  const [racks, setRacks] = useState<string[]>([])
  const [customTipologia, setCustomTipologia] = useState('')
  const [customTipologiaInput, setCustomTipologiaInput] = useState('')

  const selectedWarehouse = watch('warehouse')

  useEffect(() => {
    const loadData = async () => {
      const [fetchedBrands, fetchedTipologias, fetchedRacks] = await Promise.all([
        fetchBrands(),
        fetchTipologias(),
        fetchRacksForWarehouse(selectedWarehouse)
      ]);
      setBrands(fetchedBrands);
      setTipologias(fetchedTipologias);
      setRacks(fetchedRacks);
    };
    loadData();
  }, [selectedWarehouse]);

  const onSubmit = (data: Product) => {
    if (data.tipologia === 'outro') {
      data.tipologia = customTipologiaInput;
    }
    onUpdate(data);
  };

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
                {errors.ref && (
                  <span className="text-xs text-red-500 mt-1">{errors.ref.message}</span>
                )}
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
              >
                <option value="">Marca</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              {errors.brand && (
                <span className="text-xs text-red-500 mt-1">{errors.brand.message}</span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="campaign" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Campanha
            </Label>
            <Input
              id="campaign"
              {...register('campaign', { required: 'Campanha é obrigatória' })}
              className="w-full rounded-xl border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
              placeholder="Nome da campanha"
            />
            {errors.campaign && (
              <span className="text-xs text-red-500 mt-1">{errors.campaign.message}</span>
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
              {errors.altura && (
                <span className="text-xs text-red-500 mt-1">{errors.altura.message}</span>
              )}
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
              {errors.largura && (
                <span className="text-xs text-red-500 mt-1">{errors.largura.message}</span>
              )}
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
              {errors.stock && (
                <span className="text-xs text-red-500 mt-1">{errors.stock.message}</span>
              )}
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
              </select>
              {errors.warehouse && (
                <span className="text-xs text-red-500 mt-1">{errors.warehouse.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="localidade" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Localidade
              </Label>
              <select
                id="localidade"
                {...register('localidade', { required: 'Localidade é obrigatória' })}
                className="w-full rounded-xl border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
              >
                <option value="">Localidade</option>
                {racks.map((rack) => (
                  <option key={rack} value={rack}>{rack}</option>
                ))}
              </select>
              {errors.localidade && (
                <span className="text-xs text-red-500 mt-1">{errors.localidade.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="tipologia" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tipologia
              </Label>
              <select
                id="tipologia"
                {...register('tipologia', { required: 'Tipologia é obrigatória' })}
                className="w-full rounded-xl border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  if (selectedValue === 'outro') {
                    setCustomTipologia('outro');
                    setCustomTipologiaInput('');
                  } else {
                    setCustomTipologia(selectedValue);
                    setCustomTipologiaInput('');
                  }
                }}
              >
                <option value="">Tipologia</option>
                {tipologias.map((tipologia) => (
                  <option key={tipologia} value={tipologia}>{tipologia}</option>
                ))}
                <option value="outro">Outro (com descrição)</option>
              </select>
              {errors.tipologia && (
                <span className="text-xs text-red-500 mt-1">{errors.tipologia.message}</span>
              )}
              
              {customTipologia === 'outro' && (
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
        <div className="flex items-center justify-end gap-4 pt-6">
          <Button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02]"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                A guardar...
              </div>
            ) : (
              'Guardar Alterações'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
