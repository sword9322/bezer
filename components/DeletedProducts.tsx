'use client'

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getDeletedProducts, deleteProductFull, restoreProduct } from '@/app/actions';
import { Product } from '@/components/InventoryTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faTrash, faUndo } from '@fortawesome/free-solid-svg-icons';

export default function DeletedProducts() {
  const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchDeletedProducts();
  }, []);

  const fetchDeletedProducts = async () => {
    const result = await getDeletedProducts();
    setDeletedProducts(result);
  };

  const handleDelete = async (ref: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto permanentemente?')) {
      const result = await deleteProductFull(ref);
      if (result.success) {
        setDeletedProducts(prev => prev.filter(product => product.ref !== ref));
      }
    }
  };

  const handleRestore = async (ref: string) => {
    if (window.confirm('Deseja restaurar este produto para o inventário?')) {
      const result = await restoreProduct(ref);
      if (result.success) {
        setDeletedProducts(prev => prev.filter(product => product.ref !== ref));
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center whitespace-nowrap">Referência</TableHead>
            <TableHead className="text-center whitespace-nowrap">Imagem</TableHead>
            <TableHead className="text-center whitespace-nowrap">Altura</TableHead>
            <TableHead className="text-center whitespace-nowrap">Largura</TableHead>
            <TableHead className="text-center whitespace-nowrap">Marca</TableHead>
            <TableHead className="text-center whitespace-nowrap">Campanha</TableHead>
            <TableHead className="text-center whitespace-nowrap">Data</TableHead>
            <TableHead className="text-center whitespace-nowrap">Stock</TableHead>
            <TableHead className="text-center whitespace-nowrap">Localidade</TableHead>
            <TableHead className="text-center whitespace-nowrap">Tipologia</TableHead>
            <TableHead className="text-center whitespace-nowrap">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deletedProducts.map((product) => (
            <TableRow key={product.ref}>
              <TableCell className="text-center whitespace-nowrap">{product.ref}</TableCell>
              <TableCell className="text-center whitespace-nowrap">
                <Button onClick={() => window.open(product.image, '_blank')} className="mr-2">
                  <FontAwesomeIcon icon={faImage} />
                </Button>
              </TableCell>
              <TableCell className="text-center whitespace-nowrap">{product.height}</TableCell>
              <TableCell className="text-center whitespace-nowrap">{product.width}</TableCell>
              <TableCell className="text-center whitespace-nowrap">{product.brand}</TableCell>
              <TableCell className="text-center whitespace-nowrap">{product.campaign}</TableCell>
              <TableCell className="text-center whitespace-nowrap">{product.date}</TableCell>
              <TableCell className="text-center whitespace-nowrap">{product.stock}</TableCell>
              <TableCell className="text-center whitespace-nowrap">{product.localidade}</TableCell>
              <TableCell className="text-center whitespace-nowrap">{product.tipologia}</TableCell>
              <TableCell className="text-center whitespace-nowrap space-x-2">
                <Button 
                  onClick={() => handleRestore(product.ref)} 
                  className="bg-green-500 text-white hover:bg-green-600 transition duration-200 mr-2"
                >
                  <FontAwesomeIcon icon={faUndo} />
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDelete(product.ref)} 
                  className="bg-red-500 text-white hover:bg-red-600 transition duration-200"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
