'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getProducts, deleteProduct, updateProduct } from '@/app/actions'
import EditProductForm from '@/components/EditProductForm'

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
}

export default function InventoryTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [currentPage])

  const fetchProducts = async () => {
    const result = await getProducts(currentPage)
    setProducts(result.products)
    setTotalPages(result.totalPages)
  }

  const handleDelete = async (ref: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      await deleteProduct(ref)
      fetchProducts()
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
  }

  const handleUpdate = async (updatedProduct: Product) => {
    await updateProduct(updatedProduct)
    setEditingProduct(null)
    fetchProducts()
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Referência</TableHead>
            <TableHead>Imagem</TableHead>
            <TableHead>Altura</TableHead>
            <TableHead>Largura</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Campanha</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Localidade</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.ref}>
              <TableCell>{product.ref}</TableCell>
              <TableCell>
                <Button onClick={() => window.open(product.image, '_blank')}>
                  Ver Imagem
                </Button>
              </TableCell>
              <TableCell>{product.height}</TableCell>
              <TableCell>{product.width}</TableCell>
              <TableCell>{product.brand}</TableCell>
              <TableCell>{product.campaign}</TableCell>
              <TableCell>{product.date}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{product.localidade}</TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(product)}>Editar</Button>
                <Button variant="destructive" onClick={() => handleDelete(product.ref)}>Excluir</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editingProduct && (
        <EditProductForm product={editingProduct} onUpdate={handleUpdate} onCancel={() => setEditingProduct(null)} />
      )}
      <div>
        <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          Anterior
        </Button>
        <span>Página {currentPage} de {totalPages}</span>
        <Button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
          Próximo
        </Button>
      </div>
    </div>
  )
}

