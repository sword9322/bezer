import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faPlus, 
  faSearch, 
  faSpinner,
  faEye,
  faPencilAlt,
  faTrash,
  faDownload,
  faCircle
} from '@fortawesome/free-solid-svg-icons'
import Modal from '@/components/modals'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  customClaims?: {
    role?: string;
  };
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
  disabled?: boolean;
}

type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: string;
  createdAt: string;
  lastSignInTime: string;
  disabled?: boolean;
}

type EditFormData = {
  displayName: string;
  role: string;
}

type InviteFormData = {
  email: string;
  role: string;
}

export default function UsersTab() {
  const router = useRouter()
  const { isAdmin, isManager } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<EditFormData>({ displayName: '', role: '' })
  const [inviteFormData, setInviteFormData] = useState<InviteFormData>({ email: '', role: 'user' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null)

  useEffect(() => {
    if (!isAdmin && !isManager) {
      router.push('/')
      return
    }
    fetchUsers()
  }, [isAdmin, isManager, router])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      const formattedUsers = data.users.map((user: FirebaseUser) => ({
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || 'Não Definido',
        photoURL: user.photoURL || null,
        role: user.customClaims?.role || 'user',
        createdAt: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
        disabled: user.disabled || false
      }))
      setUsers(formattedUsers)
    } catch (err) {
      console.error('Error fetching users:', err)
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = (
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleSort = (key: keyof User) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !isAdmin) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: selectedUser.uid, role: editFormData.role })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      toast.success('Usuário atualizado com sucesso')
      setIsEditModalOpen(false)
      fetchUsers()
    } catch (err) {
      console.error('Error updating user:', err)
      toast.error('Erro ao atualizar usuário')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedUser || !isAdmin) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: selectedUser.uid })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      toast.success('Usuário excluído com sucesso')
      setIsDeleteModalOpen(false)
      fetchUsers()
    } catch (err) {
      console.error('Error deleting user:', err)
      toast.error('Erro ao excluir usuário')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteFormData)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      toast.success('Convite enviado com sucesso')
      setIsInviteModalOpen(false)
      setInviteFormData({ email: '', role: 'user' })
      fetchUsers()
    } catch (err) {
      console.error('Error inviting user:', err)
      toast.error('Erro ao enviar convite')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setIsViewModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    if (!isAdmin) return
    setSelectedUser(user)
    setEditFormData({ displayName: user.displayName || '', role: user.role })
    setIsEditModalOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    if (!isAdmin) return
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const handleExportUsers = () => {
    const csv = [
      ['Nome', 'Email', 'Função', 'Status', 'Criado em', 'Último acesso'],
      ...filteredUsers.map(user => [
        user.displayName,
        user.email,
        user.role,
        user.disabled ? 'Inativo' : 'Ativo',
        format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        format(new Date(user.lastSignInTime), 'dd/MM/yyyy HH:mm', { locale: ptBR })
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'usuarios.csv'
    link.click()
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error'
      case 'manager':
        return 'info'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Gestão de Usuários
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Gerencie os usuários e suas permissões de acesso
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Convidar Usuário
            </Button>
          )}
          <Button
            onClick={handleExportUsers}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Input
            type="text"
            placeholder="Pesquisar por nome ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <FontAwesomeIcon 
            icon={faSearch} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        >
          <option value="all">Todos os Usuários</option>
          <option value="admin">Administradores</option>
          <option value="manager">Gerentes</option>
          <option value="user">Usuários</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('displayName')} className="cursor-pointer">
                Nome {sortConfig?.key === 'displayName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('email')} className="cursor-pointer">
                Email {sortConfig?.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('role')} className="cursor-pointer">
                Função {sortConfig?.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer">
                Criado em {sortConfig?.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <FontAwesomeIcon icon={faSpinner} spin className="text-2xl text-blue-500" />
                </TableCell>
              </TableRow>
            ) : sortedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              sortedUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>{user.displayName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role === 'admin' ? 'Administrador' : 
                       user.role === 'manager' ? 'Gerente' : 'Usuário'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon 
                        icon={faCircle} 
                        className={user.disabled ? 'text-red-500' : 'text-green-500'} 
                        size="xs"
                      />
                      <Badge variant={user.disabled ? 'error' : 'success'}>
                        {user.disabled ? 'Inativo' : 'Ativo'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                        title="Visualizar"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            title="Editar"
                          >
                            <FontAwesomeIcon icon={faPencilAlt} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            title="Excluir"
                            className="text-red-500 hover:text-red-700"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View User Modal */}
      <Modal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)}
      >
        <div className="p-6 space-y-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Detalhes do Usuário
          </h3>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <p className="text-slate-900 dark:text-white">{selectedUser.displayName}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-slate-900 dark:text-white">{selectedUser.email}</p>
              </div>
              <div>
                <Label>Função</Label>
                <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                  {selectedUser.role === 'admin' ? 'Administrador' : 
                   selectedUser.role === 'manager' ? 'Gerente' : 'Usuário'}
                </Badge>
              </div>
              <div>
                <Label>Status</Label>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon 
                    icon={faCircle} 
                    className={selectedUser.disabled ? 'text-red-500' : 'text-green-500'} 
                    size="xs"
                  />
                  <Badge variant={selectedUser.disabled ? 'error' : 'success'}>
                    {selectedUser.disabled ? 'Inativo' : 'Ativo'}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Criado em</Label>
                <p className="text-slate-900 dark:text-white">
                  {format(new Date(selectedUser.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>
              <div>
                <Label>Último acesso</Label>
                <p className="text-slate-900 dark:text-white">
                  {format(new Date(selectedUser.lastSignInTime), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit User Modal */}
      {isAdmin && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <div className="p-6 space-y-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Editar Usuário
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label>Função</Label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="user">Usuário</option>
                  <option value="manager">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  ) : null}
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Delete User Modal */}
      {isAdmin && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <div className="p-6 space-y-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Excluir Usuário
            </h3>
            <p className="text-slate-900 dark:text-white">
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                {isSubmitting ? (
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                ) : null}
                Excluir
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Invite User Modal */}
      {isAdmin && (
        <Modal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        >
          <div className="p-6 space-y-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Convidar Usuário
            </h3>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={inviteFormData.email}
                  onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Função</Label>
                <select
                  value={inviteFormData.role}
                  onChange={(e) => setInviteFormData({ ...inviteFormData, role: e.target.value })}
                  className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="user">Usuário</option>
                  <option value="manager">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  {isSubmitting ? (
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  ) : null}
                  Convidar
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  )
} 