import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdminApp } from '@/lib/firebase-admin'
import { google } from 'googleapis'
import { getAuth } from 'firebase-admin/auth'

// Initialize auth for Google Sheets properly
const auth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

// Initialize Google Sheets API with auth
const sheets = google.sheets({
  version: 'v4',
  auth: auth
})

const SPREADSHEET_ID = process.env.SPREADSHEET_ID
const LOGS_SHEET_NAME = 'ActivityLogs'

// Add this at the top of the file
const requiredEnvVars = [
  'GOOGLE_PRIVATE_KEY',
  'GOOGLE_CLIENT_EMAIL',
  'SPREADSHEET_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL'
]

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`)
  }
})

// Comment out or remove LogEntry if unused
// Replace any types with more specific types
// type LogData = {
//   type: string;
//   message: string;
//   // other fields...
// }

// Function to ensure the ActivityLogs sheet exists
async function ensureLogsSheetExists() {
  try {
    // Check if the sheet exists
    const sheetsClient = google.sheets({
      version: 'v4',
      auth: auth
    })
    
    console.log('Checking if logs sheet exists...')
    const spreadsheet = await sheetsClient.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      auth: auth
    })

    const sheetExists = spreadsheet.data.sheets?.some(
      sheet => sheet.properties?.title === LOGS_SHEET_NAME
    );

    if (!sheetExists) {
      // Create the sheet if it doesn't exist
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: LOGS_SHEET_NAME,
                }
              }
            }
          ]
        }
      });

      // Add headers to the new sheet
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${LOGS_SHEET_NAME}!A1:J1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['ID', 'Timestamp', 'Action Type', 'Entity Type', 'Entity ID', 'Changes', 'User ID', 'User Name', 'User Email', 'User Role']]
        }
      });
    }
  } catch (error) {
    console.error('Error ensuring logs sheet exists:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Ensure the sheet exists before proceeding
    await ensureLogsSheetExists()

    // Check if user is authenticated and is admin
    const admin = getFirebaseAdminApp()
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const firebaseAuth = getAuth(admin)
    const decodedToken = await firebaseAuth.verifyIdToken(token)
    
    // Allow both admin and manager roles to access logs
    if (!decodedToken.role || (decodedToken.role !== 'admin' && decodedToken.role !== 'manager')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action')
    const entity = searchParams.get('entity')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const search = searchParams.get('search')

    // Fetch logs from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${LOGS_SHEET_NAME}!A2:J`,
    })

    // Handle empty response safely
    if (!response.data.values) {
      return NextResponse.json({ logs: [], total: 0 })
    }

    // Transform and filter logs
    let logs = response.data.values.map((row) => {
      try {
        return {
          id: row[0] || '',
          timestamp: row[1] || new Date().toISOString(),
          actionType: row[2] || '',
          entityType: row[3] || '',
          entityId: row[4] || '',
          changes: row[5] ? JSON.parse(row[5]) : null,
          userId: row[6] || '',
          userName: row[7] || '',
          userEmail: row[8] || '',
          userRole: row[9] || '',
        }
      } catch (error) {
        console.error('Error parsing log row:', error, row)
        return null
      }
    }).filter(log => log !== null) // Filter out any null logs from parsing errors

    // Apply filters
    if (action && action !== 'all') {
      logs = logs.filter(log => log.actionType === action)
    }

    if (entity && entity !== 'all') {
      logs = logs.filter(log => log.entityType === entity)
    }

    if (from) {
      const fromDate = new Date(from)
      logs = logs.filter(log => new Date(log.timestamp) >= fromDate)
    }

    if (to) {
      const toDate = new Date(to)
      logs = logs.filter(log => new Date(log.timestamp) <= toDate)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      logs = logs.filter(log => 
        log.entityId.toLowerCase().includes(searchLower) ||
        log.userName.toLowerCase().includes(searchLower) ||
        log.userEmail.toLowerCase().includes(searchLower)
      )
    }

    // Sort logs by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Calculate pagination
    const total = logs.length
    const startIndex = (page - 1) * limit
    const paginatedLogs = logs.slice(startIndex, startIndex + limit)

    return NextResponse.json({ logs: paginatedLogs, total })
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure the sheet exists first
    await ensureLogsSheetExists()
    
    // Authenticate request
    const admin = getFirebaseAdminApp()
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const firebaseAuth = getAuth(admin)
    await firebaseAuth.verifyIdToken(token)
    
    // Parse request body
    const body = await request.json()
    const { actionType, entityType, entityId, changes, userId, userName, userEmail, userRole } = body
    
    // Validate required fields
    if (!actionType || !entityType || !entityId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Generate log ID and timestamp
    const id = Date.now().toString()
    const timestamp = new Date().toISOString()
    
    // Format changes as JSON string
    const changesString = JSON.stringify(changes || {})
    
    // Append log to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${LOGS_SHEET_NAME}!A:J`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[id, timestamp, actionType, entityType, entityId, changesString, userId, userName || '', userEmail || '', userRole || '']]
      }
    })
    
    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('Error logging activity:', error)
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 })
  }
} 