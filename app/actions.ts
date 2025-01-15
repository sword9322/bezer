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
const RANGE = 'Inventario!A:K'
const BRANDS_RANGE = 'Brands!A:A'; // Range for brands
const TIPOLOGIAS_RANGE = 'Tipologias!A:A';

const COLUMN_TITLES = ['Referência', 'Imagem', 'Altura', 'Largura', 'Marca', 'Campanha', 'Data', 'Estoque', 'Localidade', 'Tipologia', 'Notas']

async function addProduct(formData: FormData) {
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Inventario!A1:K1',
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
    const tipologia = formData.get('tipologia')
    const notes = formData.get('notes')
    const ref = `REF-${Math.floor(Math.random() * 10000)}`;

    const values = [
      [ref, imageLink, height, width, brand, campaign, date, stock, localidade, tipologia, notes]
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
      range: 'Inventario!A2:K',
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
      tipologia: row[9],
      notes: row[10] || ''
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
    });

    const values = response.data.values || [];
    const rowIndex = values.findIndex(row => row[0] === ref);

    if (rowIndex !== -1) {
      const productToDelete = values[rowIndex];

      // Move to DeletedProducts first
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'DeletedProducts!A1:K',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [productToDelete],
        },
      });

      // Then delete from main inventory
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 0, // Main inventory sheet
                  dimension: 'ROWS',
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
              },
            },
          ],
        },
      });
      return { success: true };
    } else {
      return { success: false, error: 'Produto não encontrado' };
    }
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return { success: false, error: 'Erro ao excluir produto' };
  }
}

async function updateProduct(updatedProduct: Product) {
  try {
    console.log('Updating product:', updatedProduct);
    
    // Get all values to find the correct row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Inventario!A:K',
    });

    const rows = response.data.values;
    if (!rows) throw new Error('No data found.');

    // Find the row index (add 1 because row 1 is headers)
    const rowIndex = rows.findIndex(row => row[0] === updatedProduct.ref);
    if (rowIndex === -1) throw new Error('Product not found.');

    console.log('Found product at row:', rowIndex + 1);

    // Update the product data in the specific row
    const updateRange = `Inventario!A${rowIndex + 1}:K${rowIndex + 1}`;
    console.log('Updating range:', updateRange);
    console.log('Update values:', [
      updatedProduct.ref,
      updatedProduct.image,
      updatedProduct.height,
      updatedProduct.width,
      updatedProduct.brand,
      updatedProduct.campaign,
      updatedProduct.date,
      updatedProduct.stock,
      updatedProduct.localidade,
      updatedProduct.tipologia,
      updatedProduct.notes || '' // Ensure notes is never undefined
    ]);

    const updateResponse = await sheets.spreadsheets.values.update({
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
          updatedProduct.localidade,
          updatedProduct.tipologia,
          updatedProduct.notes || '' // Ensure notes is never undefined
        ]],
      },
    });

    console.log('Update response:', updateResponse.data);
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

export async function getProductByRef(ref: string) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Inventario!A2:J',
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
      tipologia: product[9],
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

export async function getDeletedProducts() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'DeletedProducts!A1:K',
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
      tipologia: row[9],
      notes: row[10] || ''
    }));

    return products;
  } catch (error) {
    console.error('Erro ao obter produtos excluídos:', error);
    return [];
  }
}

export async function downloadSheet() {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=xlsx`;

  // This function should not use window.open directly
  return url; // Return the URL instead
}

export const appendToDeletedProducts = async (values: (string | number)[]) => {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'DeletedProducts!A1:K',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });
  } catch (error) {
    console.error('Erro ao mover produto para excluídos:', error);
  }
};

export const fetchBrands = async () => {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: BRANDS_RANGE,
  });
  return response.data.values?.flat() || [];
};

export const addBrand = async (brand: string) => {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: BRANDS_RANGE,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[brand]],
    },
  });
};

export const deleteBrand = async (brand: string) => {
  try {
    // Get the spreadsheet metadata to find the correct sheet ID
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const brandsSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === 'Brands'
    );

    if (!brandsSheet?.properties?.sheetId) {
      throw new Error('Brands sheet not found');
    }

    // Get all brands to find the row index
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: BRANDS_RANGE,
    });

    const rows = response.data.values;
    if (!rows) throw new Error('No data found.');

    const rowIndex = rows.findIndex(row => row[0] === brand);
    if (rowIndex === -1) throw new Error('Brand not found.');

    // Delete the row using batchUpdate
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: brandsSheet.properties.sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }]
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error removing brand:', error);
    return { success: false, error: 'Failed to remove brand' };
  }
};

export const deleteProductFull = async (ref: string) => {
  try {
    // First, get the spreadsheet metadata to find the correct sheet ID
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    // Find the DeletedProducts sheet ID
    const deletedProductsSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === 'DeletedProducts'
    );

    if (!deletedProductsSheet?.properties?.sheetId) {
      throw new Error('DeletedProducts sheet not found');
    }

    // Get the row index
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'DeletedProducts!A:K',
    });

    const rows = response.data.values;
    if (!rows) throw new Error('No data found.');

    const rowIndex = rows.findIndex(row => row[0] === ref);
    if (rowIndex === -1) throw new Error('Product not found.');

    // Delete the row using the correct sheet ID
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: deletedProductsSheet.properties.sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }]
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return { success: false, error: 'Erro ao excluir produto' };
  }
};

export const restoreProduct = async (ref: string) => {
  try {
    // Get the product from DeletedProducts
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'DeletedProducts!A:K',
    });

    const rows = response.data.values;
    if (!rows) throw new Error('No data found.');

    const rowIndex = rows.findIndex(row => row[0] === ref);
    if (rowIndex === -1) throw new Error('Product not found.');

    const productToRestore = rows[rowIndex];

    // Add the product back to Inventory
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [productToRestore],
      },
    });

    // Delete from DeletedProducts
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const deletedProductsSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === 'DeletedProducts'
    );

    if (!deletedProductsSheet?.properties?.sheetId) {
      throw new Error('DeletedProducts sheet not found');
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: deletedProductsSheet.properties.sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }]
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao restaurar produto:', error);
    return { success: false, error: 'Erro ao restaurar produto' };
  }
};

export const fetchTipologias = async () => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: TIPOLOGIAS_RANGE,
    });
    return response.data.values?.flat() || [];
  } catch (error) {
    console.error('Error fetching tipologias:', error);
    return [];
  }
};

export const addTipologia = async (tipologia: string) => {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: TIPOLOGIAS_RANGE,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[tipologia]],
    },
  });
};

export const deleteTipologia = async (tipologia: string) => {
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const tipologiasSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === 'Tipologias'
    );

    if (!tipologiasSheet?.properties?.sheetId) {
      throw new Error('Tipologias sheet not found');
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: TIPOLOGIAS_RANGE,
    });

    const rows = response.data.values;
    if (!rows) throw new Error('No data found.');

    const rowIndex = rows.findIndex(row => row[0] === tipologia);
    if (rowIndex === -1) throw new Error('Tipologia not found.');

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: tipologiasSheet.properties.sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }]
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error removing tipologia:', error);
    return { success: false, error: 'Failed to remove tipologia' };
  }
};

export const downloadBrands = async () => {
  // Get the spreadsheet to find the Brands sheet ID
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const brandsSheet = spreadsheet.data.sheets?.find(
    sheet => sheet.properties?.title === 'Brands'
  );

  if (!brandsSheet?.properties?.sheetId) {
    throw new Error('Brands sheet not found');
  }

  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=xlsx&gid=${brandsSheet.properties.sheetId}&exportFileName=Marcas`;
  return url;
};

export const downloadTipologias = async () => {
  // Get the spreadsheet to find the Tipologias sheet ID
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const tipologiasSheet = spreadsheet.data.sheets?.find(
    sheet => sheet.properties?.title === 'Tipologias'
  );

  if (!tipologiasSheet?.properties?.sheetId) {
    throw new Error('Tipologias sheet not found');
  }

  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=xlsx&gid=${tipologiasSheet.properties.sheetId}&exportFileName=Tipologias`;
  return url;
};



