import { 
  getAlertConfigurations, 
  getAlertHistory,
  toggleAlertConfiguration,
  createAlertConfiguration,
  updateAlertConfiguration
} from '@/lib/api/dal/alerts'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [configurations, history] = await Promise.all([
      getAlertConfigurations(),
      getAlertHistory()
    ])
    
    return NextResponse.json({ configurations, history })
  } catch (error) {
    console.error('Get alerts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const success = await createAlertConfiguration(data)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to create alert configuration' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Create alert configuration error:', error)
    return NextResponse.json(
      { error: 'Failed to create alert configuration' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, enabled, ...updateData } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }
    
    // If toggling enabled status
    if (typeof enabled === 'boolean') {
      const success = await toggleAlertConfiguration(id, enabled)
      
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to toggle alert' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ success: true })
    }
    
    // Otherwise update configuration
    const success = await updateAlertConfiguration(id, updateData)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update alert configuration' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update alert configuration error:', error)
    return NextResponse.json(
      { error: 'Failed to update alert configuration' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }
    
    const { deleteAlertConfiguration } = await import('@/lib/api/dal/alerts')
    const success = await deleteAlertConfiguration(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete alert configuration' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete alert configuration error:', error)
    return NextResponse.json(
      { error: 'Failed to delete alert configuration' },
      { status: 500 }
    )
  }
}