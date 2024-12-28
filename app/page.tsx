'use client'

import InventoryForm from '@/components/InventoryForm'
import InventoryTable from '@/components/InventoryTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import dotenv from 'dotenv';
import ProductSearch from '@/components/ProductSearch';
dotenv.config();

export default function Home() {
  const openGoogleSheet = () => {
    window.open(`https://docs.google.com/spreadsheets/d/1F0FmaEcFZhvlaQ3D4i22TJj_Q5ST4wJ6SqUcmds90no`, '_blank')
  }

  const openGoogleDrive = () => {
    window.open(`https://drive.google.com/drive/u/2/folders/1jC__wec1icenm-UjqaCqU1EVEEg5Pawv`, '_blank')
  }

  return (
    <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Gestão de Inventário</h1>
      <div className="flex justify-center space-x-4 mb-6">
        <Button onClick={openGoogleSheet} className="bg-blue-500 text-white hover:bg-blue-600 transition duration-200">Ver Google Sheets</Button>
        <Button onClick={openGoogleDrive} className="bg-green-500 text-white hover:bg-green-600 transition duration-200">Ver Google Drive</Button>
      </div>
      <Tabs defaultValue="add" className="space-y-4">
        <TabsList>
          <TabsTrigger value="add" className="text-lg font-semibold">Adicionar Produto</TabsTrigger>
          <TabsTrigger value="view" className="text-lg font-semibold">Ver Inventário</TabsTrigger>
          <TabsTrigger value="search" className="text-lg font-semibold">Procurar Produto</TabsTrigger>
        </TabsList>
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Produto</CardTitle>
              <CardDescription>Preencha os detalhes do produto para adicioná-lo ao inventário.</CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="view">
          <Card>
            <CardHeader>
              <CardTitle>Inventário Atual</CardTitle>
              <CardDescription>Visualize e gerencie os produtos no inventário.</CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Procurar Produto</CardTitle>
              <CardDescription>Pesquise um produto pelo código de referência.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductSearch />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

