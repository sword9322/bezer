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
        <InventoryTable />
        <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

