'use client'

import { useState, useEffect, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getProducts, deleteProduct, updateProduct, downloadSheet } from '@/app/actions'
import EditProductForm from '@/components/EditProductForm'
import Modal from '@/components/modals'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEdit, faTrash, faImage, faEye, faBoxes, faBoxOpen, faPlus, faTrashRestore, faFilter, faChevronLeft, faChevronRight, faTimes, faCog, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import GoogleDriveIcon from '@/components/icons/google-drive.png';
import GoogleSheetsIcon from '@/components/icons/sheets.png';
import { Card, CardContent } from '@/components/ui/card';
import InventoryForm from '@/components/InventoryForm';
import DeletedProducts from '@/components/DeletedProducts';
import Link from 'next/link';



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
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

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

  const handleSort = (key: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedProducts = (products: Product[]) => {
    if (!sortConfig.key) return products;

    return [...products].sort((a, b) => {
      if (a[sortConfig.key!] < b[sortConfig.key!]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key!] > b[sortConfig.key!]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedAndFilteredProducts = getSortedProducts(filteredProducts);

  return (
    <div className="container mx-auto p-7 max-w-7xl">
      {/* Statistics and Action Buttons Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-75">Total Products</p>
                <h3 className="text-4xl font-bold mt-1">{products.length}</h3>
              </div>
              <div className="p-3 bg-blue-400 bg-opacity-40 rounded-full">
                <FontAwesomeIcon icon={faBoxes} className="text-2xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-75">Total Stock</p>
                <h3 className="text-4xl font-bold mt-1">
                  {products.reduce((total, product) => total + product.stock, 0)}
                </h3>
              </div>
              <div className="p-3 bg-green-400 bg-opacity-40 rounded-full">
                <FontAwesomeIcon icon={faBoxOpen} className="text-2xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Button 
            onClick={() => setAddProductModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-all transform hover:scale-105"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xl" />
            <span className="font-semibold">Adicionar Produto</span>
          </Button>
          <Button 
            onClick={() => setDeletedProductsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-lg transition-all transform hover:scale-105"
          >
            <FontAwesomeIcon icon={faTrashRestore} className="text-xl" />
            <span className="font-semibold">Produtos Eliminados</span>
          </Button>
          <Link href="/settings" className="w-full">
            <Button 
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-all transform hover:scale-105"
            >
              <FontAwesomeIcon icon={faCog} className="text-xl" />
              <span className="font-semibold">Definições</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <Button 
          onClick={() => setShowFilters(prev => !prev)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <FontAwesomeIcon icon={faFilter} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
        <div className="flex items-center gap-2">
          <div className='flex gap-2'>
            <Button onClick={openGoogleSheet} className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50">
              <Image src={GoogleSheetsIcon} alt="Google Sheets" width={20} height={20} />
            </Button>
            <Button onClick={openGoogleDrive} className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50">
              <Image src={GoogleDriveIcon} alt="Google Drive" width={20} height={20} />
            </Button>
          </div>
          <Button onClick={handleDownload} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white">
            <FontAwesomeIcon icon={faDownload} />
            <span className="hidden md:inline">Download</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <input
            name="ref"
            placeholder="Ref"
            value={filters.ref}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            name="brand"
            placeholder="Marca"
            value={filters.brand}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            name="campaign"
            placeholder="Campanha"
            value={filters.campaign}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            name="date"
            placeholder="Data"
            value={filters.date}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            name="stock"
            placeholder="Stock"
            value={filters.stock}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            name="localidade"
            placeholder="Localização"
            value={filters.localidade}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            name="tipologia"
            placeholder="Tipo"
            value={filters.tipologia}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="text-center font-bold cursor-pointer hover:bg-gray-50 group"
                onClick={() => handleSort('ref')}
              >
                <div className="flex items-center justify-center gap-2">
                  REF
                  <FontAwesomeIcon 
                    icon={sortConfig.key === 'ref' 
                      ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown)
                      : faSort
                    } 
                    className={sortConfig.key === 'ref' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}
                  />
                </div>
              </TableHead>
              <TableHead className="text-center font-bold">Image</TableHead>
              <TableHead 
                className="text-center font-bold cursor-pointer hover:bg-gray-50 group"
                onClick={() => handleSort('height')}
              >
                <div className="flex items-center justify-center gap-2">
                  Altura
                  <FontAwesomeIcon 
                    icon={sortConfig.key === 'height' 
                      ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown)
                      : faSort
                    } 
                    className={sortConfig.key === 'height' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}
                  />
                </div>
              </TableHead>
              <TableHead 
                className="text-center font-bold cursor-pointer hover:bg-gray-50 group"
                onClick={() => handleSort('width')}
              >
                <div className="flex items-center justify-center gap-2">
                  Largura
                  <FontAwesomeIcon 
                    icon={sortConfig.key === 'width' 
                      ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown)
                      : faSort
                    } 
                    className={sortConfig.key === 'width' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}
                  />
                </div>
              </TableHead>
              <TableHead 
                className="text-center font-bold cursor-pointer hover:bg-gray-50 group"
                onClick={() => handleSort('brand')}
              >
                <div className="flex items-center justify-center gap-2">
                  Marca
                  <FontAwesomeIcon 
                    icon={sortConfig.key === 'brand' 
                      ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown)
                      : faSort
                    } 
                    className={sortConfig.key === 'brand' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}
                  />
                </div>
              </TableHead>
              <TableHead 
                className="text-center font-bold cursor-pointer hover:bg-gray-50 group"
                onClick={() => handleSort('campaign')}
              >
                <div className="flex items-center justify-center gap-2">
                  Campanha
                  <FontAwesomeIcon 
                    icon={sortConfig.key === 'campaign' 
                      ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown)
                      : faSort
                    } 
                    className={sortConfig.key === 'campaign' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}
                  />
                </div>
              </TableHead>
              <TableHead 
                className="text-center font-bold cursor-pointer hover:bg-gray-50 group"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center justify-center gap-2">
                  Data
                  <FontAwesomeIcon 
                    icon={sortConfig.key === 'date' 
                      ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown)
                      : faSort
                    } 
                    className={sortConfig.key === 'date' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}
                  />
                </div>
              </TableHead>
              <TableHead 
                className="text-center font-bold cursor-pointer hover:bg-gray-50 group"
                onClick={() => handleSort('stock')}
              >
                <div className="flex items-center justify-center gap-2">
                  Stock
                  <FontAwesomeIcon 
                    icon={sortConfig.key === 'stock' 
                      ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown)
                      : faSort
                    } 
                    className={sortConfig.key === 'stock' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}
                  />
                </div>
              </TableHead>
              <TableHead 
                className="text-center font-bold cursor-pointer hover:bg-gray-50 group"
                onClick={() => handleSort('localidade')}
              >
                <div className="flex items-center justify-center gap-2">
                  Localização
                  <FontAwesomeIcon 
                    icon={sortConfig.key === 'localidade' 
                      ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown)
                      : faSort
                    } 
                    className={sortConfig.key === 'localidade' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}
                  />
                </div>
              </TableHead>
              <TableHead 
                className="text-center font-bold cursor-pointer hover:bg-gray-50 group"
                onClick={() => handleSort('tipologia')}
              >
                <div className="flex items-center justify-center gap-2">
                  Tipo
                  <FontAwesomeIcon 
                    icon={sortConfig.key === 'tipologia' 
                      ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown)
                      : faSort
                    } 
                    className={sortConfig.key === 'tipologia' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}
                  />
                </div>
              </TableHead>
              <TableHead className="text-center font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredProducts.map((product) => (
              <TableRow key={product.ref}>
                <TableCell className="text-center">{product.ref}</TableCell>
                <TableCell className="text-center">
                  <Button onClick={() => window.open(product.image, '_blank')} className="mr-2">
                    <FontAwesomeIcon icon={faImage} />
                  </Button>
                </TableCell>
                <TableCell className="text-center">{product.height}</TableCell>
                <TableCell className="text-center">{product.width}</TableCell>
                <TableCell className="text-center">{product.brand}</TableCell>
                <TableCell className="text-center">{product.campaign}</TableCell>
                <TableCell className="text-center">{product.date}</TableCell>
                <TableCell className="text-center">{product.stock}</TableCell>
                <TableCell className="text-center">{product.localidade}</TableCell>
                <TableCell className="text-center">{product.tipologia}</TableCell>
                <TableCell className="text-center">
                  <Button onClick={() => handleEdit(product)} className="bg-blue-500 text-white hover:bg-blue-600 transition duration-200 mr-2">
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  <Button onClick={() => handleShowNotes(product)} className="bg-green-500 text-white hover:bg-green-600 transition duration-200 mr-2">
                    <FontAwesomeIcon icon={faEye} />
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(product.ref)} className="bg-red-500 text-white hover:bg-red-600 transition duration-200">
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <Button 
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
          disabled={currentPage === 1}
          className="flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
          Previous
        </Button>
        <span className="text-sm font-medium text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <Button 
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} 
          disabled={currentPage === totalPages}
          className="flex items-center gap-2"
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
  )
}

