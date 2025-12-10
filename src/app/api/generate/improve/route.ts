import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini/client'

export async function POST(request: NextRequest) {
  try {
    const { content, instruction } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are a LinkedIn content expert. Improve the following LinkedIn post based on the instruction provided.

Original post:
${content}

Instruction: ${instruction || 'Make it more engaging and compelling'}

Return ONLY the improved post, no additional commentary or explanation.`

    const result = await model.generateContent(prompt)
    const improved = result.response.text().trim()

    return NextResponse.json({ improved })
  } catch (error: any) {
    console.error('Improve error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to improve post' },
      { status: 500 }
    )
  }
}
