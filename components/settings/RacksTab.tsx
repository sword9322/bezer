"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSearch, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons'
import Modal from '@/components/modals'
import { getRacks, addRack, updateRack, deleteRack, type Rack } from '@/app/actions/racks'
import { toast } from 'sonner'

export default function RacksTab() {
  const [selectedWarehouse, setSelectedWarehouse] = useState('Warehouse 1')
  const [racks, setRacks] = useState<Rack[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingRack, setEditingRack] = useState<Rack | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    warehouse: 'Warehouse 1'
  })

  useEffect(() => {
    fetchRacks()
  }, [selectedWarehouse])

  const fetchRacks = async () => {
    setLoading(true)
    try {
      const fetchedRacks = await getRacks(selectedWarehouse)
      setRacks(fetchedRacks)
    } catch (error) {
      console.error('Error fetching racks:', error)
      toast.error('Erro ao carregar racks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setFormData(prev => ({ ...prev, warehouse: selectedWarehouse }))
  }, [selectedWarehouse])

  const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newWarehouse = e.target.value
    setSelectedWarehouse(newWarehouse)
  }

  const filteredRacks = racks.filter(rack => 
    rack.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingRack) {
        const result = await updateRack({
          ...editingRack,
          warehouse: formData.warehouse
        })
        if (result.success) {
          toast.success('Rack atualizado com sucesso')
          setIsAddModalOpen(false)
          fetchRacks()
        } else {
          toast.error(result.error || 'Erro ao atualizar rack')
        }
      } else {
        const result = await addRack({
          id: formData.id,
          warehouse: formData.warehouse
        })
        if (result.success) {
          toast.success('Rack adicionado com sucesso')
          setIsAddModalOpen(false)
          setFormData({ id: '', warehouse: 'Warehouse 1' })
          fetchRacks()
        } else {
          toast.error(result.error || 'Erro ao adicionar rack')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ocorreu um erro ao salvar o rack')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRack = async (rackId: string) => {
    if (window.confirm('Are you sure you want to delete this rack?')) {
      const result = await deleteRack(rackId)
      if (result.success) {
        toast.success('Rack excluído com sucesso')
        fetchRacks()
      } else {
        toast.error('Erro ao excluir rack')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Gestão de Racks
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Organize e gerencie os racks em seus armazéns
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedWarehouse}
            onChange={handleWarehouseChange}
            className="rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            <option value="Warehouse 1">Armazém 1</option>
            <option value="Warehouse 2">Armazém 2</option>
          </select>
          <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            {racks.length} Racks
          </div>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Input
            type="text"
            placeholder="Pesquisar por ID do rack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <FontAwesomeIcon 
            icon={faSearch} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        <Button
          onClick={() => {
            setEditingRack(null)
            setIsAddModalOpen(true)
          }}
          className="w-full md:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Adicionar Rack
        </Button>
      </div>

      {/* Racks Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredRacks.map((rack) => (
          <div
            key={rack.id}
            className="group relative bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                {rack.id}
              </span>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDeleteRack(rack.id)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                  aria-label="Excluir rack"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-xl max-w-md w-full mx-auto">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {editingRack ? 'Editar Rack' : 'Adicionar Novo Rack'}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rackId" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                ID do Rack
              </Label>
              <Input
                id="rackId"
                type="text"
                placeholder="Ex: R1, N1, etc."
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="warehouse" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Armazém
              </Label>
              <select
                id="warehouse"
                value={formData.warehouse}
                onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                required
              >
                <option value="Warehouse 1">Armazém 1</option>
                <option value="Warehouse 2">Armazém 2</option>
              </select>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
} 