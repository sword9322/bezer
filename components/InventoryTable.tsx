'use client'

import { useState, useEffect, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getProducts, deleteProduct, updateProduct, downloadSheet, downloadPDF, fetchBrands, fetchTipologias } from '@/app/actions'
import EditProductForm from '@/components/EditProductForm'
import Modal from '@/components/modals'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faPlus,
  faEdit, 
  faBoxes,
  faBoxOpen,
  faTrashRestore,
  faCog,
  faSyncAlt,
  faColumns,
  faFilter,
  faFileExcel,
  faFilePdf,
  faImage,
  faChevronLeft,
  faChevronRight,
  faTimes
} from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'
import GoogleDriveIcon from '@/components/icons/google-drive.png'
import GoogleSheetsIcon from '@/components/icons/sheets.png'
import InventoryForm from '@/components/InventoryForm'
import DeletedProducts from '@/components/DeletedProducts'
import Link from 'next/link'
import { Pencil1Icon, TrashIcon, EyeOpenIcon } from '@radix-ui/react-icons'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

export type Product = {
  ref: string
  image: string
  altura: number
  largura: number
  brand: string
  campaign: string
  date: string
  stock: number
  localidade: string
  tipologia: string
  notes?: string
  warehouse: string
  userId?: string
  userName?: string
  userEmail?: string
  userRole?: string
}

export default function InventoryTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [notesModalOpen, setNotesModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [notes, setNotes] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [deletedProductsModalOpen, setDeletedProductsModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState('Warehouse 1');
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [tipologias, setTipologias] = useState<string[]>([]);
  const [uniqueCampaigns, setUniqueCampaigns] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, userRole } = useAuth()

  const [filters, setFilters] = useState({
    ref: '',
    brand: '',
    campaign: '',
    date: '',
    stock: '',
    localidade: '',
    tipologia: '',
    notes: '',
  });

  const [visibleColumns, setVisibleColumns] = useState({
    ref: true,
    image: true,
    altura: true,
    largura: true,
    brand: true,
    campaign: true,
    date: true,
    stock: true,
    localidade: true,
    tipologia: true,
    actions: true,
  });

  const toggleColumnVisibility = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const selectAllColumns = () => {
    setVisibleColumns(Object.keys(visibleColumns).reduce((acc, column) => {
      acc[column as keyof typeof visibleColumns] = true;
      return acc;
    }, {} as typeof visibleColumns));
  };

  const deselectAllColumns = () => {
    setVisibleColumns(Object.keys(visibleColumns).reduce((acc, column) => {
      acc[column as keyof typeof visibleColumns] = false;
      return acc;
    }, {} as typeof visibleColumns));
  };

  const fetchProducts = useCallback(async () => {
    let combinedProducts = [];
    if (selectedWarehouse === 'Both') {
      const result1 = await getProducts(currentPage, 'Warehouse 1');
      const result2 = await getProducts(currentPage, 'Warehouse 2');
      combinedProducts = [...result1.products, ...result2.products];
    } else {
      const result = await getProducts(currentPage, selectedWarehouse);
      combinedProducts = result.products;
    }
    const productsWithNotes = combinedProducts.map((product) => ({
      ...product,
      altura: product.height || 0,
      largura: product.width || 0,
      notes: product.notes || '',
    }));
    setProducts(productsWithNotes);
    setTotalPages(Math.ceil(productsWithNotes.length / 10));
  }, [currentPage, selectedWarehouse]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      const [fetchedBrands, fetchedTipologias] = await Promise.all([
        fetchBrands(),
        fetchTipologias()
      ]);
      setBrands(fetchedBrands);
      setTipologias(fetchedTipologias);
    };
    loadFilterOptions();
  }, []);

  useEffect(() => {
    // Extract unique campaigns from products
    const campaigns = Array.from(new Set(products.map(p => p.campaign))).filter(Boolean);
    setUniqueCampaigns(campaigns);
  }, [products]);

  const handleDelete = async (ref: string) => {
    if (loadingStates[ref]) return // Prevent duplicate submissions
    if (!user) {
      toast.error('Por favor, faça login para excluir produtos')
      return
    }

    try {
      setLoadingStates(prev => ({ ...prev, [ref]: true }))

      const result = await deleteProduct(ref, {
        id: user.uid,
        name: user.displayName || user.email || 'Unknown User',
        email: user.email || 'No Email',
        role: userRole || 'user'
      })

      if (result.success) {
        toast.success('Produto excluído com sucesso')
        fetchProducts()
      } else {
        toast.error(result.error || 'Erro ao excluir produto')
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, [ref]: false }))
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingProduct(null);
  };

  const handleShowNotes = (product: Product) => {
    setNotes(product.notes || '');
    setEditingProduct(product);
    setNotesModalOpen(true);
    setEditingNotes(false);
  };

  const handleCloseNotesModal = () => {
    setNotesModalOpen(false);
    setNotes(null);
    setEditingProduct(null);
    setEditingNotes(false);
  };

  const handleUpdate = async (updatedProduct: Product) => {
    if (isUpdating) return // Prevent duplicate submissions
    if (!user) {
      toast.error('Por favor, faça login para atualizar produtos')
      return
    }

    try {
      setIsUpdating(true)

      // Add user information to the product for logging
      const productWithUser = {
        ...updatedProduct,
        userId: user.uid,
        userName: user.displayName || user.email || 'Unknown User',
        userEmail: user.email || 'No Email',
        userRole: userRole || 'user'
      }

      const result = await updateProduct(productWithUser)
      if (result.success) {
        toast.success('Produto atualizado com sucesso')
        fetchProducts()
        setEditingProduct(null)
        setEditModalOpen(false)
      } else {
        toast.error(result.error || 'Erro ao atualizar produto')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const filteredProducts = products.filter(product => {
    return (
      product.ref.toLowerCase().includes(filters.ref.toLowerCase()) &&
      product.brand.toLowerCase().includes(filters.brand.toLowerCase()) &&
      product.campaign.toLowerCase().includes(filters.campaign.toLowerCase()) &&
      product.date.toLowerCase().includes(filters.date.toLowerCase()) &&
      product.stock.toString().includes(filters.stock) &&
      product.localidade.toLowerCase().includes(filters.localidade.toLowerCase()) &&
      (product.tipologia?.toLowerCase().includes(filters.tipologia.toLowerCase()) || !filters.tipologia)
    );
  });

  const handleDownload = async () => {
    const url = await downloadSheet();
    window.open(url, '_blank');
  };

  const handleDownloadPDF = async () => {
    const url = await downloadPDF();
    window.open(url, '_blank');
  };

  const openGoogleSheet = () => {
    window.open(`https://docs.google.com/spreadsheets/d/1F0FmaEcFZhvlaQ3D4i22TJj_Q5ST4wJ6SqUcmds90no`, '_blank')
  }

  const openGoogleDrive = () => {
    window.open(`https://drive.google.com/drive/u/2/folders/1jC__wec1icenm-UjqaCqU1EVEEg5Pawv`, '_blank')
  }

  const handleUpdateNotes = async () => {
    if (editingProduct) {
      console.log('Updating notes:', notes);
      const updatedProduct = { 
        ...editingProduct, 
        notes: notes || '' // Ensure notes is never undefined
      };
      const result = await updateProduct(updatedProduct);
      if (result.success) {
        setEditingNotes(false);
        setProducts(prev => prev.map(p => 
          p.ref === updatedProduct.ref ? updatedProduct : p
        ));
        // Refresh the products list to ensure we have the latest data
        fetchProducts();
        handleCloseNotesModal();
      } else {
        console.error('Failed to update notes');
        alert('Erro ao salvar as notas. Por favor, tente novamente.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 relative">
      {/* Abstract background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>

      <div className="container mx-auto px-4 py-1 max-w-7xl relative z-10">
        {/* Breadcrumb */}
        <nav className="mb-4">
          <ol className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
            <li><Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link></li>
            <li><span className="px-2">/</span></li>
            <li className="font-medium text-slate-900 dark:text-white">Gestão de Inventário</li>
          </ol>
        </nav>

        {/* App Header with Icon and Description */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <FontAwesomeIcon icon={faBoxes} className="text-2xl text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Gestão de Inventário
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Gerencie seu inventário de forma eficiente e profissional
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Products Card */}
          <div className="group bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/5 dark:to-blue-600/5 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200/50 dark:border-blue-500/10 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-blue-600/80 dark:text-blue-400">Produtos</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {products.length}
                </h3>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                <FontAwesomeIcon icon={faBoxes} className="text-xl text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="h-2 bg-blue-500/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-700" 
                style={{ width: '70%' }}
              />
            </div>
          </div>

          {/* Stock Card */}
          <div className="group bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/5 dark:to-green-600/5 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200/50 dark:border-green-500/10 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-green-600/80 dark:text-green-400">Stock Total</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {products.reduce((total, product) => total + product.stock, 0)}
                </h3>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                <FontAwesomeIcon icon={faBoxOpen} className="text-xl text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="h-2 bg-green-500/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 group-hover:from-green-600 group-hover:to-green-700" 
                style={{ width: '85%' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => setAddProductModalOpen(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-3.5 font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:translate-y-[-2px]"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Adicionar Produto
            </Button>

            <Button 
              onClick={() => setDeletedProductsModalOpen(true)}
              className="w-full bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl py-3.5 font-medium shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300 transform hover:translate-y-[-2px]"
            >
              <FontAwesomeIcon icon={faTrashRestore} className="mr-2 text-slate-500" />
              Produtos Eliminados
            </Button>

            <Link href="/settings" className="block">
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl py-3.5 font-medium shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:translate-y-[-2px]"
              >
                <FontAwesomeIcon icon={faCog} className="mr-2" />
                Definições
              </Button>
            </Link>
          </div>
        </div>

        {/* Table Controls with improved styling */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 shadow-sm transition-all duration-200 hover:border-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Warehouse 1">Armazem 1</SelectItem>
                <SelectItem value="Warehouse 2">Armazem 2</SelectItem>
                <SelectItem value="Both">Ambos</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={fetchProducts}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl px-4 py-2.5 shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              <FontAwesomeIcon icon={faSyncAlt} className="mr-2" />
              Refresh
            </Button>

            <Button
              onClick={() => setShowColumnSelector(true)}
              className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2.5 shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300"
            >
              <FontAwesomeIcon icon={faColumns} className="mr-2" />
              Colunas
            </Button>

            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2.5 shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300"
            >
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              Filtros
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={openGoogleSheet} className="p-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300">
              <Image src={GoogleSheetsIcon} alt="Google Sheets" width={24} height={24} className="rounded" />
            </Button>
            <Button onClick={openGoogleDrive} className="p-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300">
              <Image src={GoogleDriveIcon} alt="Google Drive" width={24} height={24} className="rounded" />
            </Button>
            <Button onClick={handleDownload} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl px-4 py-2.5 shadow-lg hover:shadow-green-500/25 transition-all duration-300">
              <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
              Excel
            </Button>
            <Button onClick={handleDownloadPDF} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl px-4 py-2.5 shadow-lg hover:shadow-red-500/25 transition-all duration-300">
              <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto">
              <Input
                placeholder="REF"
                name="ref"
                value={filters.ref}
                onChange={handleFilterChange}
                className="rounded-xl w-32 flex-shrink-0"
              />
              <select
                name="brand"
                value={filters.brand}
                onChange={handleFilterChange}
                className="rounded-xl w-32 flex-shrink-0 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600"
              >
                <option value="">Todas Marcas</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              <select
                name="campaign"
                value={filters.campaign}
                onChange={handleFilterChange}
                className="rounded-xl w-32 flex-shrink-0 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600"
              >
                <option value="">Todas Campanhas</option>
                {uniqueCampaigns.map((campaign) => (
                  <option key={campaign} value={campaign}>{campaign}</option>
                ))}
              </select>
              <Input
                placeholder="Data"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="rounded-xl w-32 flex-shrink-0"
              />
              <Input
                placeholder="Stock"
                name="stock"
                value={filters.stock}
                onChange={handleFilterChange}
                className="rounded-xl w-24 flex-shrink-0"
              />
              <Input
                placeholder="Localização"
                name="localidade"
                value={filters.localidade}
                onChange={handleFilterChange}
                className="rounded-xl w-32 flex-shrink-0"
              />
              <select
                name="tipologia"
                value={filters.tipologia}
                onChange={handleFilterChange}
                className="rounded-xl w-32 flex-shrink-0 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600"
              >
                <option value="">Todas Tipologias</option>
                {tipologias.map((tipologia) => (
                  <option key={tipologia} value={tipologia}>{tipologia}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Main Table with improved styling */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="bg-slate-50/90 dark:bg-slate-700/90 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-600/50">
                  {/* Updated header typography */}
                  {visibleColumns.ref && (
                    <TableHead className="text-center p-4 font-semibold text-slate-600 dark:text-slate-300 text-sm tracking-wider uppercase">
                      REF
                    </TableHead>
                  )}
                  {visibleColumns.image && <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Imagem</TableHead>}
                  {visibleColumns.altura && <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Altura</TableHead>}
                  {visibleColumns.largura && <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Largura</TableHead>}
                  {visibleColumns.brand && <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Marca</TableHead>}
                  {visibleColumns.campaign && <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Campanha</TableHead>}
                  {visibleColumns.date && <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Data</TableHead>}
                  {visibleColumns.stock && <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Stock</TableHead>}
                  {visibleColumns.localidade && <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Localização</TableHead>}
                  {visibleColumns.tipologia && <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Tipo</TableHead>}
                  {visibleColumns.actions && <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product, index) => (
                  <TableRow 
                    key={product.ref}
                    className={`
                      ${index % 2 === 0 ? 'bg-white/50 dark:bg-slate-800/50' : 'bg-slate-50/50 dark:bg-slate-700/50'}
                      hover:bg-blue-50/50 dark:hover:bg-blue-900/20 
                      border-b border-slate-200/50 dark:border-slate-700/50
                      transition-all duration-200
                      ${loadingStates[product.ref] ? 'opacity-50 pointer-events-none' : ''}
                    `}
                  >
                    {visibleColumns.ref && <TableCell className="text-center p-4 text-gray-900 dark:text-gray-100">{product.ref}</TableCell>}
                    {visibleColumns.image && <TableCell className="text-center p-4">
                      <Button 
                        onClick={() => window.open(product.image, '_blank')} 
                        className="h-9 w-9 p-0 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200"
                      >
                        <FontAwesomeIcon icon={faImage} className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      </Button>
                    </TableCell>}
                    {visibleColumns.altura && <TableCell className="text-center p-4 text-gray-900 dark:text-gray-100">{product.altura}</TableCell>}
                    {visibleColumns.largura && <TableCell className="text-center p-4 text-gray-900 dark:text-gray-100">{product.largura}</TableCell>}
                    {visibleColumns.brand && <TableCell className="text-center p-4 text-gray-900 dark:text-gray-100">{product.brand}</TableCell>}
                    {visibleColumns.campaign && <TableCell className="text-center p-4 text-gray-900 dark:text-gray-100">{product.campaign}</TableCell>}
                    {visibleColumns.date && <TableCell className="text-center p-4 text-gray-900 dark:text-gray-100">
                      {new Date(product.date).toLocaleDateString('pt-BR')}
                    </TableCell>}
                    {visibleColumns.stock && <TableCell className="text-center p-4">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${
                        product.stock > 0 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {product.stock}
                      </span>
                    </TableCell>}
                    {visibleColumns.localidade && <TableCell className="text-center p-4 text-gray-900 dark:text-gray-100">{product.localidade}</TableCell>}
                    {visibleColumns.tipologia && <TableCell className="text-center p-4 text-gray-900 dark:text-gray-100">{product.tipologia}</TableCell>}
                    {visibleColumns.actions && <TableCell className="text-center p-4">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                          disabled={isUpdating}
                          className={`h-9 w-9 p-0 bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-200 transform hover:scale-105 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isUpdating ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                          ) : (
                            <Pencil1Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleShowNotes(product)}
                          className="h-9 w-9 p-0 bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-200 transform hover:scale-105"
                        >
                          <EyeOpenIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.ref)}
                          disabled={loadingStates[product.ref]}
                          className={`h-9 w-9 p-0 bg-slate-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 transform hover:scale-105 ${loadingStates[product.ref] ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {loadingStates[product.ref] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
                          ) : (
                            <TrashIcon className="h-4 w-4 text-red-500 hover:text-red-700" />
                          )}
                        </Button>
                      </div>
                    </TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 py-6 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            © 2025 BEZE Solutions. Todos os direitos reservados.
          </div>
        </footer>
      </div>

      {/* Updated pagination controls */}
      <div className="mt-6 flex justify-between items-center">
        <Button 
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
          disabled={currentPage === 1}
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-4 py-2.5 transition-all duration-300 transform hover:scale-105"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
          Anterior
        </Button>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Página {currentPage} de {totalPages}
        </span>
        <Button 
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} 
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-4 py-2.5 transition-all duration-300 transform hover:scale-105"
        >
          Próximo
          <FontAwesomeIcon icon={faChevronRight} />
        </Button>
      </div>

      {/* Notes Modal */}
      <Modal isOpen={notesModalOpen} onClose={handleCloseNotesModal}>
        <div className="divide-y divide-gray-100">
          <div className="px-6 py-4 flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">Notas</h2>
            {!editingNotes && (
              <Button 
                onClick={() => setEditingNotes(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
              >
                <FontAwesomeIcon icon={faEdit} />
              </Button>
            )}
          </div>
          <div className="p-6 space-y-4">
            {editingNotes ? (
              <textarea
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={notes || ''}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Adicione suas notas aqui..."
              />
            ) : (
              <p className="w-full p-4 bg-gray-50 rounded-xl min-h-[100px] text-gray-700">
                {notes || 'Sem Notas.'}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-4">
              {editingNotes ? (
                <>
                  <Button 
                    onClick={handleUpdateNotes}
                    className="bg-green-500 hover:bg-green-600 text-white transition-colors px-6"
                  >
                    Salvar
                  </Button>
                  <Button 
                    onClick={handleCloseNotesModal}
                    className="bg-gray-500 hover:bg-gray-600 text-white transition-colors px-6"
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleCloseNotesModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white transition-colors px-6"
                >
                  Fechar
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Product Modal - Redesigned */}
      <Modal isOpen={addProductModalOpen} onClose={() => setAddProductModalOpen(false)}>
        <div className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl overflow-hidden">
          {/* Header Section */}
          <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Adicionar Produto
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Preencha os detalhes abaixo para adicionar um novo produto
                </p>
              </div>
              <Button 
                onClick={() => setAddProductModalOpen(false)}
                className="h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-all duration-200 hover:scale-105"
              >
                <FontAwesomeIcon icon={faTimes} className="text-lg" />
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <div className="max-w-3xl mx-auto">
              <InventoryForm 
                selectedWarehouse={selectedWarehouse} 
                onSuccess={() => {
                  setAddProductModalOpen(false);
                  fetchProducts();
                }}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal isOpen={editModalOpen} onClose={handleCloseEditModal}>
        <div className="divide-y divide-gray-100">
          <div className="p-6">
            {editingProduct && (
              <EditProductForm 
                product={editingProduct} 
                onUpdate={handleUpdate} 
                onCancel={handleCloseEditModal}
                isLoading={isUpdating}
              />
            )}
          </div>
        </div>
      </Modal>

      {/* Deleted Products Modal */}
      <Modal 
        isOpen={deletedProductsModalOpen} 
        onClose={() => setDeletedProductsModalOpen(false)}
        isWide={true}
      >
        <div className="divide-y divide-gray-100">
          <div className="px-6 py-4 flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">Deleted Products</h2>
            <Button 
              onClick={() => setDeletedProductsModalOpen(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </Button>
          </div>
          <div className="p-6">
            <DeletedProducts />
          </div>
        </div>
      </Modal>

      {/* Column Selector Modal */}
      <Modal isOpen={showColumnSelector} onClose={() => setShowColumnSelector(false)}>
        <div className="p-6 space-y-6">
          <h2 className="text-xl font-semibold text-center">Selecione as Colunas</h2>
          <div className="flex justify-center gap-4 mb-6">
            <Button onClick={selectAllColumns} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2">Selecionar Todas</Button>
            <Button onClick={deselectAllColumns} className="bg-gray-600 hover:bg-gray-700 text-white rounded-full px-6 py-2">Remover Todas</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(visibleColumns).map((column) => (
              <div key={column} className="flex items-center">
                <input
                  type="checkbox"
                  checked={visibleColumns[column as keyof typeof visibleColumns]}
                  onChange={() => toggleColumnVisibility(column as keyof typeof visibleColumns)}
                  className="mr-2 accent-blue-600"
                />
                <label className="text-gray-700 dark:text-gray-300">{column.charAt(0).toUpperCase() + column.slice(1)}</label>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}

