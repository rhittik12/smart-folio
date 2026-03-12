import 'dotenv/config'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const modelId = process.env.OPENAI_MODEL || 'gpt-4'

try {
  const model = await openai.models.retrieve(modelId)
  console.log('OK: model', model.id, 'is accessible')
} catch (e) {
  console.error('FAIL:', e.status, '-', e.message)
  process.exit(1)
}
