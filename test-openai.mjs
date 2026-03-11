import 'dotenv/config'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

try {
  const model = await openai.models.retrieve('gpt-4')
  console.log('OK: model', model.id, 'is accessible')
} catch (e) {
  console.error('FAIL:', e.status, '-', e.message)
}
