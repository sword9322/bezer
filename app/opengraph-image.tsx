import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const alt = 'Bezer - Gestão de Inventário'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: 'linear-gradient(to bottom right, #ffffff, #f3f4f6)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: 24,
          }}
        >
          Bezer
        </div>
        <div
          style={{
            fontSize: 36,
            color: '#4b5563',
          }}
        >
          Sistema de Gestão de Inventário
        </div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
} 