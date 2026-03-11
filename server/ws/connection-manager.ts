import type WebSocket from 'ws'
import type { AuthenticatedWs } from './types'

interface ActiveGeneration {
  userId: string
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

    // Cancel any active generations for this socket
    for (const [portfolioId, gen] of this.activeGenerations) {
      if (gen.userId === userId) {
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
    abortController: AbortController,
  ): void {
    this.activeGenerations.set(portfolioId, { userId, abortController })
  }

  clearActiveGeneration(portfolioId: string): void {
    this.activeGenerations.delete(portfolioId)
  }

  cancelGeneration(portfolioId: string): boolean {
    const gen = this.activeGenerations.get(portfolioId)
    if (!gen) return false
    gen.abortController.abort()
    this.activeGenerations.delete(portfolioId)
    return true
  }

  getConnectionCount(userId: string): number {
    return this.connections.get(userId)?.size ?? 0
  }
}
