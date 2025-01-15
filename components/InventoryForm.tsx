'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { addProduct, fetchBrands, fetchTipologias } from '@/app/actions'

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

export default function InventoryForm() {
  const { register, handleSubmit, reset } = useForm<FormData>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customTipologia, setCustomTipologia] = useState('')
  const [customTipologiaInput, setCustomTipologiaInput] = useState('')
  const [brands, setBrands] = useState<string[]>([])
  const [tipologias, setTipologias] = useState<string[]>([])

  useEffect(() => {
    const loadData = async () => {
      const [fetchedBrands, fetchedTipologias] = await Promise.all([
        fetchBrands(),
        fetchTipologias()
      ]);
      setBrands(fetchedBrands);
      setTipologias(fetchedTipologias);
    };
    loadData();
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

      await addProduct(formData)
      reset()
      setCustomTipologia('')
      setCustomTipologiaInput('')
      alert('Produto adicionado com sucesso!')
    } catch (error) {
      console.error('Erro ao adicionar produto:', error)
      alert('Erro ao adicionar produto. Por favor, tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Image Upload Section */}
      <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
        <Label htmlFor="image" className="text-lg font-semibold text-gray-700 mb-2 block">Imagem do Produto</Label>
        <Input 
          id="image" 
          type="file" 
          {...register('image', { required: true })}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
        />
      </div>

      {/* Dimensions and Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="height" className="text-sm font-medium text-gray-700">Altura (cm)</Label>
          <Input 
            id="height" 
            type="number" 
            {...register('height', { required: true, min: 0 })} 
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="width" className="text-sm font-medium text-gray-700">Largura (cm)</Label>
          <Input 
            id="width" 
            type="number" 
            {...register('width', { required: true, min: 0 })} 
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock" className="text-sm font-medium text-gray-700">Stock</Label>
          <Input 
            id="stock" 
            type="number" 
            {...register('stock', { required: true, min: 0 })} 
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
          />
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="brand" className="text-sm font-medium text-gray-700">Marca</Label>
          <select 
            id="brand" 
            {...register('brand', { required: true })} 
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
          >
            <option value="">Selecione uma marca</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="localidade" className="text-sm font-medium text-gray-700">Localidade</Label>
          <select 
            id="localidade" 
            {...register('localidade', { required: true })} 
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
          >
            <option value="">Selecione uma localidade</option>
            {["R1", "N1", "N2", "R2", "N3", "N4", "R3", "N5", "N6", "R4", "N7", "N8", "R5", "N9", "N10", "R6", "N11", "N12", "R7", "N13", "N14", "R8", "N15", "N16", "R9", "N17", "N18", "R10", "N19", "N20", "R11", "N21", "N22", "R12", "N23", "N24", "R13", "N25", "N26", "R14", "N27", "N28", "R15", "N29", "N30", "R16", "N31", "N32", "R17", "N33", "N34", "R18", "N35", "N36"].map((localidade) => (
              <option key={localidade} value={localidade}>{localidade}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="campaign" className="text-sm font-medium text-gray-700">Campanha</Label>
          <Input 
            id="campaign" 
            type="text" 
            {...register('campaign', { required: true })} 
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipologia" className="text-sm font-medium text-gray-700">Tipologia</Label>
        <select
          id="tipologia"
          {...register('tipologia', { required: true })}
          className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
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
          <option value="">Selecione uma tipologia</option>
          {tipologias.map((tipologia) => (
            <option key={tipologia} value={tipologia}>{tipologia}</option>
          ))}
          <option value="outro">Outro (com descrição)</option>
        </select>
        {customTipologia === 'outro' && (
          <Input
            type="text"
            placeholder="Coloque a tipologia aqui"
            value={customTipologiaInput}
            onChange={(e) => setCustomTipologiaInput(e.target.value)}
            className="mt-2 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notas</Label>
        <textarea
          id="notes"
          {...register('notes')}
          className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px] resize-y"
          placeholder="Digite suas notas aqui"
        />
      </div>

      <div className="pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Adicionando...
            </div>
          ) : 'Adicionar Produto'}
        </Button>
      </div>
    </form>
  )
}

