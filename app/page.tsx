'use client'

import Head from 'next/head';
import InventoryForm from '@/components/InventoryForm'
import DeletedProducts from '@/components/DeletedProducts'
import InventoryTable from '@/components/InventoryTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import dotenv from 'dotenv';

dotenv.config();

export default function Home() {

  return (
    <>
      <Head>
        <title>My Custom Title</title>
      </Head>
      <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Gestão de Inventário</h1>
        <Tabs defaultValue="add" className="space-y-4">
          <TabsList>
            <TabsTrigger value="add" className="text-lg font-semibold">Adicionar Produto</TabsTrigger>
            <TabsTrigger value="view" className="text-lg font-semibold">Ver Inventário</TabsTrigger>
            <TabsTrigger value="deleted" className="text-lg font-semibold">Produtos Eliminados</TabsTrigger>
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
                <CardDescription>Visualize e edite os produtos no inventário.</CardDescription>
              </CardHeader>
              <CardContent>
                <InventoryTable />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="deleted">
            <Card>
              <CardHeader>
                <CardTitle>Produtos Eliminados</CardTitle>
                <CardDescription>Visualize e edite os produtos no inventário eliminados.</CardDescription>
              </CardHeader>
              <CardContent>
                <DeletedProducts />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

