import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Página não encontrada</h2>
        <p className="text-gray-600 dark:text-gray-400">A página que você está procurando não existe ou foi movida.</p>
        <Link href="/">
          <Button className="mt-4">
            Voltar para a página inicial
          </Button>
        </Link>
      </div>
    </div>
  )
} 