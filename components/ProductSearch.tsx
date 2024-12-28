import React, { useState } from 'react';
import { Button } from '@/components/ui/button'; // Adjust based on your UI library
import { Input } from '@/components/ui/input'; // Ensure this import is correct
import { Label } from '@/components/ui/label'; // Ensure this import is correct
import { getProductByRef } from '@/app/actions'; // Ensure this function is defined and exported

const ProductSearch: React.FC = () => {
  const [ref, setRef] = useState('');
  const [product, setProduct] = useState<any>(null); // Use a specific type if available
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
    } catch (err) {
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
          <img src={product.image} alt={product.brand} className="mt-2 rounded-md" />
        </div>
      )}
    </div>
  );
};

export default ProductSearch;