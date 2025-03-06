import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faSearch, 
  faSpinner,
  faDownload,
  faCalendar,
  faChartBar,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { DateRange } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { getAuth } from 'firebase/auth'

interface LogEntry {
  id: string;
  timestamp: string;
  actionType: string;
  entityType: string;
  entityId: string;
  changes: Record<string, unknown>;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
}

export default function ActivityLogsTab() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [entityFilter, setEntityFilter] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const logsPerPage = 50

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const auth = getAuth()
      const token = await auth.currentUser?.getIdToken(true)

      if (!token) {
        toast.error('Erro de autenticação: Faça login novamente')
        router.push('/login')
        return
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: logsPerPage.toString(),
        action: actionFilter !== 'all' ? actionFilter : '',
        entity: entityFilter !== 'all' ? entityFilter : '',
        ...(dateRange?.from && { from: dateRange.from.toISOString() }),
        ...(dateRange?.to && { to: dateRange.to.toISOString() }),
        search: searchQuery
      })

      const response = await fetch(`/api/logs?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Sessão expirada: Faça login novamente')
          router.push('/login')
          return
        }
        if (response.status === 403) {
          toast.error('Acesso negado: Você não tem permissão para ver os logs')
          router.push('/')
          return
        }
        
        const errorText = await response.text()
        console.error('Error response from logs API:', errorText)
        throw new Error(`Error ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      setLogs(data.logs || [])
      setTotalPages(Math.ceil(data.total / logsPerPage) || 1)
    } catch (err) {
      console.error('Error fetching logs:', err)
      toast.error('Não foi possível carregar os logs de atividade. Verifique se as credenciais do Google Sheets estão configuradas corretamente.', {
        duration: 5000
      })
      setLogs([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [page, logsPerPage, actionFilter, entityFilter, dateRange, searchQuery, router])

  useEffect(() => {
    if (!isAdmin) {
      router.push('/')
      return
    }
    fetchLogs()
  }, [isAdmin, router, fetchLogs])

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'added':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'edited':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'deleted':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getEntityBadgeVariant = (entity: string) => {
    switch (entity) {
      case 'product':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'brand':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'typology':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
      case 'campaign':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      case 'rack':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const handleExportLogs = () => {
    const csv = [
      ['Data/Hora', 'Ação', 'Tipo', 'Nome', 'ID', 'Usuário', 'Email', 'Função', 'Detalhes'],
      ...logs.map(log => [
        format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss'),
        log.actionType,
        log.entityType,
        log.entityId,
        log.userId,
        log.userName,
        log.userEmail,
        log.userRole,
        log.changes ? JSON.stringify(log.changes) : ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `activity_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  const getActivityStats = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp)
      return logDate >= today
    })

    return {
      addedToday: todayLogs.filter(log => log.actionType === 'added').length,
      editedToday: todayLogs.filter(log => log.actionType === 'edited').length,
      deletedToday: todayLogs.filter(log => log.actionType === 'deleted').length
    }
  }

  const stats = getActivityStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="mb-4 text-red-500 dark:text-red-400">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl" />
        </div>
        <h3 className="text-lg font-medium mb-2">Não foi possível carregar os logs</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Há um problema com a conexão ao Google Sheets. Verifique se as variáveis de ambiente estão configuradas corretamente.
        </p>
        <Button onClick={fetchLogs} className="mr-2">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Adições Hoje</p>
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.addedToday}</h3>
              </div>
              <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
                <FontAwesomeIcon icon={faChartBar} className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Edições Hoje</p>
                <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.editedToday}</h3>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full dark:bg-yellow-900">
                <FontAwesomeIcon icon={faChartBar} className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Exclusões Hoje</p>
                <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.deletedToday}</h3>
              </div>
              <div className="p-2 bg-red-100 rounded-full dark:bg-red-900">
                <FontAwesomeIcon icon={faChartBar} className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar por usuário, entidade ou ação..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as ações</SelectItem>
            <SelectItem value="added">Adições</SelectItem>
            <SelectItem value="edited">Edições</SelectItem>
            <SelectItem value="deleted">Exclusões</SelectItem>
          </SelectContent>
        </Select>

        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="product">Produtos</SelectItem>
            <SelectItem value="brand">Marcas</SelectItem>
            <SelectItem value="typology">Tipologias</SelectItem>
            <SelectItem value="campaign">Campanhas</SelectItem>
            <SelectItem value="rack">Racks</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px]">
              <FontAwesomeIcon icon={faCalendar} className="mr-2" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'dd/MM/yyyy')} -{' '}
                    {format(dateRange.to, 'dd/MM/yyyy')}
                  </>
                ) : (
                  format(dateRange.from, 'dd/MM/yyyy')
                )
              ) : (
                'Selecionar período'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Button onClick={handleExportLogs}>
          <FontAwesomeIcon icon={faDownload} className="mr-2" />
          Exportar
        </Button>
      </div>

      {/* Activity Logs Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">
                  {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                </TableCell>
                <TableCell>
                  <Badge className={getActionBadgeVariant(log.actionType)}>
                    {log.actionType === 'added' && 'Adicionado'}
                    {log.actionType === 'edited' && 'Editado'}
                    {log.actionType === 'deleted' && 'Excluído'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getEntityBadgeVariant(log.entityType)}>
                    {log.entityType === 'product' && 'Produto'}
                    {log.entityType === 'brand' && 'Marca'}
                    {log.entityType === 'typology' && 'Tipologia'}
                    {log.entityType === 'campaign' && 'Campanha'}
                    {log.entityType === 'rack' && 'Rack'}
                  </Badge>
                </TableCell>
                <TableCell>{log.entityId}</TableCell>
                <TableCell>{log.userName}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {log.userRole === 'admin' && 'Administrador'}
                    {log.userRole === 'manager' && 'Gerente'}
                    {log.userRole === 'user' && 'Usuário'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {log.changes && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Ver alterações
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium">Alterações</h4>
                          <div className="text-sm">
                            <div className="mb-2">
                              <span className="font-medium">Antes:</span>
                              <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                                {JSON.stringify(log.changes.before, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <span className="font-medium">Depois:</span>
                              <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                                {JSON.stringify(log.changes.after, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Página {page} de {totalPages}
        </div>
        <div className="space-x-2">
          <Button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <Button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  )
} 