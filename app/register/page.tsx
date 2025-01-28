'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { toast } from 'sonner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import { FirebaseError } from 'firebase/app'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, user } = useAuth()
  const router = useRouter()

  // Password validation states
  const [validations, setValidations] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasMinLength: false,
    passwordsMatch: false
  })

  // Update validations when password changes
  useEffect(() => {
    setValidations({
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasMinLength: password.length >= 8,
      passwordsMatch: password === confirmPassword && password !== ''
    })
  }, [password, confirmPassword])

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Check all password requirements
    if (!validations.hasUpperCase) {
      toast.error('A senha deve conter pelo menos uma letra maiúscula')
      setLoading(false)
      return
    }

    if (!validations.hasLowerCase) {
      toast.error('A senha deve conter pelo menos uma letra minúscula')
      setLoading(false)
      return
    }

    if (!validations.hasNumber) {
      toast.error('A senha deve conter pelo menos um número')
      setLoading(false)
      return
    }

    if (!validations.hasSpecialChar) {
      toast.error('A senha deve conter pelo menos um caractere especial')
      setLoading(false)
      return
    }

    if (!validations.hasMinLength) {
      toast.error('A senha deve ter pelo menos 8 caracteres')
      setLoading(false)
      return
    }

    if (!validations.passwordsMatch) {
      toast.error('As senhas não coincidem')
      setLoading(false)
      return
    }

    try {
      await register(email, password)
      toast.success('Registro realizado com sucesso!')
      router.push('/')
    } catch (error) {
      console.error('Error registering:', error)
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            toast.error('Este email já está em uso')
            break
          case 'auth/invalid-email':
            toast.error('Email inválido')
            break
          default:
            toast.error('Erro ao criar conta')
        }
      } else {
        toast.error('Erro ao criar conta')
      }
    } finally {
      setLoading(false)
    }
  }

  const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className="flex items-center gap-2 text-sm">
      <FontAwesomeIcon
        icon={isValid ? faCheck : faTimes}
        className={isValid ? 'text-green-500' : 'text-red-500'}
      />
      <span className={isValid ? 'text-green-600' : 'text-slate-600'}>
        {text}
      </span>
    </div>
  )

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Criar nova conta
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Preencha os dados abaixo para se registrar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-white transition-all"
              />
              {/* Password requirements checklist */}
              <div className="mt-2 space-y-1 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                <ValidationItem isValid={validations.hasMinLength} text="Mínimo de 8 caracteres" />
                <ValidationItem isValid={validations.hasUpperCase} text="Uma letra maiúscula" />
                <ValidationItem isValid={validations.hasLowerCase} text="Uma letra minúscula" />
                <ValidationItem isValid={validations.hasNumber} text="Um número" />
                <ValidationItem isValid={validations.hasSpecialChar} text="Um caractere especial (!@#$%^&*)" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-white transition-all"
              />
              {confirmPassword && (
                <div className="mt-2">
                  <ValidationItem isValid={validations.passwordsMatch} text="Senhas coincidem" />
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !Object.values(validations).every(Boolean)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 