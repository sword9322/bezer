'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { fetchBrands, addBrand, deleteBrand, downloadBrands } from '@/app/actions'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

export default function BrandsTab() {
  const [brands, setBrands] = useState<string[]>([])
  const [newBrand, setNewBrand] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { currentUser } = useAuth()

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    try {
      const result = await fetchBrands()
      setBrands(result)
    } catch {
      console.error('Error loading brands')
      toast.error('Ocorreu um erro')
    }
  }

  const handleAddBrand = async () => {
    if (!newBrand.trim()) return
    
    setIsLoading(true)
    try {
      await addBrand(newBrand, currentUser?.uid || 'unknown-user')
      await loadBrands()
      setNewBrand('')
      toast.success('Marca adicionada com sucesso')
    } catch (error) {
      console.error('Error adding brand:', error)
      toast.error('Erro ao adicionar marca')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBrand = async (brand: string) => {
    if (!confirm(`Tem certeza que deseja excluir ${brand}?`)) return

    setIsLoading(true)
    try {
      await deleteBrand(brand, currentUser?.uid || 'unknown-user')
      await loadBrands()
      toast.success('Marca removida com sucesso')
    } catch {
      toast.error('Erro ao remover marca')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadBrands = async () => {
    try {
      await downloadBrands()
      toast.success('Download iniciado')
    } catch {
      toast.error('Erro ao baixar marcas')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Gestão de Marcas</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Adicione ou remova marcas do sistema
          </p>
        </div>
        <Button
          onClick={handleDownloadBrands}
          variant="outline"
          className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
          Exportar Marcas
        </Button>
      </div>

      <form onSubmit={handleAddBrand} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="brand">Nova Marca</Label>
          <Input
            id="brand"
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value)}
            placeholder="Digite o nome da marca"
            className="mt-1.5"
          />
        </div>
        <Button 
          type="submit" 
          className="md:mt-8"
          disabled={isLoading || !newBrand.trim()}
        >
          Adicionar
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((brand) => (
          <div
            key={brand}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50"
          >
            <span className="font-medium text-gray-900 dark:text-white">{brand}</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteBrand(brand)}
              disabled={isLoading}
              className="hover:bg-red-600/90"
            >
              Remover
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
} 