'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchTipologias, addTipologia, deleteTipologia, downloadTipologias } from '@/app/actions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faDownload, faTrash } from '@fortawesome/free-solid-svg-icons'

export default function TipologiasTab() {
  const [tipologias, setTipologias] = useState<string[]>([])
  const [newTipologia, setNewTipologia] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTipologias()
  }, [])

  const loadTipologias = async () => {
    const loadedTipologias = await fetchTipologias()
    setTipologias(loadedTipologias)
  }

  const handleAddTipologia = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTipologia.trim()) return

    setLoading(true)
    try {
      await addTipologia(newTipologia.trim())
      await loadTipologias()
      setNewTipologia('')
    } catch (error) {
      console.error('Error adding tipologia:', error)
    }
    setLoading(false)
  }

  const handleDeleteTipologia = async (tipologia: string) => {
    if (window.confirm(`Are you sure you want to delete ${tipologia}?`)) {
      try {
        await deleteTipologia(tipologia)
        await loadTipologias()
      } catch (error) {
        console.error('Error deleting tipologia:', error)
      }
    }
  }

  const handleDownload = async () => {
    const url = await downloadTipologias()
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
          <span>Exportar Tipologias</span>
        </Button>
      </div>

      {/* Add Tipologia Form */}
      <form onSubmit={handleAddTipologia} className="flex gap-4">
        <Input
          type="text"
          value={newTipologia}
          onChange={(e) => setNewTipologia(e.target.value)}
          placeholder="Digite o nome da tipologia"
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
        />
        <Button
          type="submit"
          disabled={loading || !newTipologia.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Adicionar</span>
        </Button>
      </form>

      {/* Tipologias Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tipologias.map((tipologia) => (
          <div
            key={tipologia}
            className="group flex items-center justify-between bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:bg-gray-50 transition-all duration-300"
          >
            <span className="text-gray-900 dark:text-gray-100 font-medium">{tipologia}</span>
            <Button
              onClick={() => handleDeleteTipologia(tipologia)}
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