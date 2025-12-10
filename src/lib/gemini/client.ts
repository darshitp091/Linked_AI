import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini client
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key is not configured. Please add your API key to the .env.local file.')
  }

  return new GoogleGenerativeAI(apiKey)
}

// Generate LinkedIn post using Gemini
export async function generateLinkedInPost(
  topic: string,
  style: string,
  tone: string,
  length: number
): Promise<string> {
  const genAI = getGeminiClient()

  const lengthGuide: Record<number, string> = {
    1: 'very short (1-2 sentences, ~50 words)',
    2: 'short (3-4 sentences, ~100 words)',
    3: 'medium (2-3 paragraphs, ~150-200 words)',
    4: 'long (3-4 paragraphs, ~250-300 words)',
    5: 'very long (4-5 paragraphs, ~350-400 words)',
  }

  const systemPrompt = `You are an expert LinkedIn ghostwriter and content strategist. Your task is to create engaging, professional LinkedIn posts that drive engagement and showcase thought leadership.

Guidelines:
- Write in a ${style} style with a ${tone} tone
- Use line breaks for readability
- Include relevant emojis (but don't overdo it)
- End with a call-to-action or thought-provoking question
- Make it authentic and conversational
- Avoid corporate jargon and buzzwords
- Focus on providing value to the reader

Create a ${lengthGuide[length] || 'medium'} LinkedIn post about: ${topic}

Make it engaging, authentic, and valuable to the reader. Only return the post content, no additional commentary.`

  try {
    // Use Gemini 2.5 Flash for fast, cost-effective generation
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent(systemPrompt)
    const response = result.response
    const content = response.text()

    if (!content) {
      throw new Error('No content generated')
    }

    return content.trim()
  } catch (error: any) {
    console.error('Gemini API Error:', error)

    if (error.message?.includes('API key')) {
      throw new Error('Invalid Gemini API key. Please check your configuration.')
    }

    if (error.message?.includes('quota')) {
      throw new Error('Gemini API quota exceeded. Please check your billing settings.')
    }

    throw new Error(`Failed to generate post: ${error.message}`)
  }
}

// Generate multiple post variations
export async function generatePostVariations(
  topic: string,
  style: string,
  tone: string,
  length: number,
  count: number = 3
): Promise<string[]> {
  const promises = []

  for (let i = 0; i < count; i++) {
    promises.push(generateLinkedInPost(topic, style, tone, length))
  }

  try {
    return await Promise.all(promises)
  } catch (error) {
    console.error('Error generating post variations:', error)
    throw error
  }
}

// Generate LinkedIn post from template
export async function generateFromTemplate(
  template: {
    name: string
    template: string
    variables?: string[]
  },
  tone: string,
  userInput?: { topics?: string[] }
): Promise<string> {
  const genAI = getGeminiClient()

  let prompt = `You are an expert LinkedIn ghostwriter. I have a proven LinkedIn post template that I want you to fill in with engaging content.

Template Name: ${template.name}
Tone: ${tone}

Template Structure:
${template.template}

Instructions:
- Use this EXACT template structure as your framework
- Fill in the placeholders/variables with compelling, specific content
${userInput?.topics && userInput.topics.length > 0 ? `- Focus the content on these topics: ${userInput.topics.join(', ')}` : ''}
- Maintain the ${tone} tone throughout
- Keep the same formatting, line breaks, and structure as the template
- Make it authentic and engaging
- Use emojis where appropriate (don't overdo it)
- Ensure the content flows naturally

Return ONLY the filled-in post content, no additional commentary.`

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent(prompt)
    const response = result.response
    const content = response.text()

    if (!content) {
      throw new Error('No content generated')
    }

    return content.trim()
  } catch (error: any) {
    console.error('Gemini API Error:', error)

    if (error.message?.includes('API key')) {
      throw new Error('Invalid Gemini API key. Please check your configuration.')
    }

    if (error.message?.includes('quota')) {
      throw new Error('Gemini API quota exceeded. Please check your billing settings.')
    }

    throw new Error(`Failed to generate post from template: ${error.message}`)
  }
}

// Generate multiple variations from template
export async function generateTemplateVariations(
  template: {
    name: string
    template: string
    variables?: string[]
  },
  tone: string,
  count: number = 3,
  userInput?: { topics?: string[] }
): Promise<string[]> {
  const promises = []

  for (let i = 0; i < count; i++) {
    promises.push(generateFromTemplate(template, tone, userInput))
  }

  try {
    return await Promise.all(promises)
  } catch (error) {
    console.error('Error generating template variations:', error)
    throw error
  }
}
