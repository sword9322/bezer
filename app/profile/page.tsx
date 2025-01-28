'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCamera, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import ProfileForm from '@/components/profile/ProfileForm'
import DeleteAccountModal from '@/components/profile/DeleteAccountModal'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="group bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl px-4 py-2 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <FontAwesomeIcon 
                icon={faArrowLeft} 
                className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" 
              />
              <span>Voltar</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Perfil do Usuário</h1>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={isEditing ? 'edit' : 'view'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Profile Info Card */}
              <Card className="overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative pb-32 bg-gradient-to-br from-blue-500 to-purple-500">
                  {/* Profile Picture */}
                  <motion.div 
                    className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-white ring-4 ring-white dark:ring-gray-800 shadow-xl">
                        {(user.photoURL || uploadedImage) ? (
                          <Image
                            src={uploadedImage || user.photoURL || ''}
                            alt="Profile"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white text-3xl font-semibold">
                            {user.email?.[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <button 
                        className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full p-2.5 shadow-lg transition-all duration-300 transform hover:scale-110"
                        onClick={() => setIsEditing(true)}
                        aria-label="Edit profile picture"
                      >
                        <FontAwesomeIcon icon={faCamera} className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                </div>

                {/* User Info */}
                <div className="px-8 pt-20 pb-8">
                  <div className="space-y-6 text-center">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block">Nome</label>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                        {user.displayName || (
                          <span className="text-gray-400 italic text-base">
                            Clique em editar para adicionar seu nome
                          </span>
                        )}
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block">Email</label>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1 break-all">
                        {user.email}
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block">Conta criada em</label>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                        {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('pt-BR') : 'N/A'}
                      </p>
                    </motion.div>

                    {!isEditing && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="pt-4"
                      >
                        <Button 
                          onClick={() => setIsEditing(true)}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl py-3 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                        >
                          <FontAwesomeIcon icon={faEdit} className="w-4 h-4 mr-2" />
                          Editar Perfil
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Edit Form */}
              {isEditing && (
                <Card className="mt-8 p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg">
                  <ProfileForm 
                    user={user} 
                    onCancel={() => setIsEditing(false)}
                    onImageUpload={setUploadedImage}
                    uploadedImage={uploadedImage}
                  />
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Delete Account Button */}
          <motion.div 
            className="mt-8 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-500/90 hover:bg-red-600 text-white rounded-xl px-8 py-3 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              aria-label="Delete account"
            >
              <FontAwesomeIcon icon={faTrash} className="w-4 h-4 mr-2" />
              Excluir Conta
            </Button>
          </motion.div>
        </div>

        {/* Delete Account Modal */}
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        />
      </div>
    </div>
  )
} 