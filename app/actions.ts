'use server'

import { google } from 'googleapis'
//import { v4 as uuidv4 } from 'uuid'
//import fs from 'fs'
import { Product } from '@/components/InventoryTable'
import dotenv from 'dotenv'
import { Readable } from 'stream'

dotenv.config()

export { addProduct, getProducts, deleteProduct, updateProduct };

// Load environment variables
const projectId = process.env.GOOGLE_PROJECT_ID;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Replace escaped newlines
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

const auth = new google.auth.GoogleAuth({
  credentials: {
    project_id: projectId,
    private_key: privateKey,
    client_email: clientEmail,
  },
  // Add both Sheets and Drive scopes
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file', // Added Drive scope
  ],
});

const sheets = google.sheets({ version: 'v4', auth });
google.drive({ version: 'v3', auth }); // Initialize Google Drive API
const SPREADSHEET_ID = '1F0FmaEcFZhvlaQ3D4i22TJj_Q5ST4wJ6SqUcmds90no';
const RANGE = 'Sheet1!A:H'

const COLUMN_TITLES = ['Referência', 'Imagem', 'Altura', 'Largura', 'Marca', 'Campanha', 'Data', 'Estoque', 'Localidade']

async function addProduct(formData: FormData) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A1:I1',
    })

    const existingTitles = response.data.values && response.data.values[0]

    if (!existingTitles || existingTitles.length === 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [COLUMN_TITLES],
        },
      })
    }

    const image = formData.get('image') as File;
    console.log('Image object:', image);
    const imageLink = await uploadImageToDrive(image)
    const height = formData.get('height')
    const width = formData.get('width')
    const brand = formData.get('brand')
    const campaign = formData.get('campaign')
    const date = formData.get('date')
    const stock = formData.get('stock')
    const localidade = formData.get('localidade')
    const ref = `REF-${Math.floor(Math.random() * 10000)}`;

    const values = [
      [ref, imageLink, height, width, brand, campaign, date, stock, localidade]
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Erro ao adicionar produto:', error)
    return { success: false, error: 'Erro ao adicionar produto' }
  }
}

async function getProducts(page: number, pageSize: number = 10) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A2:I',
    });

    const rows = response.data.values;
    if (!rows) throw new Error('No data found.');

    const products = rows.map(row => ({
      ref: row[0],
      image: row[1],
      height: Number(row[2]),
      width: Number(row[3]),
      brand: row[4],
      campaign: row[5],
      date: row[6],
      stock: Number(row[7]),
      localidade: row[8],
    }));

    return { products, totalPages: Math.ceil(products.length / pageSize) };
  } catch (error) {
    console.error('Erro ao obter produtos:', error);
    return { products: [], totalPages: 0 };
  }
}

async function deleteProduct(ref: string) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    })

    const values = response.data.values || []
    const rowIndex = values.findIndex(row => row[0] === ref)

    if (rowIndex !== -1) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 0,
                  dimension: 'ROWS',
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
              },
            },
          ],
        },
      })
      return { success: true }
    } else {
      return { success: false, error: 'Produto não encontrado' }
    }
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    return { success: false, error: 'Erro ao excluir produto' }
  }
}

async function updateProduct(updatedProduct: Product) {
  try {
    // Fetch all products to find the row index of the product to update
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (!rows) throw new Error('No data found.');

    // Find the row index of the product to update
    const rowIndex = rows.findIndex(row => row[0] === updatedProduct.ref);
    if (rowIndex === -1) throw new Error('Product not found.');

    // Update the product data in the specific row
    const updateRange = `Sheet1!A${rowIndex + 1}:I${rowIndex + 1}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          updatedProduct.ref,
          updatedProduct.image,
          updatedProduct.height,
          updatedProduct.width,
          updatedProduct.brand,
          updatedProduct.campaign,
          updatedProduct.date,
          updatedProduct.stock,
          updatedProduct.localidade
        ]],
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return { success: false, error: 'Erro ao atualizar produto' };
  }
}

async function uploadImageToDrive(image: File): Promise<string> {
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: image.name,
    parents: ['1jC__wec1icenm-UjqaCqU1EVEEg5Pawv'], // Replace with your Google Drive folder ID
  };

  // Convert the File object to a readable stream
  const buffer = await image.arrayBuffer();
  const stream = Readable.from(Buffer.from(buffer));

  const media = {
    mimeType: image.type,
    body: stream, // Use the readable stream
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    if (response.data.id) {
      // Make the file publicly accessible
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      return response.data.webViewLink || '';
    }
  } catch (error) {
    console.error('Error uploading image to Google Drive:', error);
    throw new Error('Failed to upload image to Google Drive');
  }

  throw new Error('Failed to upload image to Google Drive');
}

async function testAuth() {
  try {
    const client = await auth.getClient();
    console.log('Authentication successful:', client);
  } catch (error) {
    console.error('Authentication failed:', error);
  }
}

testAuth();

export async function getProductByRef(ref: string) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A2:I',
    });

    const rows = response.data.values;
    if (!rows) throw new Error('No data found.');

    const product = rows.find(row => row[0] === ref);
    if (!product) return null;

    return {
      ref: product[0],
      image: product[1],
      height: Number(product[2]),
      width: Number(product[3]),
      brand: product[4],
      campaign: product[5],
      date: product[6],
      stock: Number(product[7]),
      localidade: product[8],
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

