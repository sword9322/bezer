'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchBrands, addBrand, removeBrand } from '@/app/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faBoxes, faUsers, faDatabase, faCloud, faHome } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function SettingsPage() {
  const [brands, setBrands] = useState<string[]>([]);
  const [newBrand, setNewBrand] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    const loadedBrands = await fetchBrands();
    setBrands(loadedBrands);
  };

  const handleAddBrand = async () => {
    if (!newBrand.trim()) return;
    setLoading(true);
    await addBrand(newBrand);
    await loadBrands();
    setNewBrand('');
    setLoading(false);
  };

  const handleRemoveBrand = async (brand: string) => {
    if (window.confirm('Tem certeza que deseja remover esta marca?')) {
      await removeBrand(brand);
      setBrands(prev => prev.filter(b => b !== brand));
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl mt-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Link href="/">
          <Button className="bg-gray-500 hover:bg-gray-600">
            <FontAwesomeIcon icon={faHome} />
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="brands" className="space-y-6">
        <TabsList className="grid grid-cols-4 gap-4 bg-gray-100 p-2 rounded-lg">
          <TabsTrigger value="brands" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faBoxes} />
            Marcas
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUsers} />
            User Access
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faDatabase} />
            Database
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCloud} />
            Backup & Restore
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brands">
          <Card>
            <CardHeader>
              <CardTitle>Marcas
              </CardTitle>
              <CardDescription>
                Adiciona ou remove marcas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    type="text"
                    placeholder="Adicionar nova marca..."
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button 
                    onClick={handleAddBrand} 
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Adicionar Marca
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {brands.map((brand) => (
                    <Card key={brand} className="p-4 flex justify-between items-center">
                      <span>{brand}</span>
                      <Button 
                        variant="ghost" 
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleRemoveBrand(brand)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Access Management</CardTitle>
              <CardDescription>
                Manage user permissions and access levels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-gray-500 italic">
                User management features coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Settings</CardTitle>
              <CardDescription>
                Configure database connections and maintenance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-gray-500 italic">
                Database management features coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>
                Manage system backups and restore points.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-gray-500 italic">
                Backup and restore features coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 