import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Product } from '@/components/InventoryTable';

type EditProductFormProps = {
  product: Product;
  onUpdate: (updatedProduct: Product) => Promise<void>;
  onCancel: () => void;
};

const EditProductForm: React.FC<EditProductFormProps> = ({ product, onUpdate, onCancel }) => {
  const [formData, setFormData] = React.useState<Product>(product);
  const [customTipologia, setCustomTipologia] = React.useState('');
  const [customTipologiaInput, setCustomTipologiaInput] = React.useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-lg flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4 text-center">Edit Product</h2>
      <div className="w-full">
        <Label htmlFor="ref">Reference</Label>
        <Input id="ref" name="ref" value={formData.ref} onChange={handleChange} className="rounded-md shadow-sm w-full" />
      </div>
      <div className="w-full">
        <Label htmlFor="brand">Marca</Label>
        <select id="brand" name="brand" value={formData.brand} onChange={handleChange} className="border rounded p-1 w-full">
          <option value="">Selecione uma marca</option>
          {[
            "DIOR",
            "Estee Lauder",
            "Clinique",
            "Prada",
            "Kiehl's",
            "YSL",
            "Lancôme",
            "Polo Ralph Lauren",
            "Mugler",
            "Armani",
            "Azzaro",
            "Biotherm",
            "Clarins",
            "My Blend"
          ].map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>
      <div className="w-full">
        <Label htmlFor="campaign">Campaign</Label>
        <Input id="campaign" name="campaign" value={formData.campaign} onChange={handleChange} className="rounded-md shadow-sm w-full" />
      </div>
      <div className="w-full">
        <Label htmlFor="height">Height</Label>
        <Input id="height" name="height" type="number" value={formData.height} onChange={handleChange} className="w-full" />
      </div>
      <div className="w-full">
        <Label htmlFor="width">Width</Label>
        <Input id="width" name="width" type="number" value={formData.width} onChange={handleChange} className="w-full" />
      </div>
      <div className="w-full">
        <Label htmlFor="stock">Stock</Label>
        <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} className="w-full" />
      </div>
      <div className="w-full">
        <Label htmlFor="localidade">Localidade</Label>
        <select id="localidade" name="localidade" value={formData.localidade} onChange={handleChange} className="border rounded p-1 w-full">
          <option value="">Selecione uma localidade</option>
          {["R1", "N1", "N2", "R2", "N3", "N4", "R3", "N5", "N6", "R4", "N7", "N8", "R5", "N9", "N10", "R6", "N11", "N12", "R7", "N13", "N14", "R8", "N15", "N16", "R9", "N17", "N18", "R10", "N19", "N20", "R11", "N21", "N22", "R12", "N23", "N24", "R13", "N25", "N26", "R14", "N27", "N28", "R15", "N29", "N30", "R16", "N31", "N32", "R17", "N33", "N34", "R18", "N35", "N36"].map((localidade) => (
            <option key={localidade} value={localidade}>{localidade}</option>
          ))}
        </select>
      </div>
      <div className="w-full">
        <Label htmlFor="tipologia">Tipologia</Label>
        <select
          id="tipologia"
          name="tipologia"
          value={formData.tipologia}
          onChange={(e) => {
            const selectedValue = e.target.value;
            if (selectedValue === 'outro') {
              setCustomTipologia('outro');
              setCustomTipologiaInput('');
            } else {
              setCustomTipologia(selectedValue);
              setCustomTipologiaInput('');
            }
            handleChange(e);
          }}
          className="border rounded p-1 w-full"
        >
          <option value="">Selecione uma opção</option>
          <option value="consola">Consola</option>
          <option value="coluna">Coluna</option>
          <option value="parede pódio">Parede Pódio</option>
          <option value="parede mini-pódio">Parede Mini-Pódio</option>
          <option value="canoppy">Canoppy</option>
          <option value="estrutura">Estrutura</option>
          <option value="cadeira">Cadeira</option>
          <option value="banco">Banco</option>
          <option value="outro">Outro (com descrição)</option>
        </select>
        {customTipologia === 'outro' && (
          <Input
            type="text"
            placeholder="Digite sua descrição"
            value={customTipologiaInput}
            onChange={(e) => setCustomTipologiaInput(e.target.value)}
            className="border rounded p-2 m-2 w-full"
          />
        )}
      </div>
      <div className="flex justify-center space-x-2 w-full">
        <Button type="button" onClick={onCancel} variant="outline" className="rounded-md">Cancel</Button>
        <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600 rounded-md">Save</Button>
      </div>
    </form>
  );
};

export default EditProductForm;
