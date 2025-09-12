import { getFAQCategories, getFAQQuestions, createFAQQuestion, updateFAQQuestion, deleteFAQQuestion } from '@/lib/api/dal/faq'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [categories, questions] = await Promise.all([
      getFAQCategories(),
      getFAQQuestions()
    ])
    
    return NextResponse.json({ categories, questions })
  } catch (error) {
    console.error('Get FAQ data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FAQ data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const success = await createFAQQuestion(data)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to create FAQ question' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Create FAQ question error:', error)
    return NextResponse.json(
      { error: 'Failed to create FAQ question' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      )
    }
    
    const success = await updateFAQQuestion(id, data)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update FAQ question' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update FAQ question error:', error)
    return NextResponse.json(
      { error: 'Failed to update FAQ question' },
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
        { error: 'Question ID is required' },
        { status: 400 }
      )
    }
    
    const success = await deleteFAQQuestion(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete FAQ question' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete FAQ question error:', error)
    return NextResponse.json(
      { error: 'Failed to delete FAQ question' },
      { status: 500 }
    )
  }
}