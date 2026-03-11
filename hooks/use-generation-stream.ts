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
  const statusRef = useRef<StreamStatus>("idle")

  // Keep ref in sync so WS callbacks always see latest status
  function updateStatus(next: StreamStatus) {
    statusRef.current = next
    setStatus(next)
  }

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
        updateStatus("complete")
      }
      return
    }

    if (startedRef.current) return
    startedRef.current = true

    function connect() {
      updateStatus("connecting")

      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        updateStatus("generating")
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
            updateStatus("complete")
            setSteps((prev) =>
              prev.map((s) =>
                s.status === "active" ? { ...s, status: "complete" as const } : s,
              ),
            )
            ws.close()
            break

          case "generation_error":
            updateStatus("error")
            setError(data.message)
            setSteps((prev) =>
              prev.map((s) =>
                s.status === "active" ? { ...s, status: "complete" as const } : s,
              ),
            )
            ws.close()
            break

          case "rate_limit":
            updateStatus("error")
            setError(`${data.reason}. Retry in ${data.retryAfter}s.`)
            ws.close()
            break
        }
      }

      ws.onclose = (event) => {
        if (statusRef.current === "complete" || statusRef.current === "error") return

        if (retriesRef.current < MAX_RETRIES && !event.wasClean) {
          // Unclean close (network error, server crash) — retry with backoff
          const delay = BASE_RETRY_DELAY * Math.pow(2, retriesRef.current)
          retriesRef.current++
          setTimeout(connect, delay)
        } else {
          // Either retries exhausted OR clean close without terminal event
          updateStatus("error")
          setError(
            retriesRef.current >= MAX_RETRIES
              ? "Could not connect to the generation server. Please ensure the WebSocket server is running (npm run dev:ws) and try again."
              : "Connection to generation server was lost. Please try again.",
          )
        }
      }

      ws.onerror = () => {
        // onclose will handle reconnection
      }
    }

    connect()

    return () => {
      startedRef.current = false
      retriesRef.current = 0
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [portfolioId, portfolioStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  return { steps, previewHtml, status, error, cancel }
}
