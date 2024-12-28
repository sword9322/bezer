import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Product = {
  ref: string;
  image: string;
  height: number;
  width: number;
  brand: string;
  campaign: string;
  date: string;
  stock: number;
  localidade: string;
};

type EditProductFormProps = {
  product: Product;
  onUpdate: (updatedProduct: Product) => void;
  onCancel: () => void;
};

const EditProductForm: React.FC<EditProductFormProps> = ({ product, onUpdate, onCancel }) => {
  const [formData, setFormData] = React.useState<Product>(product);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold">Edit Product</h2>
      <div>
        <Label htmlFor="ref">Reference</Label>
        <Input id="ref" name="ref" value={formData.ref} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="brand">Brand</Label>
        <Input id="brand" name="brand" value={formData.brand} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="campaign">Campaign</Label>
        <Input id="campaign" name="campaign" value={formData.campaign} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="height">Height</Label>
        <Input id="height" name="height" type="number" value={formData.height} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="width">Width</Label>
        <Input id="width" name="width" type="number" value={formData.width} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="stock">Stock</Label>
        <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="localidade">Location</Label>
        <Input id="localidade" name="localidade" value={formData.localidade} onChange={handleChange} />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" onClick={onCancel} variant="outline">Cancel</Button>
        <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">Save</Button>
      </div>
    </form>
  );
};

export default EditProductForm;
