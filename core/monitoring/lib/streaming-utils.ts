/**
 * Streaming Utilities
 * Efficient streaming for large datasets and real-time updates
 */

import type { StreamingResponse } from '../types'

/**
 * Create a readable stream from an async generator
 */
export function createReadableStream<T>(
  generator: AsyncGenerator<T, void, unknown>
): ReadableStream<T> {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generator) {
          controller.enqueue(chunk)
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })
}

/**
 * Stream large dataset in chunks
 */
export async function* streamDataInChunks<T>(
  data: T[],
  chunkSize = 100
): AsyncGenerator<T[], void, unknown> {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    yield chunk

    // Allow other operations to run
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}

/**
 * Stream database results with cursor pagination
 */
export async function* streamDatabaseResults<T>(
  fetcher: (cursor?: string, limit?: number) => Promise<{ data: T[]; nextCursor?: string }>,
  limit = 100
): AsyncGenerator<T[], void, unknown> {
  let cursor: string | undefined = undefined
  let hasMore = true

  while (hasMore) {
    const result = await fetcher(cursor, limit)

    if (result.data.length > 0) {
      yield result.data
    }

    cursor = result.nextCursor
    hasMore = !!cursor && result.data.length === limit

    // Prevent overwhelming the database
    if (hasMore) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }
}

/**
 * Create a streaming response for server actions
 */
export function createStreamingResponse<T>(
  generator: AsyncGenerator<T[], void, unknown>,
  metadata?: {
    totalItems?: number
    contentType?: string
  }
): StreamingResponse<T[]> {
  const stream = createReadableStream(generator)

  return {
    data: stream,
    metadata: {
      totalItems: metadata?.totalItems || 0,
      chunkSize: 100,
      contentType: metadata?.contentType || 'application/json'
    }
  }
}

/**
 * Transform stream with processing function
 */
export async function* transformStream<T, R>(
  stream: AsyncGenerator<T[], void, unknown>,
  transformer: (item: T) => Promise<R>
): AsyncGenerator<R[], void, unknown> {
  for await (const chunk of stream) {
    const transformed = await Promise.all(chunk.map(transformer))
    yield transformed
  }
}

/**
 * Filter stream based on predicate
 */
export async function* filterStream<T>(
  stream: AsyncGenerator<T[], void, unknown>,
  predicate: (item: T) => boolean | Promise<boolean>
): AsyncGenerator<T[], void, unknown> {
  for await (const chunk of stream) {
    const filtered: T[] = []

    for (const item of chunk) {
      if (await predicate(item)) {
        filtered.push(item)
      }
    }

    if (filtered.length > 0) {
      yield filtered
    }
  }
}

/**
 * Aggregate stream data
 */
export async function aggregateStream<T, R>(
  stream: AsyncGenerator<T[], void, unknown>,
  aggregator: (acc: R, chunk: T[]) => R,
  initialValue: R
): Promise<R> {
  let result = initialValue

  for await (const chunk of stream) {
    result = aggregator(result, chunk)
  }

  return result
}

/**
 * Stream with progress tracking
 */
export async function* streamWithProgress<T>(
  stream: AsyncGenerator<T[], void, unknown>,
  onProgress: (processed: number, chunk: T[]) => void
): AsyncGenerator<T[], void, unknown> {
  let processed = 0

  for await (const chunk of stream) {
    processed += chunk.length
    onProgress(processed, chunk)
    yield chunk
  }
}

/**
 * Parallel stream processing
 */
export async function* parallelStreamProcess<T, R>(
  stream: AsyncGenerator<T[], void, unknown>,
  processor: (item: T) => Promise<R>,
  concurrency = 5
): AsyncGenerator<R[], void, unknown> {
  for await (const chunk of stream) {
    // Process chunk items in parallel batches
    const results: R[] = []

    for (let i = 0; i < chunk.length; i += concurrency) {
      const batch = chunk.slice(i, i + concurrency)
      const batchResults = await Promise.all(batch.map(processor))
      results.push(...batchResults)
    }

    yield results
  }
}

/**
 * Stream JSON Lines format (NDJSON)
 */
export function createNDJSONStream<T>(
  generator: AsyncGenerator<T[], void, unknown>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generator) {
          for (const item of chunk) {
            const line = JSON.stringify(item) + '\n'
            controller.enqueue(encoder.encode(line))
          }
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })
}

/**
 * Server-Sent Events (SSE) stream
 */
export function createSSEStream<T>(
  generator: AsyncGenerator<T[], void, unknown>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      try {
        // Send initial connection message
        controller.enqueue(encoder.encode(':ok\n\n'))

        for await (const chunk of generator) {
          for (const item of chunk) {
            const event = `data: ${JSON.stringify(item)}\n\n`
            controller.enqueue(encoder.encode(event))
          }
        }

        // Send completion message
        controller.enqueue(encoder.encode('event: complete\ndata: {}\n\n'))
        controller.close()
      } catch (error) {
        const errorEvent = `event: error\ndata: ${JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error'
        })}\n\n`
        controller.enqueue(encoder.encode(errorEvent))
        controller.error(error)
      }
    }
  })
}

/**
 * Utility to consume a stream in the client
 */
export async function consumeStream<T>(
  stream: ReadableStream<T>,
  onChunk: (chunk: T) => void | Promise<void>
): Promise<void> {
  const reader = stream.getReader()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      await onChunk(value)
    }
  } finally {
    reader.releaseLock()
  }
}