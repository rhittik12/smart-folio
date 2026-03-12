import 'dotenv/config'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const modelId = process.env.OPENAI_MODEL || 'gpt-4'

async function main() {
  try {
    const model = await openai.models.retrieve(modelId)
    console.log('OK: model', model.id, 'is accessible')
  } catch (e: unknown) {
    const status = e instanceof OpenAI.APIError ? e.status : 'unknown'
    const message = e instanceof Error ? e.message : String(e)
    console.error('FAIL:', status, '-', message)
    process.exit(1)
  }
}

main()
