/**
 * Connection Pool Manager
 * Optimized database connection pooling and management
 */

import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

interface PoolConfig {
  minConnections: number
  maxConnections: number
  idleTimeout: number
  connectionTimeout: number
  maxRetries: number
  retryDelay: number
}

interface PooledConnection {
  client: SupabaseClient
  id: string
  inUse: boolean
  created: number
  lastUsed: number
  queryCount: number
}

interface ConnectionStats {
  totalConnections: number
  activeConnections: number
  idleConnections: number
  waitingRequests: number
  totalQueries: number
  avgQueryTime: number
  poolEfficiency: number
}

class ConnectionPoolManager {
  private static instance: ConnectionPoolManager
  private pool: Map<string, PooledConnection> = new Map()
  private waitQueue: Array<(conn: PooledConnection) => void> = []
  private cleanupInterval: NodeJS.Timeout | undefined
  private stats = {
    totalQueries: 0,
    totalQueryTime: 0,
    connectionsCreated: 0,
    connectionsReused: 0,
    connectionErrors: 0
  }

  private config: PoolConfig = {
    minConnections: 2,
    maxConnections: 10,
    idleTimeout: 30000, // 30 seconds
    connectionTimeout: 5000, // 5 seconds
    maxRetries: 3,
    retryDelay: 1000 // 1 second
  }

  private constructor() {
    // Initialize minimum connections
    this.initializePool()

    // Start cleanup interval
    if (typeof process !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 10000) // Cleanup every 10 seconds
    }
  }

  static getInstance(): ConnectionPoolManager {
    if (!ConnectionPoolManager.instance) {
      ConnectionPoolManager.instance = new ConnectionPoolManager()
    }
    return ConnectionPoolManager.instance
  }

  /**
   * Initialize connection pool with minimum connections
   */
  private async initializePool(): Promise<void> {
    const promises: Promise<void>[] = []

    for (let i = 0; i < this.config.minConnections; i++) {
      promises.push(this.createConnection())
    }

    await Promise.all(promises)
  }

  /**
   * Create a new pooled connection
   */
  private async createConnection(): Promise<void> {
    try {
      const client = await createClient()
      const id = `conn-${Date.now()}-${Math.random()}`

      const connection: PooledConnection = {
        client,
        id,
        inUse: false,
        created: Date.now(),
        lastUsed: Date.now(),
        queryCount: 0
      }

      this.pool.set(id, connection)
      this.stats.connectionsCreated++

    } catch (error) {
      this.stats.connectionErrors++
      console.error('Failed to create connection:', error)
    }
  }

  /**
   * Get a connection from the pool
   */
  async getConnection(): Promise<PooledConnection> {
    const startTime = Date.now()

    // Try to find an idle connection
    for (const conn of this.pool.values()) {
      if (!conn.inUse) {
        conn.inUse = true
        conn.lastUsed = Date.now()
        this.stats.connectionsReused++
        return conn
      }
    }

    // If pool not at max, create new connection
    if (this.pool.size < this.config.maxConnections) {
      await this.createConnection()
      return this.getConnection() // Recursive call to get the newly created connection
    }

    // Wait for a connection to become available
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waitQueue.indexOf(resolve)
        if (index > -1) {
          this.waitQueue.splice(index, 1)
        }
        reject(new Error('Connection timeout'))
      }, this.config.connectionTimeout)

      this.waitQueue.push((conn: PooledConnection) => {
        clearTimeout(timeout)
        resolve(conn)
      })
    })
  }

  /**
   * Release a connection back to the pool
   */
  releaseConnection(connection: PooledConnection): void {
    connection.inUse = false
    connection.lastUsed = Date.now()

    // If there are waiting requests, give them the connection
    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift()
      if (resolve) {
        connection.inUse = true
        resolve(connection)
      }
    }
  }

  /**
   * Execute a query with automatic connection management
   */
  async executeQuery<T>(
    queryFn: (client: SupabaseClient) => Promise<T>,
    retries: number = this.config.maxRetries
  ): Promise<T> {
    const startTime = Date.now()
    let lastError: Error | null = null

    for (let attempt = 0; attempt < retries; attempt++) {
      let connection: PooledConnection | null = null

      try {
        connection = await this.getConnection()
        connection.queryCount++

        const result = await queryFn(connection.client)

        // Update stats
        const queryTime = Date.now() - startTime
        this.stats.totalQueries++
        this.stats.totalQueryTime += queryTime

        return result

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Query failed')

        // If connection error, remove from pool
        if (connection && this.isConnectionError(error)) {
          this.removeConnection(connection)
          connection = null
        }

        // Wait before retry
        if (attempt < retries - 1) {
          await new Promise(resolve =>
            setTimeout(resolve, this.config.retryDelay * Math.pow(2, attempt))
          )
        }

      } finally {
        if (connection) {
          this.releaseConnection(connection)
        }
      }
    }

    throw lastError || new Error('Query failed after retries')
  }

  /**
   * Execute multiple queries in a transaction
   */
  async executeTransaction<T>(
    queries: Array<(client: SupabaseClient) => Promise<T>>
  ): Promise<T[]> {
    const connection = await this.getConnection()

    try {
      const results: T[] = []

      // Start transaction
      await connection.client.rpc('begin_transaction')

      try {
        for (const query of queries) {
          const result = await query(connection.client)
          results.push(result)
        }

        // Commit transaction
        await connection.client.rpc('commit_transaction')
        return results

      } catch (error) {
        // Rollback on error
        await connection.client.rpc('rollback_transaction')
        throw error
      }

    } finally {
      this.releaseConnection(connection)
    }
  }

  /**
   * Check if error is a connection error
   */
  private isConnectionError(error: unknown): boolean {
    const connectionErrors = [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNRESET'
    ]

    const errorObj = error as { message?: string; code?: string }
    const message = errorObj?.message || errorObj?.code || ''
    return connectionErrors.some(err => message.includes(err))
  }

  /**
   * Remove a connection from the pool
   */
  private removeConnection(connection: PooledConnection): void {
    this.pool.delete(connection.id)

    // Create replacement if below minimum
    if (this.pool.size < this.config.minConnections) {
      this.createConnection()
    }
  }

  /**
   * Clean up idle connections
   */
  private cleanup(): void {
    const now = Date.now()
    const connectionsToRemove: string[] = []

    for (const [id, conn] of this.pool.entries()) {
      // Remove idle connections above minimum
      if (!conn.inUse &&
          this.pool.size > this.config.minConnections &&
          now - conn.lastUsed > this.config.idleTimeout) {
        connectionsToRemove.push(id)
      }
    }

    connectionsToRemove.forEach(id => {
      this.pool.delete(id)
    })
  }

  /**
   * Get pool statistics
   */
  getStats(): ConnectionStats {
    const activeConnections = Array.from(this.pool.values()).filter(c => c.inUse).length
    const idleConnections = this.pool.size - activeConnections

    return {
      totalConnections: this.pool.size,
      activeConnections,
      idleConnections,
      waitingRequests: this.waitQueue.length,
      totalQueries: this.stats.totalQueries,
      avgQueryTime: this.stats.totalQueries > 0
        ? this.stats.totalQueryTime / this.stats.totalQueries
        : 0,
      poolEfficiency: this.stats.connectionsReused > 0
        ? (this.stats.connectionsReused / (this.stats.connectionsCreated + this.stats.connectionsReused)) * 100
        : 0
    }
  }

  /**
   * Warmup pool for expected load
   */
  async warmup(expectedConnections: number): Promise<void> {
    const targetSize = Math.min(expectedConnections, this.config.maxConnections)
    const promises: Promise<void>[] = []

    for (let i = this.pool.size; i < targetSize; i++) {
      promises.push(this.createConnection())
    }

    await Promise.all(promises)
  }

  /**
   * Drain all connections (for shutdown)
   */
  async drain(): Promise<void> {
    // Wait for all active connections to be released
    while (Array.from(this.pool.values()).some(c => c.inUse)) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Clear the pool
    this.pool.clear()
    this.waitQueue = []
  }

  /**
   * Update pool configuration
   */
  updateConfig(config: Partial<PoolConfig>): void {
    this.config = { ...this.config, ...config }

    // Adjust pool size if needed
    if (this.pool.size < this.config.minConnections) {
      this.initializePool()
    }
  }

  /**
   * Destroy the connection pool and clean up resources
   */
  async destroy(): Promise<void> {
    // Clear the cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = undefined
    }

    // Drain all connections
    await this.drain()
  }
}

// Export singleton instance
export const connectionPool = ConnectionPoolManager.getInstance()

/**
 * Decorator for using pooled connections
 */
export function usePooledConnection() {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (this: object, ...args: unknown[]) {
      return connectionPool.executeQuery(
        client => originalMethod.apply(this, [client, ...args])
      )
    }

    return descriptor
  }
}

/**
 * Execute query with connection pool
 */
export async function executeWithPool<T>(
  queryFn: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  return connectionPool.executeQuery(queryFn)
}

/**
 * Execute transaction with connection pool
 */
export async function transactionWithPool<T>(
  queries: Array<(client: SupabaseClient) => Promise<T>>
): Promise<T[]> {
  return connectionPool.executeTransaction<T>(queries)
}