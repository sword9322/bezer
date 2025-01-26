'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchBrands, addBrand, deleteBrand, fetchTipologias, addTipologia, deleteTipologia, downloadBrands, downloadTipologias } from '@/app/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxes, faUsers, faDatabase, faCloud, faHome, faList, faDownload } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const [brands, setBrands] = useState<string[]>([]);
  const [newBrand, setNewBrand] = useState('');
  const [tipologias, setTipologias] = useState<string[]>([]);
  const [newTipologia, setNewTipologia] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBrands();
    loadTipologias();
  }, []);

  const loadBrands = async () => {
    const fetchedBrands = await fetchBrands();
    setBrands(fetchedBrands);
  };

  const loadTipologias = async () => {
    const fetchedTipologias = await fetchTipologias();
    setTipologias(fetchedTipologias);
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.trim()) return;

    setIsLoading(true);
    try {
      await addBrand(newBrand);
      setNewBrand('');
      await loadBrands();
    } catch (error) {
      console.error('Error adding brand:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTipologia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTipologia.trim()) return;

    setIsLoading(true);
    try {
      await addTipologia(newTipologia);
      setNewTipologia('');
      await loadTipologias();
    } catch (error) {
      console.error('Error adding tipologia:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBrand = async (brand: string) => {
    if (!confirm(`Are you sure you want to delete ${brand}?`)) return;

    setIsLoading(true);
    try {
      await deleteBrand(brand);
      await loadBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTipologia = async (tipologia: string) => {
    if (!confirm(`Are you sure you want to delete ${tipologia}?`)) return;

    setIsLoading(true);
    try {
      await deleteTipologia(tipologia);
      await loadTipologias();
    } catch (error) {
      console.error('Error deleting tipologia:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadBrands = async () => {
    const url = await downloadBrands();
    window.open(url, '_blank');
  };

  const handleDownloadTipologias = async () => {
    const url = await downloadTipologias();
    window.open(url, '_blank');
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl mt-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Link href="/">
          <Button className="bg-gray-500 hover:bg-gray-600">
            <FontAwesomeIcon icon={faHome} />
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="brands" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-100 p-2 rounded-lg">
          <TabsTrigger value="brands" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faBoxes} />
            Marcas
          </TabsTrigger>
          <TabsTrigger value="tipologias" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faList} />
            Tipologias
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
            <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Gestão de Marcas</CardTitle>
                <CardDescription>
                  Adicione ou remova marcas do sistema.
                </CardDescription>
              </div>
              <Button 
                onClick={handleDownloadBrands}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faDownload} />
                Exportar Marcas
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddBrand} className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="brand">Nova Marca</Label>
                  <Input
                    id="brand"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="Digite o nome da marca"
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="mt-7 md:mt-0" disabled={isLoading}>
                  Adicionar
                </Button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brands.map((brand) => (
                  <div
                    key={brand}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span>{brand}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteBrand(brand)}
                      disabled={isLoading}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tipologias">
          <Card>
            <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Gestão de Tipologias</CardTitle>
                <CardDescription>
                  Adicione ou remova tipologias do sistema.
                </CardDescription>
              </div>
              <Button 
                onClick={handleDownloadTipologias}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faDownload} />
                Exportar Tipologias
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTipologia} className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="tipologia">Nova Tipologia</Label>
                  <Input
                    id="tipologia"
                    value={newTipologia}
                    onChange={(e) => setNewTipologia(e.target.value)}
                    placeholder="Digite o nome da tipologia"
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="mt-7 md:mt-0" disabled={isLoading}>
                  Adicionar
                </Button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tipologias.map((tipologia) => (
                  <div
                    key={tipologia}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span>{tipologia}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTipologia(tipologia)}
                      disabled={isLoading}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
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