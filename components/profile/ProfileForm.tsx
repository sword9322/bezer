'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updateProfile, updatePassword, User } from 'firebase/auth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faSave, faTimes, faLock, faUser, faImage } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'

interface ProfileFormProps {
  user: User
  onCancel: () => void
  onImageUpload: (url: string | null) => void
  uploadedImage?: string | null
}

export default function ProfileForm({ user, onCancel, onImageUpload }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(user.displayName || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      onImageUpload(imageUrl)
    }
  }

  // Password strength checker
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    if (newPassword.length >= 8) strength += 1
    if (/[A-Z]/.test(newPassword)) strength += 1
    if (/[0-9]/.test(newPassword)) strength += 1
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1
    setPasswordStrength(strength)
  }, [newPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Update profile information
      const updates: { displayName?: string; photoURL?: string } = {}
      
      if (name !== user.displayName) {
        updates.displayName = name
      }

      if (Object.keys(updates).length > 0) {
        await updateProfile(user, updates)
      }

      // Update password if provided
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          toast.error('As senhas não coincidem')
          return
        }

        if (newPassword.length < 8) {
          toast.error('A senha deve ter pelo menos 8 caracteres')
          return
        }

        if (passwordStrength < 3) {
          toast.error('A senha deve ser mais forte')
          return
        }

        await updatePassword(user, newPassword)
      }

      toast.success('Perfil atualizado com sucesso!')
      onCancel()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return 'bg-gray-200'
      case 1: return 'bg-red-500'
      case 2: return 'bg-yellow-500'
      case 3: return 'bg-blue-500'
      case 4: return 'bg-green-500'
      default: return 'bg-gray-200'
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* Personal Information Section */}
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-6"
        >
          <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Informações Pessoais</h3>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nome Completo
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Digite seu nome completo"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Label htmlFor="image" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faImage} className="w-4 h-4" />
                Foto de Perfil
              </div>
            </Label>
            <div className="mt-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Password Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-6">
          <FontAwesomeIcon icon={faLock} className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Alterar Senha</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Senha Atual
            </Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-2 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          <div>
            <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nova Senha
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-2 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            {newPassword && (
              <div className="mt-2">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${getPasswordStrengthColor()}`} />
                  {passwordStrength === 0 && 'Senha muito fraca'}
                  {passwordStrength === 1 && 'Senha fraca'}
                  {passwordStrength === 2 && 'Senha média'}
                  {passwordStrength === 3 && 'Senha forte'}
                  {passwordStrength === 4 && 'Senha muito forte'}
                </p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirmar Nova Senha
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                As senhas não coincidem
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Form Actions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700"
      >
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
        >
          <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transform hover:scale-[1.02] transition-all duration-300"
        >
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSave} className="w-4 h-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </motion.div>
    </motion.form>
  )
} 