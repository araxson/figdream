'use client'

import { useState, useEffect, useRef } from 'react'
import type { BookingUpdate, BookingConflict } from '../types'

interface UseBookingWebSocketProps {
  salonId: string
  onBookingUpdate?: (update: BookingUpdate) => void
  onConflict?: (conflict: BookingConflict) => void
}

interface WebSocketMessage {
  type: string
  data?: any
  salonId?: string
}

export function useBookingWebSocket({
  salonId,
  onBookingUpdate,
  onConflict
}: UseBookingWebSocketProps) {
  const [connected, setConnected] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)

  const handleWebSocketMessage = (data: WebSocketMessage) => {
    switch (data.type) {
      case 'booking_update':
        onBookingUpdate?.(data.data)
        break
      case 'conflict':
        onConflict?.(data.data)
        break
      case 'pong':
        // Health check response
        break
      default:
        console.log('Unknown message type:', data.type)
    }
  }

  const connectWebSocket = () => {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
      wsRef.current = new WebSocket(`${wsUrl}/booking-feed/${salonId}`)

      wsRef.current.onopen = () => {
        setConnected(true)
        setReconnecting(false)
        reconnectAttemptsRef.current = 0

        // Send authentication
        wsRef.current?.send(JSON.stringify({
          type: 'auth',
          salonId
        }))
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleWebSocketMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      wsRef.current.onclose = () => {
        setConnected(false)
        scheduleReconnect()
      }
    } catch (error) {
      console.error('Error creating WebSocket:', error)
      setConnected(false)
    }
  }

  const disconnectWebSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }

  const scheduleReconnect = () => {
    if (reconnectAttemptsRef.current < 5) {
      setReconnecting(true)
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttemptsRef.current++
        connectWebSocket()
      }, delay)
    }
  }

  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }

  useEffect(() => {
    connectWebSocket()
    return () => {
      disconnectWebSocket()
    }
  }, [salonId])

  return {
    connected,
    reconnecting,
    sendMessage,
    disconnect: disconnectWebSocket,
    reconnect: connectWebSocket
  }
}