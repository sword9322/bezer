'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Product } from './InventoryTable'
import { fetchBrands, fetchTipologias } from '@/app/actions'

export default function EditProductForm({ product, onUpdate, onCancel }: { 
  product: Product
  onUpdate: (product: Product) => void
  onCancel: () => void 
}) {
  const { register, handleSubmit } = useForm<Product>({
    defaultValues: product
  })
  const [brands, setBrands] = useState<string[]>([])
  const [tipologias, setTipologias] = useState<string[]>([])
  const [customTipologia, setCustomTipologia] = useState('')
  const [customTipologiaInput, setCustomTipologiaInput] = useState('')

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

  const onSubmit = (data: Product) => {
    // If "outro" is selected, use the custom input value
    if (data.tipologia === 'outro') {
      data.tipologia = customTipologiaInput;
    }
    onUpdate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Edit Product</h2>
      <div className="w-full">
        <Label htmlFor="ref">Reference</Label>
        <Input id="ref" {...register('ref')} className="rounded-md shadow-sm w-full" />
      </div>
      <div className="w-full">
        <Label htmlFor="brand">Marca</Label>
        <select
          id="brand"
          {...register('brand')}
          className="border rounded p-1 w-full"
        >
          <option value="">Selecione uma marca</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>
      <div className="w-full">
        <Label htmlFor="campaign">Campaign</Label>
        <Input id="campaign" {...register('campaign')} className="rounded-md shadow-sm w-full" />
      </div>
      <div className="w-full">
        <Label htmlFor="height">Height</Label>
        <Input id="height" type="number" {...register('height')} className="w-full" />
      </div>
      <div className="w-full">
        <Label htmlFor="width">Width</Label>
        <Input id="width" type="number" {...register('width')} className="w-full" />
      </div>
      <div className="w-full">
        <Label htmlFor="stock">Stock</Label>
        <Input id="stock" type="number" {...register('stock')} className="w-full" />
      </div>
      <div className="w-full">
        <Label htmlFor="localidade">Localidade</Label>
        <select
          id="localidade"
          {...register('localidade')}
          className="border rounded p-1 w-full"
        >
          <option value="">Selecione uma localidade</option>
          {["R1", "N1", "N2", "R2", "N3", "N4", "R3", "N5", "N6", "R4", "N7", "N8", "R5", "N9", "N10", "R6", "N11", "N12", "R7", "N13", "N14", "R8", "N15", "N16", "R9", "N17", "N18", "R10", "N19", "N20", "R11", "N21", "N22", "R12", "N23", "N24", "R13", "N25", "N26", "R14", "N27", "N28", "R15", "N29", "N30", "R16", "N31", "N32", "R17", "N33", "N34", "R18", "N35", "N36"].map((localidade) => (
            <option key={localidade} value={localidade}>{localidade}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tipologia">Tipologia</Label>
        <select
          id="tipologia"
          {...register('tipologia')}
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
            className="mt-2"
          />
        )}
      </div>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar
        </Button>
      </div>
    </form>
  );
}
