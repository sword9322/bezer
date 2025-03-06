import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

export async function GET() {
  // Inicialize o Firebase Admin
  getFirebaseAdminApp();
  
  // Verificar autenticação
  const cookieStore = cookies();
  const token = cookieStore.get('firebase-token')?.value;
  
  if (!token) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  
  try {
    await getAuth().verifyIdToken(token);
    
    // Configurar Google Sheets
    const jwt = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth: jwt });
    
    // Buscar marcas da planilha
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Brands!A:B',
    });

    const rows = response.data.values || [];
    
    const marcas = rows.map((row) => ({
      id: row[0],
      nome: row[1],
      // Adicione outros campos conforme necessário
    }));

    return NextResponse.json({ marcas });
  } catch (error) {
    console.error('Erro ao buscar marcas:', error);
    return NextResponse.json({ error: 'Erro ao buscar marcas' }, { status: 500 });
  }
} 