'use client'

import Head from 'next/head';
import InventoryTable from '@/components/InventoryTable'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dotenv from 'dotenv';

dotenv.config();

export default function Home() {
  return (
    <>
      <Head>
        <title>My Custom Title</title>
      </Head>
      <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-md mt-10">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-6xl font-bold text-gray-800 mb-4 mt-5">Gestão de Inventário</h1>
        </div>
        <InventoryTable />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </>
  )
}

