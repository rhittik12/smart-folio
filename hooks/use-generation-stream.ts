"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { GenerationStepData } from "@/components/workspace/GenerationStep"
import type { ServerMessage, ClientMessage } from "@/server/ws/types"

type StreamStatus = "idle" | "connecting" | "generating" | "complete" | "error"

interface UseGenerationStreamResult {
  steps: GenerationStepData[]
  previewHtml: string | null
  status: StreamStatus
  error: string | null
  cancel: () => void
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001"
const MAX_RETRIES = 3
const BASE_RETRY_DELAY = 1000

export function useGenerationStream(
  portfolioId: string | null,
  portfolioStatus: string | undefined,
): UseGenerationStreamResult {
  const [steps, setSteps] = useState<GenerationStepData[]>([])
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [status, setStatus] = useState<StreamStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const retriesRef = useRef(0)
  const startedRef = useRef(false)

  const cancel = useCallback(() => {
    if (wsRef.current && portfolioId) {
      const msg: ClientMessage = { type: "cancel_generation", portfolioId }
      wsRef.current.send(JSON.stringify(msg))
    }
    wsRef.current?.close()
    wsRef.current = null
  }, [portfolioId])

  useEffect(() => {
    if (!portfolioId || portfolioStatus !== "GENERATING") {
      if (portfolioStatus === "READY") {
        setStatus("complete")
      }
      return
    }

    if (startedRef.current) return
    startedRef.current = true

    function connect() {
      setStatus("connecting")

      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        setStatus("generating")
        retriesRef.current = 0

        const idempotencyKey = `${portfolioId}-${Date.now()}`
        const msg: ClientMessage = {
          type: "start_generation",
          portfolioId: portfolioId!,
          idempotencyKey,
        }
        ws.send(JSON.stringify(msg))

        setSteps([
          { id: "connecting", status: "complete", message: "Connected to generation server" },
          { id: "analyzing", status: "active", message: "Analyzing your requirements..." },
        ])
      }

      ws.onmessage = (event) => {
        let data: ServerMessage
        try {
          data = JSON.parse(event.data)
        } catch {
          return
        }

        switch (data.type) {
          case "generation_status":
            setSteps((prev) => {
              const existing = prev.find((s) => s.id === data.step)
              if (existing) {
                return prev.map((s) =>
                  s.id === data.step
                    ? { ...s, status: "active" as const, message: data.message, percent: data.percent }
                    : s.status === "active" && s.id !== data.step
                      ? { ...s, status: "complete" as const }
                      : s,
                )
              }
              // Mark previous active steps as complete, add new step
              return [
                ...prev.map((s) =>
                  s.status === "active" ? { ...s, status: "complete" as const } : s,
                ),
                { id: data.step, status: "active" as const, message: data.message, percent: data.percent },
              ]
            })
            break

          case "preview_html":
            setPreviewHtml(data.html)
            break

          case "portfolio_chunk":
            // Chunks are already handled via preview_html events
            break

          case "generation_complete":
            setStatus("complete")
            setSteps((prev) =>
              prev.map((s) =>
                s.status === "active" ? { ...s, status: "complete" as const } : s,
              ),
            )
            ws.close()
            break

          case "generation_error":
            setStatus("error")
            setError(data.message)
            setSteps((prev) =>
              prev.map((s) =>
                s.status === "active" ? { ...s, status: "complete" as const } : s,
              ),
            )
            ws.close()
            break

          case "rate_limit":
            setStatus("error")
            setError(`${data.reason}. Retry in ${data.retryAfter}s.`)
            ws.close()
            break
        }
      }

      ws.onclose = (event) => {
        if (status === "complete" || status === "error") return

        if (retriesRef.current < MAX_RETRIES && !event.wasClean) {
          const delay = BASE_RETRY_DELAY * Math.pow(2, retriesRef.current)
          retriesRef.current++
          setTimeout(connect, delay)
        }
      }

      ws.onerror = () => {
        // onclose will handle reconnection
      }
    }

    connect()

    return () => {
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [portfolioId, portfolioStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  return { steps, previewHtml, status, error, cancel }
}
