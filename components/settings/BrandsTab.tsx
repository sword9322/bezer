'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchBrands, addBrand, deleteBrand, downloadBrands } from '@/app/actions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faDownload, faTrash } from '@fortawesome/free-solid-svg-icons'

export default function BrandsTab() {
  const [brands, setBrands] = useState<string[]>([])
  const [newBrand, setNewBrand] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    const loadedBrands = await fetchBrands()
    setBrands(loadedBrands)
  }

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBrand.trim()) return

    setLoading(true)
    try {
      await addBrand(newBrand.trim())
      await loadBrands()
      setNewBrand('')
    } catch (error) {
      console.error('Error adding brand:', error)
    }
    setLoading(false)
  }

  const handleDeleteBrand = async (brand: string) => {
    if (window.confirm(`Are you sure you want to delete ${brand}?`)) {
      try {
        await deleteBrand(brand)
        await loadBrands()
      } catch (error) {
        console.error('Error deleting brand:', error)
      }
    }
  }

  const handleDownload = async () => {
    const url = await downloadBrands()
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Button
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2.5 shadow-lg hover:shadow-green-500/30 transition-all duration-300 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faDownload} />
          <span>Exportar Marcas</span>
        </Button>
      </div>

      {/* Add Brand Form */}
      <form onSubmit={handleAddBrand} className="flex gap-4">
        <Input
          type="text"
          value={newBrand}
          onChange={(e) => setNewBrand(e.target.value)}
          placeholder="Digite o nome da marca"
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
        />
        <Button
          type="submit"
          disabled={loading || !newBrand.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Adicionar</span>
        </Button>
      </form>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((brand) => (
          <div
            key={brand}
            className="group flex items-center justify-between bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:bg-gray-50 transition-all duration-300"
          >
            <span className="text-gray-900 dark:text-gray-100 font-medium">{brand}</span>
            <Button
              onClick={() => handleDeleteBrand(brand)}
              className="opacity-0 group-hover:opacity-100 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 rounded-xl p-2 transition-all duration-300"
            >
              <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
} 