'use client'

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getDeletedProducts } from '@/app/actions';
import { Product } from '@/components/InventoryTable';

export default function DeletedProducts() {
  const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchDeletedProducts();
  }, []);

  const fetchDeletedProducts = async () => {
    const result = await getDeletedProducts();
    setDeletedProducts(result);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">Produtos Excluídos</h2>
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
            <TableHead>Stock</TableHead>
            <TableHead>Localidade</TableHead>
            <TableHead>Tipologia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deletedProducts.map((product) => (
            <TableRow key={product.ref}>
              <TableCell>{product.ref}</TableCell>
              <TableCell>
                <Button onClick={() => window.open(product.image, '_blank')} className="mr-2">
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
              <TableCell>{product.tipologia}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
