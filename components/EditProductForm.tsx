import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Product = {
  ref: string
  image: string
  height: number
  width: number
  brand: string
  campaign: string
  date: string
  stock: number
  localidade: string
}

type EditProductFormProps = {
  product: Product
  onUpdate: (product: Product) => void
  onCancel: () => void
}

export default function EditProductForm({ product, onUpdate, onCancel }: EditProductFormProps) {
  const { register, handleSubmit } = useForm<Product>({
    defaultValues: product,
  })

  const onSubmit = (data: Product) => {
    onUpdate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="height">Altura (cm)</Label>
        <Input id="height" type="number" {...register('height', { required: true, min: 0 })} />
      </div>
      <div>
        <Label htmlFor="width">Largura (cm)</Label>
        <Input id="width" type="number" {...register('width', { required: true, min: 0 })} />
      </div>
      <div>
        <Label htmlFor="brand">Marca</Label>
        <Input id="brand" type="text" {...register('brand', { required: true })} />
      </div>
      <div>
        <Label htmlFor="campaign">Campanha</Label>
        <Input id="campaign" type="text" {...register('campaign', { required: true })} />
      </div>
      <div>
        <Label htmlFor="date">Data</Label>
        <Input id="date" type="date" {...register('date', { required: true })} />
      </div>
      <div>
        <Label htmlFor="stock">Estoque</Label>
        <Input id="stock" type="number" {...register('stock', { required: true, min: 0 })} />
      </div>
      <div>
        <Label htmlFor="localidade">Localidade</Label>
        <select id="localidade" {...register('localidade', { required: true })} className="input">
          {[
            "R1", "N1", "N2", "R2", "N3", "N4", "R3", "N5", "N6", "R4", "N7", "N8",
            "R5", "N9", "N10", "R6", "N11", "N12", "R7", "N13", "N14", "R8", "N15", "N16",
            "R9", "N17", "N18", "R10", "N19", "N20", "R11", "N21", "N22", "R12", "N23", "N24",
            "R13", "N25", "N26", "R14", "N27", "N28", "R15", "N29", "N30", "R16", "N31", "N32",
            "R17", "N33", "N34", "R18", "N35", "N36"
          ].map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit">Salvar</Button>
      <Button type="button" onClick={onCancel}>Cancelar</Button>
    </form>
  )
}
