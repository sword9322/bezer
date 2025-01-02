'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { addProduct } from '@/app/actions'

type FormData = {
  image: FileList
  height: number
  width: number
  brand: string
  campaign: string
  date: string
  stock: number
  localidade: string
  tipologia: string
}

export default function InventoryForm() {
  const { register, handleSubmit, reset } = useForm<FormData>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customTipologia, setCustomTipologia] = useState('')
  const [customTipologiaInput, setCustomTipologiaInput] = useState('')

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('image', data.image[0])
      formData.append('height', data.height.toString())
      formData.append('width', data.width.toString())
      formData.append('brand', data.brand)
      formData.append('campaign', data.campaign)
      formData.append('date', data.date)
      formData.append('stock', data.stock.toString())
      formData.append('localidade', data.localidade)
      formData.append('tipologia', customTipologiaInput || data.tipologia)

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="image" className='font-bold'>Imagem</Label>
        <Input id="image" type="file" {...register('image', { required: true })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="height" className='font-bold'>Altura (cm)</Label>
          <Input id="height" type="number" {...register('height', { required: true, min: 0 })} />
        </div>
        <div>
          <Label htmlFor="width" className='font-bold'>Largura (cm)</Label>
          <Input id="width" type="number" {...register('width', { required: true, min: 0 })} />
        </div>
      </div>
      <div className='content-center'>
        <Label htmlFor="brand" className='font-bold'>Marca</Label>
        <select id="brand" {...register('brand', { required: true })} className="border rounded p-1 m-2">
          <option value="">Selecione uma marca</option>
          {[
            "DIOR",
            "Estee Lauder",
            "Clinique",
            "Prada",
            "Kiehl's",
            "YSL",
            "Lancôme",
            "Polo Ralph Lauren",
            "Mugler",
            "Armani",
            "Azzaro",
            "Biotherm",
            "Clarins",
            "My Blend"
          ].map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="campaign" className='font-bold'>Campanha</Label>
        <Input id="campaign" type="text" {...register('campaign', { required: true })} />
      </div>
      <div>
        <Label htmlFor="date" className='font-bold'>Data</Label>
        <Input id="date" type="date" {...register('date', { required: true })} />
      </div>
      <div>
        <Label htmlFor="stock" className='font-bold'>Stock</Label>
        <Input id="stock" type="number" {...register('stock', { required: true, min: 0 })} />
      </div>
      <div>
        <Label htmlFor="localidade" className='font-bold'>Localidade</Label>
        <select id="localidade" {...register('localidade', { required: true })} className="border rounded p-1 m-1">
          <option value="">Selecione uma localidade</option>
          {["R1", "N1", "N2", "R2", "N3", "N4", "R3", "N5", "N6", "R4", "N7", "N8", "R5", "N9", "N10", "R6", "N11", "N12", "R7", "N13", "N14", "R8", "N15", "N16", "R9", "N17", "N18", "R10", "N19", "N20", "R11", "N21", "N22", "R12", "N23", "N24", "R13", "N25", "N26", "R14", "N27", "N28", "R15", "N29", "N30", "R16", "N31", "N32", "R17", "N33", "N34", "R18", "N35", "N36"].map((localidade) => (
            <option key={localidade} value={localidade}>{localidade}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="tipologia" className='font-bold'>Tipologia</Label>
        <select
          id="tipologia"
          {...register('tipologia', { required: true })}
          className="border rounded p-1 m-2"
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
          <option value="">Selecione uma opção</option>
          <option value="consola">Consola</option>
          <option value="coluna">Coluna</option>
          <option value="parede pódio">Parede Pódio</option>
          <option value="parede mini-pódio">Parede Mini-Pódio</option>
          <option value="canoppy">Canoppy</option>
          <option value="estrutura">Estrutura</option>
          <option value="cadeira">Cadeira</option>
          <option value="banco">Banco</option>
          <option value="outro">Outro (com descrição)</option>
        </select>
        {customTipologia === 'outro' && (
          <Input
            type="text"
            placeholder="Digite sua descrição"
            value={customTipologiaInput}
            onChange={(e) => setCustomTipologiaInput(e.target.value)}
            className="border rounded p-2 m-2"
          />
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Adicionando...' : 'Adicionar Produto'}
      </Button>
    </form>
  )
}

