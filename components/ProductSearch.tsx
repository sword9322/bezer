import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getProductByRef } from '@/app/actions';
import Image from 'next/image';

type Product = {
  ref: string;
  image: string;
  height: number;
  width: number;
  brand: string;
  campaign: string;
  stock: number;
  localidade: string;
};

const ProductSearch: React.FC = () => {
  const [ref, setRef] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setError('');
    try {
      const result = await getProductByRef(ref);
      if (result) {
        setProduct(result);
      } else {
        setError('Product not found');
      }
    } catch {
      setError('Error fetching product');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <Label htmlFor="ref">REF do Produto</Label>
        <Input
          id="ref"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          className="rounded-md shadow-sm"
        />
      </div>
      <Button onClick={handleSearch} className="bg-blue-500 text-white hover:bg-blue-600">
        Procurar
      </Button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {product && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">{product.brand}</h3>
          <p>Campaign: {product.campaign}</p>
          <p>Height: {product.height}</p>
          <p>Width: {product.width}</p>
          <p>Stock: {product.stock}</p>
          <p>Location: {product.localidade}</p>
          <Image src={product.image} alt={product.brand} width={500} height={300} className="mt-2 rounded-md" />
        </div>
      )}
    </div>
  );
};

export default ProductSearch;