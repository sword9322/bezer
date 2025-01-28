'use client'

import InventoryTable from '@/components/InventoryTable'
import { Toaster } from 'sonner'
import UserProfile from '@/components/UserProfile'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header with User Profile */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent font-display">
                BEZE
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Bem-vindo, {user?.email?.split('@')[0]}!
              </p>
            </div>
            <UserProfile />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InventoryTable />
      </div>
      
      <Toaster richColors position="top-right" />
    </main>
  )
}

