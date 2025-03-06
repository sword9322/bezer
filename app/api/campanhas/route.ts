import { NextResponse } from "next/server";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { logActivity } from '@/lib/activity-logger';

// Função para obter campanhas
export async function GET(request: Request) {
  // Initialize Firebase Admin first
  getFirebaseAdminApp();
  
  // Verificar autenticação com Firebase
  const cookieStore = cookies();
  const token = cookieStore.get("firebase-token")?.value;
  
  if (!token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  
  try {
    // Verificar token com Firebase Admin (opcional, mas recomendado)
    await getAuth().verifyIdToken(token);
    
    const searchParams = new URL(request.url).searchParams;
    const marcaId = searchParams.get("marcaId");
    
    // Configurar autenticação Google
    const jwt = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth: jwt });
    
    // Buscar dados
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Campanhas!A:G",
    });

    const rows = response.data.values || [];
    
    // Filtrar campanhas pela marca se um marcaId for fornecido
    const campanhas = rows.map((row) => ({
      id: row[0],
      nome: row[1],
      marcaId: row[2],
      dataInicio: row[3],
      dataFim: row[4],
      descricao: row[5],
      status: row[6],
    })).filter(campanha => 
      !marcaId || campanha.marcaId === marcaId
    );

    return NextResponse.json({ campanhas });
  } catch (error) {
    console.error("Erro ao buscar campanhas:", error);
    return NextResponse.json({ error: "Erro ao buscar campanhas" }, { status: 500 });
  }
}

// Função para adicionar nova campanha
export async function POST(request: Request) {
  // Inicialize o Firebase Admin
  getFirebaseAdminApp();
  
  // Verificar autenticação
  const cookieStore = cookies();
  const token = cookieStore.get("firebase-token")?.value;
  
  if (!token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  
  try {
    // Verificar token com Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Receber dados da nova campanha
    const campanha = await request.json();
    
    // Verificar dados obrigatórios
    if (!campanha.nome || !campanha.marcaId) {
      return NextResponse.json({ error: "Nome e marca são obrigatórios" }, { status: 400 });
    }
    
    // Configurar autenticação Google
    const jwt = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth: jwt });
    
    // Gerar ID único
    const id = Date.now().toString();
    
    // Adicionar nova campanha na planilha
    const spreadsheetId = process.env.SPREADSHEET_ID;
    
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Configuração do servidor incompleta" }, { status: 500 });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: "Campanhas!A:G",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          id,
          campanha.nome,
          campanha.marcaId,
          campanha.dataInicio || "",
          campanha.dataFim || "",
          campanha.descricao || "",
          campanha.status || "Ativo"
        ]]
      }
    });
    
    await logActivity('added', 'campaign', id, {
      after: campanha,
      before: null
    }, {
      id: decodedToken.uid,
      name: decodedToken.name || 'Unknown',
      email: decodedToken.email || 'No email',
      role: decodedToken.role || 'user'
    });
    
    return NextResponse.json({ 
      success: true, 
      campanha: {
        id,
        ...campanha
      }
    });
  } catch (error) {
    console.error("Erro ao adicionar campanha:", error);
    return NextResponse.json({ error: "Erro ao adicionar campanha" }, { status: 500 });
  }
}

// Função para deletar campanha
export async function DELETE(request: Request) {
  // Verificar autenticação com Firebase
  const cookieStore = cookies();
  const token = cookieStore.get("firebase-token")?.value;
  
  if (!token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  
  try {
    // Verificar token com Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Obter ID da campanha a ser deletada
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "ID da campanha não fornecido" }, { status: 400 });
    }
    
    // Configurar autenticação Google
    const jwt = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth: jwt });
    
    // Buscar todas as campanhas para encontrar a linha a ser deletada
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Campanhas!A:A",
    });
    
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id);
    
    if (rowIndex === -1) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 });
    }
    
    // Obter informações sobre a planilha para saber o ID da sheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
    });
    
    const campanhasSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === 'Campanhas'
    );
    
    if (!campanhasSheet?.properties?.sheetId) {
      return NextResponse.json({ error: "Planilha de campanhas não encontrada" }, { status: 500 });
    }
    
    // Deletar a linha correspondente à campanha
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: campanhasSheet.properties.sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }]
      }
    });
    
    await logActivity('deleted', 'campaign', id, {
      before: {
        id: rows[rowIndex][0],
        nome: rows[rowIndex][1],
        marcaId: rows[rowIndex][2],
        dataInicio: rows[rowIndex][3],
        dataFim: rows[rowIndex][4],
        descricao: rows[rowIndex][5],
        status: rows[rowIndex][6]
      },
      after: null
    }, {
      id: decodedToken.uid,
      name: decodedToken.name || 'Unknown',
      email: decodedToken.email || 'No email',
      role: decodedToken.role || 'user'
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar campanha:", error);
    return NextResponse.json({ error: "Erro ao deletar campanha" }, { status: 500 });
  }
}

// Função para atualizar campanha existente
export async function PUT(request: Request) {
  // Inicialize o Firebase Admin
  getFirebaseAdminApp();
  
  // Verificar autenticação
  const cookieStore = cookies();
  const token = cookieStore.get("firebase-token")?.value;
  
  if (!token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  
  try {
    // Verificar token com Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Obter ID da campanha a ser atualizada
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "ID da campanha não fornecido" }, { status: 400 });
    }
    
    // Receber dados atualizados da campanha
    const campanhaData = await request.json();
    
    // Verificar dados obrigatórios
    if (!campanhaData.nome || !campanhaData.marcaId) {
      return NextResponse.json({ error: "Nome e marca são obrigatórios" }, { status: 400 });
    }
    
    // Configurar autenticação Google
    const jwt = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth: jwt });
    
    // Buscar todas as campanhas para encontrar a linha a ser atualizada
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Campanhas!A:G",
    });
    
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id);
    
    if (rowIndex === -1) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 });
    }
    
    // Obter dados antigos para logging
    const oldData = {
      id: rows[rowIndex][0],
      nome: rows[rowIndex][1],
      marcaId: rows[rowIndex][2],
      dataInicio: rows[rowIndex][3],
      dataFim: rows[rowIndex][4],
      descricao: rows[rowIndex][5],
      status: rows[rowIndex][6],
    };
    
    // Atualizar a linha correspondente à campanha
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `Campanhas!A${rowIndex + 1}:G${rowIndex + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          id,
          campanhaData.nome,
          campanhaData.marcaId,
          campanhaData.dataInicio || "",
          campanhaData.dataFim || "",
          campanhaData.descricao || "",
          campanhaData.status || "Ativo"
        ]]
      }
    });
    
    // Registrar atividade de atualização
    await logActivity('updated', 'campaign', id, {
      before: oldData,
      after: {
        id,
        ...campanhaData
      }
    }, {
      id: decodedToken.uid,
      name: decodedToken.name || 'Unknown',
      email: decodedToken.email || 'No email',
      role: decodedToken.role || 'user'
    });
    
    return NextResponse.json({ 
      success: true, 
      campanha: {
        id,
        ...campanhaData
      }
    });
  } catch (error) {
    console.error("Erro ao atualizar campanha:", error);
    return NextResponse.json({ error: "Erro ao atualizar campanha" }, { status: 500 });
  }
} 