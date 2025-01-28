'use client';

import BrandsTab from '@/components/settings/BrandsTab';
import TipologiasTab from '@/components/settings/TipologiasTab';
import RacksTab from '@/components/settings/RacksTab';
import UsersTab from '@/components/settings/UsersTab';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('brands');

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
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setActiveTab('brands')}
            className={`${
              activeTab === 'brands'
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-white hover:bg-slate-50 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
            } transition-colors duration-200`}
          >
            Marcas
          </Button>
          <Button
            onClick={() => setActiveTab('tipologias')}
            className={`${
              activeTab === 'tipologias'
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-white hover:bg-slate-50 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
            } transition-colors duration-200`}
          >
            Tipologias
          </Button>
          <Button
            onClick={() => setActiveTab('racks')}
            className={`${
              activeTab === 'racks'
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-white hover:bg-slate-50 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
            } transition-colors duration-200`}
          >
            Racks
          </Button>
          {isAdmin && (
            <Button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-white hover:bg-slate-50 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
              } transition-colors duration-200`}
            >
              Acesso de Usuários
            </Button>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
          {activeTab === 'brands' && <BrandsTab />}
          {activeTab === 'tipologias' && <TipologiasTab />}
          {activeTab === 'racks' && <RacksTab />}
          {activeTab === 'users' && isAdmin && <UsersTab />}
        </div>
      </div>
    </div>
  );
} 