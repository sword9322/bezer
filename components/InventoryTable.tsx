'use client'

import { useState, useEffect, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getProducts, deleteProduct, updateProduct, downloadSheet, appendToDeletedProducts } from '@/app/actions'
import EditProductForm from '@/components/EditProductForm'
import Modal from '@/components/modals'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

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
}

export default function InventoryTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    ref: '',
    brand: '',
    campaign: '',
    date: '',
    stock: '',
    localidade: '',
    tipologia: '',
  });

  const fetchProducts = useCallback(async () => {
    const result = await getProducts(currentPage);
    setProducts(result.products);
    setTotalPages(result.totalPages);
  }, [currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (ref: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      const productToDelete = products.find(product => product.ref === ref) as Product;
      
      if (productToDelete) {
        await deleteProduct(ref);
        await appendToDeletedProducts([
          productToDelete.ref,
          productToDelete.image,
          productToDelete.height,
          productToDelete.width,
          productToDelete.brand,
          productToDelete.campaign,
          productToDelete.date,
          productToDelete.stock,
          productToDelete.localidade,
          productToDelete.tipologia,
        ]);
        fetchProducts();
      } else {
        console.error('Produto não encontrado');
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleUpdate = async (updatedProduct: Product) => {
    await updateProduct(updatedProduct);
    setEditingProduct(null);
    setIsModalOpen(false);
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

  return (
    <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
      <div className="flex justify-between mb-4">
        <Button onClick={() => setShowFilters(prev => !prev)}>
          {showFilters ? 'Esconder Filtros' : 'Mostrar Filtros'}
        </Button>
        <Button onClick={handleDownload} className="bg-green-500 text-white hover:bg-green-600">
          <FontAwesomeIcon icon={faDownload} className="mr-2" />
          Download
        </Button>
      </div>
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            name="ref"
            placeholder="Ref"
            value={filters.ref}
            onChange={handleFilterChange}
            className="border rounded p-1 text-sm text-center w-36"
          />
          <input
            name="brand"
            placeholder="Marca"
            value={filters.brand}
            onChange={handleFilterChange}
            className="border rounded p-1 text-sm text-center w-60"
          />
          <input
            name="campaign"
            placeholder="Campanha"
            value={filters.campaign}
            onChange={handleFilterChange}
            className="border rounded p-1 text-sm text-center w-60"
          />
          <input
            name="date"
            placeholder="Data"
            value={filters.date}
            onChange={handleFilterChange}
            className="border rounded p-1 text-sm text-center w-60"
          />
          <input
            name="stock"
            placeholder="Stock"
            value={filters.stock}
            onChange={handleFilterChange}
            className="border rounded p-1 text-sm text-center w-15"
          />
          <input
            name="localidade"
            placeholder="Localidade"
            value={filters.localidade}
            onChange={handleFilterChange}
            className="border rounded p-1 text-sm text-center w-15"
          />
          <input
            name="tipologia"
            placeholder="Tipologia"
            value={filters.tipologia}
            onChange={handleFilterChange}
            className="border rounded p-1 text-sm text-center w-40"
          />
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center font-bold">Referência</TableHead>
            <TableHead className="text-center font-bold">Imagem</TableHead>
            <TableHead className="text-center font-bold">Altura</TableHead>
            <TableHead className="text-center font-bold">Largura</TableHead>
            <TableHead className="text-center font-bold">Marca</TableHead>
            <TableHead className="text-center font-bold">Campanha</TableHead>
            <TableHead className="text-center font-bold">Data</TableHead>
            <TableHead className="text-center font-bold">Stock</TableHead>
            <TableHead className="text-center font-bold">Localidade</TableHead>
            <TableHead className="text-center font-bold">Tipologia</TableHead>
            <TableHead className="text-center font-bold">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product) => (
            <TableRow key={product.ref}>
              <TableCell className="text-center">{product.ref}</TableCell>
              <TableCell className="text-center">
                <Button onClick={() => window.open(product.image, '_blank')} className="mr-2">
                  Imagem
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
                <Button variant="destructive" onClick={() => handleDelete(product.ref)} className="bg-red-500 text-white hover:bg-red-600 transition duration-200">
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        {editingProduct && (
          <EditProductForm product={editingProduct} onUpdate={handleUpdate} onCancel={handleCloseModal} />
        )}
      </Modal>
      <div className="mt-4 flex justify-between">
        <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="mr-2">
          Anterior
        </Button>
        <span>Página {currentPage} de {totalPages}</span>
        <Button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="ml-2">
          Próximo
        </Button>
      </div>
    </div>
  )
}

