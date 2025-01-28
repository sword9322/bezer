'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { fetchTipologias, addTipologia, deleteTipologia, downloadTipologias } from '@/app/actions'
import { toast } from 'sonner'

export default function TipologiasTab() {
  const [tipologias, setTipologias] = useState<string[]>([])
  const [newTipologia, setNewTipologia] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadTipologias()
  }, [])

  const loadTipologias = async () => {
    try {
      const result = await fetchTipologias()
      setTipologias(result)
    } catch {
      console.error('Error loading tipologias')
      toast.error('Ocorreu um erro')
    }
  }

  const handleAddTipologia = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTipologia.trim()) return

    setIsLoading(true)
    try {
      await addTipologia(newTipologia)
      await loadTipologias()
      setNewTipologia('')
      toast.success('Tipologia adicionada com sucesso')
    } catch {
      toast.error('Erro ao adicionar tipologia')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTipologia = async (tipologia: string) => {
    if (!confirm(`Tem certeza que deseja excluir ${tipologia}?`)) return

    setIsLoading(true)
    try {
      await deleteTipologia(tipologia)
      await loadTipologias()
      toast.success('Tipologia removida com sucesso')
    } catch {
      toast.error('Erro ao remover tipologia')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadTipologias = async () => {
    try {
      await downloadTipologias()
      toast.success('Download iniciado')
    } catch {
      toast.error('Erro ao baixar tipologias')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Gestão de Tipologias</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Adicione ou remova tipologias do sistema
          </p>
        </div>
        <Button
          onClick={handleDownloadTipologias}
          variant="outline"
          className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
          Exportar Tipologias
        </Button>
      </div>

      <form onSubmit={handleAddTipologia} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="tipologia">Nova Tipologia</Label>
          <Input
            id="tipologia"
            value={newTipologia}
            onChange={(e) => setNewTipologia(e.target.value)}
            placeholder="Digite o nome da tipologia"
            className="mt-1.5"
          />
        </div>
        <Button 
          type="submit" 
          className="md:mt-8"
          disabled={isLoading || !newTipologia.trim()}
        >
          Adicionar
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tipologias.map((tipologia) => (
          <div
            key={tipologia}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50"
          >
            <span className="font-medium text-gray-900 dark:text-white">{tipologia}</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteTipologia(tipologia)}
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