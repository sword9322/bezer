'use client'

import InventoryForm from '@/components/InventoryForm'
import InventoryTable from '@/components/InventoryTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import dotenv from 'dotenv';
dotenv.config();

export default function Home() {
  const openGoogleSheet = () => {
    window.open(`https://docs.google.com/spreadsheets/d/1F0FmaEcFZhvlaQ3D4i22TJj_Q5ST4wJ6SqUcmds90no`, '_blank')
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Gestão de Inventário</h1>
      <Button onClick={openGoogleSheet} className="mb-4">Ver Planilha no Google Sheets</Button>
      <Tabs defaultValue="add" className="space-y-4">
        <TabsList>
          <TabsTrigger value="add">Adicionar Produto</TabsTrigger>
          <TabsTrigger value="view">Ver Inventário</TabsTrigger>
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
      </Tabs>
    </div>
  )
}

