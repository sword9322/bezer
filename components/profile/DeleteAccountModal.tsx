'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import Modal from '@/components/modals'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const router = useRouter()
  const { logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [confirmation, setConfirmation] = useState('')

  const handleDelete = async () => {
    if (confirmation !== 'DELETAR') {
      toast.error('Digite DELETAR para confirmar')
      return
    }

    setLoading(true)
    try {
      await logout()
      toast.success('Conta excluída com sucesso')
      router.push('/login')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Erro ao excluir conta')
    } finally {
      setLoading(false)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              Excluir Conta
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Esta ação não pode ser desfeita
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Você está prestes a excluir sua conta permanentemente. Todos os seus dados serão perdidos.
            Para confirmar, digite <strong>DELETAR</strong> abaixo:
          </p>

          <div>
            <Label htmlFor="confirmation">Confirmação</Label>
            <Input
              id="confirmation"
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="mt-1"
              placeholder="Digite DELETAR"
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="bg-white dark:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading || confirmation !== 'DELETAR'}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir Conta'
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
} 