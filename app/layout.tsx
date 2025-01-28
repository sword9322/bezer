import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bezer - Gestão de Inventário",
  description: "Sistema de gestão de inventário para sua empresa",
  metadataBase: new URL('https://bezer.onrender.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        <AuthProvider>
          <main className="min-h-screen bg-white dark:bg-gray-900">
            {children}
          </main>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
