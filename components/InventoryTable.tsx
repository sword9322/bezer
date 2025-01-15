'use client'

import { useState, useEffect, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getProducts, deleteProduct, updateProduct, downloadSheet } from '@/app/actions'
import EditProductForm from '@/components/EditProductForm'
import Modal from '@/components/modals'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEdit, faImage, faBoxes, faBoxOpen, faPlus, faTrashRestore, faFilter, faChevronLeft, faChevronRight, faTimes, faCog } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import GoogleDriveIcon from '@/components/icons/google-drive.png';
import GoogleSheetsIcon from '@/components/icons/sheets.png';
import InventoryForm from '@/components/InventoryForm';
import DeletedProducts from '@/components/DeletedProducts';
import Link from 'next/link';
import { Pencil1Icon, TrashIcon, EyeOpenIcon } from '@radix-ui/react-icons';



export type Product = {
  ref: string
  image: string
  height: number
  width: number
  brand: string
  campaign: string
  date: string
  stock: number
  localidade: string
  tipologia: string
  notes: string
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

  const fetchProducts = useCallback(async () => {
    const result = await getProducts(currentPage);
    const productsWithNotes = result.products.map((product) => ({
      ...product,
      notes: product.notes || '',
    }));
    setProducts(productsWithNotes);
    setTotalPages(result.totalPages);
  }, [currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (ref: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      const result = await deleteProduct(ref);
      if (result.success) {
        setProducts(prev => prev.filter(product => product.ref !== ref));
      } else {
        console.error('Erro ao excluir produto:', result.error);
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingProduct(null);
  };

  const handleShowNotes = (product: Product) => {
    setNotes(product.notes);
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
    await updateProduct(updatedProduct);
    setEditingProduct(null);
    setEditModalOpen(false);
    fetchProducts();
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Products Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Produtos</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{products.length}</h3>
                </div>
                <div className="p-4 bg-blue-500 bg-opacity-10 rounded-2xl">
                  <FontAwesomeIcon icon={faBoxes} className="text-2xl text-blue-500" />
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Stock Total</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {products.reduce((total, product) => total + product.stock, 0)}
                  </h3>
                </div>
                <div className="p-4 bg-green-500 bg-opacity-10 rounded-2xl">
                  <FontAwesomeIcon icon={faBoxOpen} className="text-2xl text-green-500" />
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full">
                  <div className="h-2 bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-6 space-y-4">
              <Button 
                onClick={() => setAddProductModalOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-medium shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Adicionar Produto
              </Button>
              
              <Button 
                onClick={() => setDeletedProductsModalOpen(true)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-xl py-3 font-medium shadow-lg hover:shadow-gray-500/30 transition-all duration-300"
              >
                <FontAwesomeIcon icon={faTrashRestore} className="mr-2" />
                Produtos Eliminados
              </Button>
              
              <Link href="/settings" className="w-full block">
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3 font-medium shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
                >
                  <FontAwesomeIcon icon={faCog} className="mr-2" />
                  Definições
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <Button 
            onClick={() => setShowFilters(prev => !prev)}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl px-4 py-2.5 transition-all duration-300"
          >
            <FontAwesomeIcon icon={faFilter} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Button 
                onClick={openGoogleSheet} 
                className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl p-2.5 transition-all duration-300"
              >
                <Image src={GoogleSheetsIcon} alt="Google Sheets" width={24} height={24} className="rounded" />
              </Button>
              <Button 
                onClick={openGoogleDrive} 
                className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl p-2.5 transition-all duration-300"
              >
                <Image src={GoogleDriveIcon} alt="Google Drive" width={24} height={24} className="rounded" />
              </Button>
            </div>
            <Button 
              onClick={handleDownload} 
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2.5 shadow-lg hover:shadow-green-500/30 transition-all duration-300"
            >
              <FontAwesomeIcon icon={faDownload} />
              <span className="hidden md:inline">Exportar</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                { name: 'ref', placeholder: 'Ref' },
                { name: 'brand', placeholder: 'Marca' },
                { name: 'campaign', placeholder: 'Campanha' },
                { name: 'date', placeholder: 'Data' },
                { name: 'stock', placeholder: 'Stock' },
                { name: 'localidade', placeholder: 'Localização' },
                { name: 'tipologia', placeholder: 'Tipo' }
              ].map((filter) => (
                <input
                  key={filter.name}
                  name={filter.name}
                  placeholder={filter.placeholder}
                  value={filters[filter.name as keyof typeof filters]}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              ))}
            </div>
          </div>
        )}

        {/* Main Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">REF</TableHead>
                  <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Image</TableHead>
                  <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Altura</TableHead>
                  <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Largura</TableHead>
                  <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Marca</TableHead>
                  <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Campanha</TableHead>
                  <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Data</TableHead>
                  <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Stock</TableHead>
                  <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Localização</TableHead>
                  <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Tipo</TableHead>
                  <TableHead className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow 
                    key={product.ref}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    <TableCell className="text-center p-4 text-gray-900 dark:text-gray-100">{product.ref}</TableCell>
                    <TableCell className="text-center p-4">
                      <Button 
                        onClick={() => window.open(product.image, '_blank')} 
                        className="h-9 w-9 p-0 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200"
                      >
                        <FontAwesomeIcon icon={faImage} className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-center p-4 text-gray-900 dark:text-gray-100">{product.height}</TableCell>
                    <TableCell className="text-center p-4 text-gray-900 dark:text-gray-100">{product.width}</TableCell>
                    <TableCell className="text-center p-4 text-gray-900 dark:text-gray-100">{product.brand}</TableCell>
                    <TableCell className="text-center p-4 text-gray-900 dark:text-gray-100">{product.campaign}</TableCell>
                    <TableCell className="text-center p-4 text-gray-900 dark:text-gray-100">
                      {new Date(product.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-center p-4">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${
                        product.stock > 0 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-center p-4 text-gray-900 dark:text-gray-100">{product.localidade}</TableCell>
                    <TableCell className="text-center p-4 text-gray-900 dark:text-gray-100">{product.tipologia}</TableCell>
                    <TableCell className="text-center p-4">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                          className="h-9 w-9 p-0 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200"
                        >
                          <Pencil1Icon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleShowNotes(product)}
                          className="h-9 w-9 p-0 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200"
                        >
                          <EyeOpenIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.ref)}
                          className="h-9 w-9 p-0 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200 text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
          <Button 
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
            disabled={currentPage === 1}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-4 py-2.5 transition-all duration-300"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
            Previous
          </Button>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <Button 
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} 
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-4 py-2.5 transition-all duration-300"
          >
            Next
            <FontAwesomeIcon icon={faChevronRight} />
          </Button>
        </div>

        {/* Notes Modal */}
        <Modal isOpen={notesModalOpen} onClose={handleCloseNotesModal}>
          <div className="divide-y divide-gray-100">
            <div className="px-6 py-4 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">Notes</h2>
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
                  placeholder="Add your notes here..."
                />
              ) : (
                <p className="w-full p-4 bg-gray-50 rounded-xl min-h-[100px] text-gray-700">
                  {notes || 'No notes available for this product.'}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-4">
                {editingNotes ? (
                  <>
                    <Button 
                      onClick={handleUpdateNotes}
                      className="bg-green-500 hover:bg-green-600 text-white transition-colors px-6"
                    >
                      Save
                    </Button>
                    <Button 
                      onClick={handleCloseNotesModal}
                      className="bg-gray-500 hover:bg-gray-600 text-white transition-colors px-6"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleCloseNotesModal}
                    className="bg-gray-500 hover:bg-gray-600 text-white transition-colors px-6"
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>

        {/* Add Product Modal */}
        <Modal isOpen={addProductModalOpen} onClose={() => setAddProductModalOpen(false)}>
          <div className="divide-y divide-gray-100">
            <div className="px-6 py-4 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">Add New Product</h2>
              <Button 
                onClick={() => setAddProductModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </Button>
            </div>
            <div className="p-6">
              <InventoryForm />
            </div>
          </div>
        </Modal>

        {/* Edit Product Modal */}
        <Modal isOpen={editModalOpen} onClose={handleCloseEditModal}>
          <div className="divide-y divide-gray-100">
            <div className="px-6 py-4 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">Edit Product</h2>
              <Button 
                onClick={handleCloseEditModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </Button>
            </div>
            <div className="p-6">
              {editingProduct && (
                <EditProductForm product={editingProduct} onUpdate={handleUpdate} onCancel={handleCloseEditModal} />
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
      </div>
    </div>
  )
}

