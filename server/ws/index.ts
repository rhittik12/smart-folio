import { createServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { PrismaClient } from '@prisma/client'
import { authenticateWsConnection } from './auth'
import { ConnectionManager } from './connection-manager'
import { GenerationRateLimiter } from './rate-limiter'
import { runGeneration } from './generation-pipeline'
import { clientMessageSchema } from './schemas'
import type { AuthenticatedWs, ServerMessage } from './types'

const WS_PORT = parseInt(process.env.WS_PORT || '3001', 10)
const prisma = new PrismaClient()
const connectionManager = new ConnectionManager()
const rateLimiter = new GenerationRateLimiter(prisma)

function send(ws: WebSocket, message: ServerMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message))
  }
}

const server = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Smartfolio WS server')
})

const wss = new WebSocketServer({ server })

wss.on('connection', async (ws: WebSocket, request) => {
  let authed: AuthenticatedWs | null = null

  try {
    const auth = await authenticateWsConnection(request)
    ;(ws as AuthenticatedWs).userId = auth.userId
    ;(ws as AuthenticatedWs).sessionId = auth.sessionId
    authed = ws as AuthenticatedWs

    if (!connectionManager.addConnection(auth.userId, authed)) {
      send(ws, {
        type: 'generation_error',
        code: 'RATE_LIMITED',
        message: 'Too many connections. Max 3 per user.',
      })
      ws.close(1008, 'Too many connections')
      return
    }

    console.log(`[ws] User ${auth.userId} connected (session: ${auth.sessionId})`)
  } catch (err) {
    send(ws, {
      type: 'generation_error',
      code: 'UNAUTHORIZED',
      message: 'Authentication failed',
    })
    ws.close(1008, 'Unauthorized')
    return
  }

  ws.on('message', async (raw) => {
    if (!authed) return

    let data: unknown
    try {
      data = JSON.parse(raw.toString())
    } catch {
      send(ws, { type: 'generation_error', code: 'VALIDATION_ERROR', message: 'Invalid JSON' })
      return
    }

    const parsed = clientMessageSchema.safeParse(data)
    if (!parsed.success) {
      send(ws, {
        type: 'generation_error',
        code: 'VALIDATION_ERROR',
        message: `Invalid message: ${parsed.error.message}`,
      })
      return
    }

    const msg = parsed.data

    if (msg.type === 'start_generation') {
      // Check rate limits
      const rateCheck = await rateLimiter.checkAllowance(authed.userId)
      if (!rateCheck.allowed) {
        send(ws, {
          type: 'rate_limit',
          retryAfter: rateCheck.retryAfter ?? 60,
          reason: rateCheck.reason ?? 'Rate limited',
        })
        return
      }

      // Check concurrent generation
      if (connectionManager.hasActiveGeneration(authed.userId)) {
        send(ws, {
          type: 'generation_error',
          code: 'RATE_LIMITED',
          message: 'A generation is already in progress. Please wait.',
        })
        return
      }

      const abortController = new AbortController()
      connectionManager.setActiveGeneration(msg.portfolioId, authed.userId, abortController)

      runGeneration(
        authed,
        msg.portfolioId,
        authed.userId,
        abortController.signal,
        prisma,
        (message: ServerMessage) => send(ws, message),
      ).finally(() => {
        connectionManager.clearActiveGeneration(msg.portfolioId)
      })
    }

    if (msg.type === 'cancel_generation') {
      connectionManager.cancelGeneration(msg.portfolioId)
      send(ws, {
        type: 'generation_error',
        code: 'INTERNAL_ERROR',
        message: 'Generation cancelled by user',
      })
    }
  })

  ws.on('close', () => {
    if (authed) {
      connectionManager.removeConnection(authed.userId, authed)
      console.log(`[ws] User ${authed.userId} disconnected`)
    }
  })

  ws.on('error', (err) => {
    console.error(`[ws] Error for user ${authed?.userId}:`, err.message)
  })
})

server.listen(WS_PORT, () => {
  console.log(`[ws] Smartfolio WebSocket server listening on port ${WS_PORT}`)
})

// Graceful shutdown
function shutdown() {
  console.log('[ws] Shutting down...')
  wss.clients.forEach((client) => {
    client.close(1001, 'Server shutting down')
  })
  wss.close(() => {
    prisma.$disconnect().then(() => {
      process.exit(0)
    })
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
