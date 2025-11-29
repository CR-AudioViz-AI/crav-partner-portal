import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const SYSTEM_PROMPT = `You are Javari, the AI assistant for the CR AudioViz AI Partner Portal. You help sales partners understand products, answer questions about commission structures, and provide sales support.

Key Information:
- Commission rates: 15-25% Year 1, 3-10% recurring annually
- Partner tiers: STARTER (50 leads/mo), PROVEN (200 leads/mo), ELITE (unlimited), ELITE+ (W-2 path)
- Clawback policy: 90-day 100% clawback, 180-day 50% clawback
- Contact window: 14 days to contact, 30 days to close

Products:
1. Spirits App - Tier 1, 25% commission, Easy difficulty
2. Realtor AI Suite - Tier 2, 20% commission, Medium difficulty
3. Market Oracle - Tier 2, 25% commission, Medium difficulty
4. CRAudioViz Pro - Tier 3, 18% commission, Hard difficulty
5. Enterprise Solutions - Tier 4, 15% commission, Expert difficulty

Be helpful, professional, and concise. Focus on helping partners succeed in their sales efforts.`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      )
    }

    // If no OpenAI key, return a demo response
    if (!OPENAI_API_KEY) {
      const lastMessage = messages[messages.length - 1]?.content || ''
      const demoResponses: Record<string, string> = {
        default: "Hi! I'm Javari, your AI assistant for the CR AudioViz AI Partner Portal. I can help you understand our products, commission structures, and sales strategies. What would you like to know?",
        commission: "Our commission structure offers 15-25% on Year 1 sales, with 3-10% recurring annually. The exact rate depends on the product tier and your partner status. STARTER partners begin at 15-20%, while ELITE+ partners can earn up to 25%.",
        products: "We have 5 main product categories: Spirits App (Tier 1, easiest to sell), Realtor AI Suite (Tier 2), Market Oracle (Tier 2), CRAudioViz Pro (Tier 3), and Enterprise Solutions (Tier 4). Each has different commission rates and sales cycles.",
        clawback: "Our clawback policy protects both parties: 100% clawback within 90 days if the customer cancels, 50% clawback between 90-180 days. After 180 days, your commission is fully vested.",
      }

      let response = demoResponses.default
      const lowerMessage = lastMessage.toLowerCase()
      
      if (lowerMessage.includes('commission') || lowerMessage.includes('earn')) {
        response = demoResponses.commission
      } else if (lowerMessage.includes('product') || lowerMessage.includes('sell')) {
        response = demoResponses.products
      } else if (lowerMessage.includes('clawback') || lowerMessage.includes('cancel')) {
        response = demoResponses.clawback
      }

      return NextResponse.json({ message: response })
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      return NextResponse.json(
        { error: 'Failed to get response from AI' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const aiMessage = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return NextResponse.json({ message: aiMessage })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
