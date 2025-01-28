'use server'

import { google } from 'googleapis'
import dotenv from 'dotenv'


dotenv.config()

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })
const SPREADSHEET_ID = process.env.SPREADSHEET_ID
if (!SPREADSHEET_ID) {
  throw new Error('SPREADSHEET_ID is not defined in environment variables')
}

const RACKS_RANGE = 'Racks!A2:B'
const HEADERS = [['ID', 'Warehouse']]

export async function setupRacksSheet() {
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Racks!A1:B1',
      valueInputOption: 'RAW',
      requestBody: {
        values: HEADERS
      },
    })
    return { success: true }
  } catch (error) {
    console.error('Error setting up racks sheet:', error)
    return { success: false }
  }
}

export type Rack = {
  id: string
  warehouse: string
}

export async function getRacks(warehouse: string) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RACKS_RANGE,
    })

    const rows = response.data.values
    if (!rows) return []

    // Convert warehouse name to number and ensure it's a string
    const warehouseNumber = warehouse === 'Warehouse 1' ? '1' : '2'

    // Filter rows that have data and match the warehouse
    const racks = rows
      .filter(row => 
        row.length >= 2 && // Ensure row has both ID and warehouse
        row[0] && // Ensure ID exists
        row[1] && // Ensure warehouse exists
        row[1].toString().trim() === warehouseNumber // Exact warehouse match
      )
      .map(row => ({
        id: row[0],
        warehouse: row[1] === '1' ? 'Warehouse 1' : 'Warehouse 2'
      }))

    console.log(`Fetched racks for ${warehouse}:`, racks) // Debug log
    return racks
  } catch (error) {
    console.error('Error fetching racks:', error)
    return []
  }
}

export async function addRack(rack: { warehouse: string, id?: string }) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RACKS_RANGE,
    })

    const rows = response.data.values || []
    const rackId = rack.id || String(rows.length + 1)
    const warehouseNumber = rack.warehouse === 'Warehouse 1' ? '1' : '2'

    // Check if rack ID already exists in the same warehouse
    const isDuplicate = rows.some(row => 
      row[0] === rackId && row[1] === warehouseNumber
    )

    if (isDuplicate) {
      return { success: false, error: 'Este rack já existe neste armazém' }
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RACKS_RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[rackId, warehouseNumber]],
      },
    })

    return { success: true, id: rackId }
  } catch (error) {
    console.error('Error adding rack:', error)
    return { success: false, error: 'Failed to add rack' }
  }
}

export async function updateRack(rack: Rack) {
  try {
    // Get all racks to find the row to update
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RACKS_RANGE,
    })

    const rows = response.data.values
    if (!rows) throw new Error('No data found')

    // Find the row index
    const rowIndex = rows.findIndex(row => row[0] === rack.id)
    if (rowIndex === -1) throw new Error('Rack not found')

    // Convert warehouse name to number
    const warehouseNumber = rack.warehouse === 'Warehouse 1' ? '1' : '2'

    // Update the rack
    const range = `Racks!A${rowIndex + 2}:B${rowIndex + 2}`
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[rack.id, warehouseNumber]],
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating rack:', error)
    return { success: false, error: 'Failed to update rack' }
  }
}

export async function deleteRack(rackId: string) {
  try {
    // Get all racks to find the row to delete
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RACKS_RANGE,
    })

    const rows = response.data.values
    if (!rows) throw new Error('No data found')

    // Find the row index
    const rowIndex = rows.findIndex(row => row[0] === rackId)
    if (rowIndex === -1) throw new Error('Rack not found')

    // Clear the row
    const range = `Racks!A${rowIndex + 2}:B${rowIndex + 2}`
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range,
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting rack:', error)
    return { success: false, error: 'Failed to delete rack' }
  }
}

export async function bulkDeleteRacks(rackIds: string[]) {
  try {
    for (const rackId of rackIds) {
      await deleteRack(rackId)
    }
    return { success: true }
  } catch (error) {
    console.error('Error bulk deleting racks:', error)
    return { success: false, error: 'Failed to delete racks' }
  }
} 