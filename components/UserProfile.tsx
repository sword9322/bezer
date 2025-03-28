'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'sonner'

export default function UserProfile() {
  const { user, logout, isAdmin } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logout realizado com sucesso')
      router.push('/login')
    } catch {
      toast.error('Erro ao fazer logout')
    }
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.email) return '?'
    return user.email.charAt(0).toUpperCase()
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* User Avatar */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 text-lg font-medium"
        >
          {getInitials()}
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden z-[999]">
            {/* User Info Section */}
            <div className="px-4 py-3">
              <p className="text-base font-medium text-gray-900 dark:text-white mb-0.5">{user?.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Último acesso: {new Date().toLocaleDateString()}</p>
            </div>
            
            {/* Menu Items */}
            <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
              <a
                href="#"
                className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => {
                  setIsDropdownOpen(false)
                  router.push('/profile')
                }}
              >
                <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-gray-400 mr-3" />
                <span>Perfil</span>
              </a>
              
              {/* Only show Settings option for admins */}
              {isAdmin && (
                <a
                  href="#"
                  className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => {
                    setIsDropdownOpen(false)
                    router.push('/settings')
                  }}
                >
                  <FontAwesomeIcon icon={faCog} className="w-5 h-5 text-gray-400 mr-3" />
                  <span>Configurações</span>
                </a>
              )}
            </div>

            {/* Logout Button */}
            <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
              <button
                onClick={() => {
                  setIsDropdownOpen(false)
                  setShowLogoutModal(true)
                }}
                className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 mr-3" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999]">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div 
              className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-auto shadow-2xl transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Confirmar Logout
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Tem certeza que deseja sair?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 