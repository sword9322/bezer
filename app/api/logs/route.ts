import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdmin } from '@/lib/firebase-admin'
import { google } from 'googleapis'

// Initialize Google Sheets API
const sheets = google.sheets('v4')
const SPREADSHEET_ID = process.env.SPREADSHEET_ID
const LOGS_SHEET_NAME = 'ActivityLogs'

// Initialize auth for Google Sheets
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

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

// Function to ensure the ActivityLogs sheet exists
async function ensureLogsSheetExists() {
  try {
    // Get spreadsheet metadata
    const spreadsheet = await sheets.spreadsheets.get({
      auth,
      spreadsheetId: SPREADSHEET_ID,
    })

    // Check if ActivityLogs sheet exists
    const sheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === LOGS_SHEET_NAME
    )

    if (!sheet) {
      // Create the sheet if it doesn't exist
      await sheets.spreadsheets.batchUpdate({
        auth,
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: LOGS_SHEET_NAME,
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: 10,
                  },
                },
              },
            },
          ],
        },
      })

      // Add headers
      await sheets.spreadsheets.values.update({
        auth,
        spreadsheetId: SPREADSHEET_ID,
        range: `${LOGS_SHEET_NAME}!A1:J1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            'ID',
            'Timestamp',
            'Action Type',
            'Entity Type',
            'Entity Name',
            'Entity ID',
            'User Name',
            'User Email',
            'User Role',
            'Changes',
          ]],
        },
      })
    }
  } catch (error) {
    console.error('Error ensuring logs sheet exists:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    // Ensure the sheet exists before proceeding
    await ensureLogsSheetExists()

    // Check if user is authenticated and is admin
    const admin = getFirebaseAdmin()
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await admin.auth().verifyIdToken(token)
    
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
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range: `${LOGS_SHEET_NAME}!A2:J`,
    })

    const rows = response.data.values || []
    
    // Transform and filter logs
    let logs = rows.map((row) => ({
      id: row[0],
      timestamp: row[1],
      actionType: row[2],
      entityType: row[3],
      entityName: row[4],
      entityId: row[5],
      userName: row[6],
      userEmail: row[7],
      userRole: row[8],
      changes: row[9] ? JSON.parse(row[9]) : null,
    }))

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
        log.entityName.toLowerCase().includes(searchLower) ||
        log.userName.toLowerCase().includes(searchLower) ||
        log.userEmail.toLowerCase().includes(searchLower)
      )
    }

    // Sort logs by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Calculate pagination
    const total = logs.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLogs = logs.slice(startIndex, endIndex)

    return NextResponse.json({
      logs: paginatedLogs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })

  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Received log request')
    console.log('Request URL:', request.url)
    
    // Ensure the sheet exists before proceeding
    await ensureLogsSheetExists()
    console.log('Logs sheet exists')

    // Check if user is authenticated
    const admin = getFirebaseAdmin()
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No auth token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    console.log('Verifying token...')
    
    try {
      const decodedToken = await admin.auth().verifyIdToken(token)
      console.log('Token verified, user:', decodedToken.uid)
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    console.log('Request body:', body)
    
    const {
      actionType,
      entityType,
      entityId,
      changes,
      userName,
      userEmail,
      userRole
    } = body

    // Validate required fields
    if (!actionType || !entityType || !entityId) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prepare log entry
    const logEntry = [
      crypto.randomUUID(), // id
      new Date().toISOString(), // timestamp
      actionType,
      entityType,
      entityId, // Using entityId as name since we don't have a separate name
      entityId,
      userName || 'Unknown User',
      userEmail || 'No Email',
      userRole || 'user',
      changes ? JSON.stringify(changes) : '',
    ]
    console.log('Prepared log entry:', logEntry)

    // Append to Google Sheets
    console.log('Appending to sheets...')
    await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range: `${LOGS_SHEET_NAME}!A:J`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [logEntry],
      },
    })
    console.log('Successfully appended to sheets')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging activity:', error)
    // Add more detailed error information
    const errorDetails = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : 'Unknown error'
    
    return NextResponse.json(
      { error: 'Internal Server Error', details: errorDetails },
      { status: 500 }
    )
  }
} 