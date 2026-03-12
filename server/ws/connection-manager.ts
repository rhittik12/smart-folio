import type WebSocket from 'ws'

interface ActiveGeneration {
  userId: string
  ws: WebSocket
  abortController: AbortController
}

export class ConnectionManager {
  private connections = new Map<string, Set<WebSocket>>()
  private activeGenerations = new Map<string, ActiveGeneration>()
  private readonly maxConnectionsPerUser = 3

  addConnection(userId: string, ws: WebSocket): boolean {
    const userConns = this.connections.get(userId) ?? new Set()

    if (userConns.size >= this.maxConnectionsPerUser) {
      return false
    }

    userConns.add(ws)
    this.connections.set(userId, userConns)
    return true
  }

  removeConnection(userId: string, ws: WebSocket): void {
    const userConns = this.connections.get(userId)
    if (!userConns) return

    userConns.delete(ws)
    if (userConns.size === 0) {
      this.connections.delete(userId)
    }

    // Only cancel generations that were initiated from THIS socket
    for (const [portfolioId, gen] of this.activeGenerations) {
      if (gen.ws === ws) {
        gen.abortController.abort()
        this.activeGenerations.delete(portfolioId)
      }
    }
  }

  hasActiveGeneration(userId: string): boolean {
    for (const gen of this.activeGenerations.values()) {
      if (gen.userId === userId) return true
    }
    return false
  }

  setActiveGeneration(
    portfolioId: string,
    userId: string,
    ws: WebSocket,
    abortController: AbortController,
  ): void {
    // Abort any existing generation for this portfolio before overwriting
    const existing = this.activeGenerations.get(portfolioId)
    if (existing) {
      console.log(`[connection-manager] Aborting existing generation for portfolio ${portfolioId} before starting new one`)
      existing.abortController.abort()
    }
    this.activeGenerations.set(portfolioId, { userId, ws, abortController })
  }

  clearActiveGeneration(portfolioId: string, abortController: AbortController): void {
    const current = this.activeGenerations.get(portfolioId)
    // Only clear if the stored entry belongs to this run.
    // A newer run may have replaced the slot; don't delete it.
    if (current && current.abortController === abortController) {
      this.activeGenerations.delete(portfolioId)
    }
  }

  /** Cancel only if the requesting userId owns this generation. */
  cancelGeneration(portfolioId: string, userId: string): boolean {
    const gen = this.activeGenerations.get(portfolioId)
    if (!gen || gen.userId !== userId) return false
    gen.abortController.abort()
    this.activeGenerations.delete(portfolioId)
    return true
  }

  getConnectionCount(userId: string): number {
    return this.connections.get(userId)?.size ?? 0
  }
}
