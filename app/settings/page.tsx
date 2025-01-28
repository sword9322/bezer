'use client'

import SettingsPage from '@/components/SettingsPage'
import UserProfile from '@/components/UserProfile'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function Settings() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header with User Profile */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Link 
                href="/"
                className="bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 transition-all duration-300 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <FontAwesomeIcon icon={faHome} className="w-4 h-4" />
                <span>Home</span>
              </Link>
              
              <div className="text-center order-first sm:order-none">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                  Configurações
                </h1>
                <p className="mt-1 sm:mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                  Gerencie suas preferências e configurações do sistema
                </p>
              </div>

              <div className="flex items-center w-full sm:w-auto justify-center sm:justify-end">
                <UserProfile />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <SettingsPage />
        </div>
      </main>
    </ProtectedRoute>
  )
}
