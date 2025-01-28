'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BrandsTab from '@/components/settings/BrandsTab';
import TipologiasTab from '@/components/settings/TipologiasTab';
import RacksTab from '@/components/settings/RacksTab';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    console.log('Current path:', pathname);
    console.log('Auth state:', { user, authLoading });

    if (!authLoading && !user) {
      console.log('No user found, redirecting to login');
      router.replace('/login');
      return;
    }

    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [user, authLoading, router, pathname]);

  // Show loading state while auth is initializing or page is loading
  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Carregando configurações...</p>
          <p className="mt-2 text-sm text-slate-500">{authLoading ? 'Verificando autenticação...' : 'Preparando página...'}</p>
        </div>
      </div>
    );
  }

  // If no user after loading, show error
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Acesso não autorizado</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  // Show settings page content
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configurações</h1>
        <Tabs defaultValue="brands" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="brands">Marcas</TabsTrigger>
            <TabsTrigger value="tipologias">Tipologias</TabsTrigger>
            <TabsTrigger value="racks">Racks</TabsTrigger>
          </TabsList>

          <TabsContent value="brands" className="mt-6">
            <BrandsTab />
          </TabsContent>

          <TabsContent value="tipologias" className="mt-6">
            <TipologiasTab />
          </TabsContent>

          <TabsContent value="racks" className="mt-6">
            <RacksTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 